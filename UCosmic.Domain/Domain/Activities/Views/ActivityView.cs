using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Activities
{
    class ActivityView
    {
        public string ModeText { get; set; }
        public int[] PlaceIds { get; set; }
        public int[] AffiliatedEstablishmentIds { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }

        public ActivityView(Activity entity)
        {
            ModeText = entity.ModeText;

            var values = entity.Values.Single(v => v.ModeText == ModeText);

            ICollection<int> placeIds = new Collection<int>();
            foreach (var location in values.Locations)
            {
                placeIds.Add(location.PlaceId);
            }
            PlaceIds = placeIds.ToArray();

            ICollection<int> affiliatedEstablishmentIds = new Collection<int>();
            foreach (var affiliation in entity.Person.Affiliations)
            {
                affiliatedEstablishmentIds.Add(affiliation.EstablishmentId);
            }
            AffiliatedEstablishmentIds = affiliatedEstablishmentIds.ToArray();

            StartsOn = values.StartsOn;
            EndsOn = values.EndsOn;
            OnGoing = values.OnGoing;
        }
    }
}
