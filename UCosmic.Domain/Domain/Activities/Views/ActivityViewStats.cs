using System.Collections.Generic;

namespace UCosmic.Domain.Activities
{
    public class ActivityViewStats
    {
        public class TypeCount
        {
            public int TypeId { get; set; }
            public string Type { get; set; }
            public int Count { get; set; }
        }

        public class PlaceCount
        {
            public int PlaceId { get; set; }
            public string CountryCode { get; set; }
            public string OfficialName { get; set; }
            public int Count { get; set; }
        }

        public int EstablishmentId { get; set; }
        public int CountOfPlaces { get; set; }
        public int Count { get; set; }
        public ICollection<TypeCount> TypeCounts { get; set; }
        public ICollection<PlaceCount> PlaceCounts { get; set; }
    }
}
