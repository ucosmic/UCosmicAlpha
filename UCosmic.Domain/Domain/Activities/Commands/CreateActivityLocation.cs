using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityLocation
    {
        public ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }
        public Place Place  { get; set; }
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

            ActivityValues activityValues = command.ActivityValues;
            if (activityValues == null)
            {
                activityValues = _entities.Get<ActivityValues>().Single(x => x.Id == command.ActivityValuesId);
                if (activityValues == null) { throw new Exception("ActivityValues Id " + command.ActivityValuesId.ToString() + " was not found."); }
            }

            Place place = command.Place;
            if (place == null)
            {
                place = _entities.Get<Place>().Single(x => x.RevisionId == command.PlaceId);
                if (place == null) { throw new Exception("Place Id " + command.PlaceId.ToString() + " was not found."); }
            } 

            var activityLocation = new ActivityLocation
            {
                ActivityValues = activityValues,
                Place = place,
            };

            _entities.Create(activityLocation);

            command.CreatedActivityLocation = activityLocation;
        }
    }
}

