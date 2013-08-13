using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityView
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public string ModeText { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
        public IEnumerable<int> EstablishmentIds { get; set; }
        public IEnumerable<int> TypeIds { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }

        public ActivityView(Activity entity)
        {
            Id = entity.RevisionId;
            PersonId = entity.PersonId;
            ModeText = entity.ModeText;
            var values = entity.Values.Single(v => v.ModeText == ModeText);

            {
                ICollection<int> placeIds = new List<int>();
                foreach (var location in values.Locations)
                {
                    placeIds.Add(location.PlaceId);
                }
                PlaceIds = placeIds.ToArray();
            }

            {
                ICollection<int> establishmentIds = new List<int>();
                establishmentIds.Add(entity.Person.DefaultAffiliation.EstablishmentId);
                var ancestorIds =
                    entity.Person.Affiliations.SelectMany(x => x.Establishment.Ancestors).Select(x => x.AncestorId);
                foreach (var ancestorId in ancestorIds)
                {
                    establishmentIds.Add(ancestorId);
                }

                foreach (var affiliation in entity.Person.Affiliations)
                {
                    if (affiliation.CampusId.HasValue)
                    {
                        establishmentIds.Add(affiliation.CampusId.Value);
                    }

                    if (affiliation.CollegeId.HasValue)
                    {
                        establishmentIds.Add(affiliation.CollegeId.Value);
                    }

                    if (affiliation.DepartmentId.HasValue)
                    {
                        establishmentIds.Add(affiliation.DepartmentId.Value);
                    }
                }

                EstablishmentIds = establishmentIds.Distinct().ToArray();
            }

            {
                ICollection<int> typeIds = new List<int>();
                foreach (var type in values.Types)
                {
                    typeIds.Add(type.TypeId);
                }
                TypeIds = typeIds;
            }

            StartsOn = values.StartsOn;
            EndsOn = values.EndsOn;
            OnGoing = values.OnGoing;
        }
    }
}
