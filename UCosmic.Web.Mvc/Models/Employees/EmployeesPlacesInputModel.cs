using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeesPlacesInputModel
    {
        public EmployeesPlacesInputModel()
        {
            PlaceIds = new int[0];
        }

        public bool Countries { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
        public bool PlaceAgnostic { get; set; }
    }
}