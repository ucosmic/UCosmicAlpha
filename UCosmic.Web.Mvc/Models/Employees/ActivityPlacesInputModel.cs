using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPlacesInputModel
    {
        public ActivityPlacesInputModel()
        {
            PlaceIds = new int[0];
        }

        public bool? Countries { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
    }
}