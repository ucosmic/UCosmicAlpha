using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchMapModel
    {
        public string Domain { get; set; }
        public ActivitySearchInputModel Input { get; set; }
        public PageOfActivitySearchResultMapModel Output { get; set; }
        public IEnumerable<ActivityTypeModel> ActivityTypes { get; set; }
    }
}