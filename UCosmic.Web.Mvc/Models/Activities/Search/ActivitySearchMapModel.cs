using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchMapModel
    {
        //public ActivitySearchResultMapModel[] Output { get; set; }
        public string Domain { get; set; }
        public ActivitySearchInputModel Input { get; set; }
        //public IEnumerable<ActivitySearchMapPlaceModel> Continents { get; set; }
        //public PageOfActivitySearchResultMapModel Output { get; set; }
        public IEnumerable<ActivityTypeModel> ActivityTypes { get; set; }
    }
}