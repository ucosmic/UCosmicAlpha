using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class PeoplePlaceApiModel
    {
        public PeoplePlaceApiModel()
        {
            PersonIds = new int[0];
        }

        public int PlaceId { get; set; }
        public string PlaceName { get; set; }
        public bool IsCountry { get; set; }
        public string CountryCode { get; set; }
        public IEnumerable<int> PersonIds { get; set; }
    }
}