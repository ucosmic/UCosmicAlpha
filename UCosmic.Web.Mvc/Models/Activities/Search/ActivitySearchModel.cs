using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchModel
    {
        public ActivitySearchInputModel Input { get; set; }
        public PageOfActivitySearchResultModel Output { get; set; }
        public IEnumerable<SelectListItem> CountryOptions { get; set; }
    }
}