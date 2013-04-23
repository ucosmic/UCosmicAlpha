using System;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityLocation
    {
        public int ActivityValuesId { get; set; }
        public int PlaceId { get; set; }
        public bool NoCommit { get; set; }
        public ActivityLocation CreatedActivityLocation { get; set; }
    }

    public class HandleCreateActivityLocationCommand : IHandleCommands<CreateActivityLocation>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityLocationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public class ValidateCreateActivityLocationCommand : AbstractValidator<CreateActivityLocation>
        {
            public ValidateCreateActivityLocationCommand(IQueryEntities entities)
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

                RuleFor(x => x.PlaceId)
                    // place id must be within valid range
                    .GreaterThanOrEqualTo(1)
                        .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "PlaceId id", x => x.PlaceId)

                    // place id must exist in the database
                    .MustFindPlaceById(entities)
                        .WithMessage(MustFindPlaceById.FailMessageFormat, x => x.PlaceId)
                ;
            }
        }

        public void Handle(CreateActivityLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityValues = _entities.Get<ActivityValues>()
                .Single(x => x.RevisionId == command.ActivityValuesId);

            var place = _entities.Get<Place>()
                .Single(x => x.RevisionId == command.PlaceId);

            var activityLocation = new ActivityLocation
            {
                ActivityValuesId = activityValues.RevisionId,
                PlaceId = place.RevisionId,
            };

            command.CreatedActivityLocation = activityLocation;

            if (!command.NoCommit)
            {
                _entities.Create(activityLocation);
            }
        }
    }
}

