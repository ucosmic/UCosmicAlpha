using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class PeoplePlacesInputModel
    {
        public PeoplePlacesInputModel()
        {
            PlaceIds = new int[0];
        }

        public bool? Countries { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
    }
}