using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivity
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public string ModeText { get; protected set; }
        public int Number { get; set; }
        public ActivityValues Values { get; set; }
        public bool NoCommit { get; set; }

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
        public ValidateUpdateActivityCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivity(entities, x => x.Id)
                    .WithMessage(MustOwnActivity<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Activity id", x => x.Id)

                // id must exist in the database
                .MustFindActivityById(entities)
                    .WithMessage(MustFindActivityById.FailMessageFormat, x => x.Id);

            RuleFor(x => x.ModeText)
                .MustHaveActivityMode()
                    .WithMessage(MustHaveActivityMode.FailMessage);

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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<UpdateActivityValues> _updateActivityValues;
        private readonly IHandleCommands<CopyDeepActivityValues> _copyDeepActivityValues;
        private readonly IProcessEvents _eventProcessor;

        public HandleUpdateMyActivityCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<UpdateActivityValues> updateActivityValues
            , IHandleCommands<CopyDeepActivityValues> copyDeepActivityValues
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _updateActivityValues = updateActivityValues;
            _copyDeepActivityValues = copyDeepActivityValues;
            _eventProcessor = eventProcessor;
        }

        public void Handle(UpdateActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // Retrieve the activity to update.
            var target = _entities.Get<Activity>().Single(a => a.RevisionId == command.Id);

            // Attempt to get the ActivityValues of the command'ed type.
            var targetActivityValues = _entities.Get<ActivityValues>()
                .SingleOrDefault(v => v.ActivityId == target.RevisionId && v.ModeText == command.ModeText);

            if (targetActivityValues == null)
            {
                var copyDeepActivityValues = new CopyDeepActivityValues(command.Principal)
                {
                    Id = command.Values.RevisionId,
                    ActivityId = target.RevisionId,
                    Mode = command.ModeText.AsEnum<ActivityMode>()
                };
                _copyDeepActivityValues.Handle(copyDeepActivityValues);
                targetActivityValues = copyDeepActivityValues.CreatedActivityValues;
            }

            // If target fields equal new field values, we do not proceed.
            if (targetActivityValues.Equals(command.Values)) return;

            // Update fields
            target.Mode = command.ModeText.AsEnum<ActivityMode>();
            target.Number = command.Number;
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
                _unitOfWork.SaveChanges();

                _eventProcessor.Raise(new ActivityChanged
                {
                    ActivityId = target.RevisionId,
                    ActivityMode = target.Mode
                });
            }
        }
    }
}
