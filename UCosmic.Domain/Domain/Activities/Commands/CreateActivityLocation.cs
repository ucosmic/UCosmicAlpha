using System;
using System.Linq;
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

        public void Handle(CreateActivityLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            ActivityValues activityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.ActivityValuesId);

            if (activityValues == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("ActivityValues Id '{0}' was not found.", command.ActivityValuesId));
            }

            Place place = _entities.Get<Place>().Single(x => x.RevisionId == command.PlaceId);
            if (place == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("Place Id '{0}' was not found.", command.PlaceId));
            }

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

