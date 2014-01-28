using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeSearchModel
    {
        public string Domain { get; set; }
        public DegreesSearchInputModel Input { get; set; }
        public PageOfDegreeSearchResultModel Output { get; set; }
        public IEnumerable<SelectListItem> CountryOptions { get; set; }
    }
}