using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityTag
    {
        public IPrincipal Principal { get; protected set; }
        public int ActivityValuesId { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public ActivityTagDomainType DomainType { get; set; }
        public int? DomainKey { get; set; }
        public ActivityMode Mode { get; set; }
        public bool NoCommit { get; set; }

        public CreateActivityTag(IPrincipal principal)
        {
            Principal = principal;
            DomainType = ActivityTagDomainType.Custom;
        }

        public ActivityTag CreatedActivityTag { get; protected internal set; }
    }

    public class ValidateCreateActivityTagCommand : AbstractValidator<CreateActivityTag>
    {
        public ValidateCreateActivityTagCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityValuesId)
                // activity id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityValues id", x => x.ActivityValuesId)

                // activity id must exist in the database
                .MustFindActivityValuesById(entities)
                    .WithMessage(MustFindActivityValuesById.FailMessageFormat, x => x.ActivityValuesId)
            ;
        }
    }

    public class HandleCreateActivityTagCommand : IHandleCommands<CreateActivityTag>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateActivityTagCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityValues = _entities.Get<ActivityValues>()
                .SingleOrDefault(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null)
            {
                var message = String.Format("ActivityValues Id {0} not found.", command.ActivityValuesId);
                throw new Exception(message);
            }

            var person = _entities.Get<Person>()
                .Single(p => p.RevisionId == activityValues.Activity.Person.RevisionId);

            //var otherActivities = _entities.Get<Activity>()
            //                               .WithPersonId(person.RevisionId)
            //                               .WithMode(command.Mode.AsSentenceFragment());

            var activityTag = new ActivityTag
            {
                ActivityValuesId = activityValues.RevisionId,
                //Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Text = command.Text,
                DomainType = command.DomainType,
                DomainKey = command.DomainKey,
                Mode = command.Mode,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            _entities.Create(activityTag);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedActivityTag = activityTag;
        }
    }
}

