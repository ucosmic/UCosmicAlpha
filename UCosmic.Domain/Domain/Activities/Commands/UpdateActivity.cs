using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivity
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public string ModeText { get; protected set; }
        public ActivityValues Values { get; set; }
        internal bool NoCommit { get; set; }

        public UpdateActivity(IPrincipal principal, int id, string modeText)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            ModeText = modeText;
        }
    }

    public class ValidateUpdateActivityCommand : AbstractValidator<UpdateActivity>
    {
        public ValidateUpdateActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                // id must exist in the database
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustOwnActivity(queryProcessor, x => x.Id);

            RuleFor(x => x.ModeText)
                .NotEmpty().WithName("Activity mode")
                .MustHaveActivityMode();

            When(x => x.Values != null, () =>
                RuleFor(x => x.Values.Title)
                    .Length(0, ActivityValuesConstraints.TitleMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Title", x => ActivityValuesConstraints.TitleMaxLength, x => x.Values.Title.Length)
            );
        }
    }

    public class HandleUpdateMyActivityCommand : IHandleCommands<UpdateActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateActivityValues> _updateActivityValues;
        private readonly IHandleCommands<CopyActivityValues> _copyActivityValues;
        private readonly IHandleCommands<MoveActivityDocuments> _moveActivityDocuments;

        public HandleUpdateMyActivityCommand(ICommandEntities entities
            , IHandleCommands<UpdateActivityValues> updateActivityValues
            , IHandleCommands<CopyActivityValues> copyActivityValues
            , IHandleCommands<MoveActivityDocuments> moveActivityDocuments
        )
        {
            _entities = entities;
            _updateActivityValues = updateActivityValues;
            _copyActivityValues = copyActivityValues;
            _moveActivityDocuments = moveActivityDocuments;
        }

        public void Handle(UpdateActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // are we updating the original or the work copy?

            // Retrieve the activity to update.
            var target = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                })
                .Single(a => a.RevisionId == command.Id);

            // Attempt to get the ActivityValues of the command'ed type.
            //var targetActivityValues = _entities.Get<ActivityValues>()
            //    .SingleOrDefault(v => v.ActivityId == target.RevisionId && v.ModeText == command.ModeText);
            var targetActivityValues = target.Values.SingleOrDefault(x => x.ModeText == command.ModeText);

            if (targetActivityValues == null) // happens when publishing for the first time, and commits
            {
                var copyActivityValues = new CopyActivityValues(command.Principal)
                {
                    ActivityValuesId = command.Values.RevisionId,
                    CopyToActivityId = target.RevisionId,
                    Mode = command.ModeText.AsEnum<ActivityMode>(),
                };
                _copyActivityValues.Handle(copyActivityValues);
                targetActivityValues = copyActivityValues.CreatedActivityValues;
            }

            // Update fields
            target.Mode = command.ModeText.AsEnum<ActivityMode>();
            target.UpdatedOnUtc = DateTime.UtcNow;
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            // Update activity values (for this mode)
            var updateActivityValuesCommand = new UpdateActivityValues(command.Principal, targetActivityValues.RevisionId)
            {
                Title = command.Values.Title,
                Content = command.Values.Content,
                StartsOn = command.Values.StartsOn,
                EndsOn = command.Values.EndsOn,
                OnGoing = command.Values.OnGoing,
                DateFormat = command.Values.DateFormat,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                WasExternallyFunded = command.Values.WasExternallyFunded,
                WasInternallyFunded = command.Values.WasInternallyFunded,
                Locations = command.Values.Locations ?? new Collection<ActivityLocation>(),
                Types = command.Values.Types ?? new Collection<ActivityType>(),
                Tags = command.Values.Tags ?? new Collection<ActivityTag>(),
                Documents = command.Values.Documents ?? new Collection<ActivityDocument>(),
                NoCommit = true
            };

            _updateActivityValues.Handle(updateActivityValuesCommand);

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _entities.SaveChanges();
                _moveActivityDocuments.Handle(new MoveActivityDocuments(target.RevisionId));
                //_eventProcessor.Raise(new ActivityChanged
                //{
                //    ActivityId = target.RevisionId,
                //    ActivityMode = target.Mode
                //});
            }
        }
    }
}
