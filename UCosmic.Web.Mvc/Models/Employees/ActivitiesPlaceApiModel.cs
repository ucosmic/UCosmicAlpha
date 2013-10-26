using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitiesPlaceApiModel
    {
        public ActivitiesPlaceApiModel()
        {
            ActivityIds = new int[0];
        }

        public int PlaceId { get; set; }
        public string PlaceName { get; set; }
        public bool IsCountry { get; set; }
        public string CountryCode { get; set; }
        public IEnumerable<int> ActivityIds { get; set; }
    }
}