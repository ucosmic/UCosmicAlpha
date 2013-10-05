using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityTag
    {
        public CreateActivityTag(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public string Text { get; set; }
        public IPrincipal Impersonator { get; set; }
    }

    public class ValidateCreateActivityTagCommand : AbstractValidator<CreateActivityTag>
    {
        public ValidateCreateActivityTagCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.Text)
                .NotEmpty().WithName("Activity tag text")
                .MustNotBeDuplicateActivityTag(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleCreateActivityTagCommand : IHandleCommands<CreateActivityTag>
    {
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _detachedEntities;
        private readonly IProcessQueries _queryProcessor;

        public HandleCreateActivityTagCommand(ICommandEntities entities, IQueryEntities detachedEntities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _detachedEntities = detachedEntities;
            _queryProcessor = queryProcessor;
        }

        public void Handle(CreateActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var domainType = ActivityTagDomainType.Custom;
            int? domainKey = null;

            // look up domain counterpart
            var establishmentNames = _queryProcessor.Execute(new EstablishmentNamesByKeyword
            {
                Keyword = command.Text.Trim(),
                KeywordMatchStrategy = StringMatchStrategy.Equals,
                PageSize = 10,
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                },
            });
            if (establishmentNames.Any())
            {
                var establishmentIds = establishmentNames.Select(x => x.ForEstablishment.RevisionId).Distinct().ToArray();
                if (establishmentIds.Length == 1)
                {
                    domainType = ActivityTagDomainType.Establishment;
                    domainKey = establishmentIds[0];
                }
            }

            if (!domainKey.HasValue)
            {
                var placeIds = _detachedEntities.Query<Place>()
                    .Where(x => x.OfficialName.Equals(command.Text.Trim(), StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.RevisionId)
                    .ToArray();
                if (placeIds.Length == 1)
                {
                    domainType = ActivityTagDomainType.Place;
                    domainKey = placeIds[0];
                }
            }

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Tags),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            values.Tags.Add(new ActivityTag
            {
                Text = command.Text.Trim(),
                DomainType = domainType,
                DomainKey = domainKey,
            });
            activity.UpdatedOnUtc = DateTime.UtcNow;
            activity.UpdatedByPrincipal = command.Impersonator == null
                ? command.Principal.Identity.Name
                : command.Impersonator.Identity.Name;

            _entities.SaveChanges();
        }
    }
}
