using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeesPlaceApiModel
    {
        public EmployeesPlaceApiModel()
        {
            ActivityPersonIds = new int[0];
            ActivityIds = new int[0];
        }

        public int PlaceId { get; set; }
        public string PlaceName { get; set; }
        public bool IsCountry { get; set; }
        public string CountryCode { get; set; }
        public IEnumerable<int> ActivityPersonIds { get; set; }
        public IEnumerable<int> ActivityIds { get; set; }
    }
}