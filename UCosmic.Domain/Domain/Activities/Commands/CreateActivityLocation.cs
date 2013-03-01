using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityLocation
    {
        public int ActivityValuesId { get; set; }
        public int PlaceId { get; set; }

        public ActivityLocation CreatedActivityLocation { get; protected internal set; }
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
            if (activityValues == null) { throw new Exception("ActivityValues Id " + command.ActivityValuesId.ToString() + " was not found."); }

            Place place = _entities.Get<Place>().Single(x => x.RevisionId == command.PlaceId);
            if (place == null) { throw new Exception("Place Id " + command.PlaceId.ToString() + " was not found."); }

            var activityLocation = new ActivityLocation
            {
                ActivityValuesId = activityValues.RevisionId,
                PlaceId = place.RevisionId,
            };

            _entities.Create(activityLocation);

            //activityValues.Locations.Add(activityLocation);
            //_entities.Update(activityValues);

            command.CreatedActivityLocation = activityLocation;
        }
    }
}

