using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeSearchSummary
    {
        public int People_Count { get; set; }
        public int Institution_Count { get; set; }
        public int Country_Count { get; set; }
    }
    public class DegreeQueryResultsSearchSummary
    {
        public int person_id { get; set; }
        public int establishment_id { get; set; }
        public int country_id { get; set; }
        public int degree_id { get; set; }
    }
    public class DegreeSearchModel
    {
        public string Domain { get; set; }
        public DegreesSearchInputModel Input { get; set; }
        public PageOfDegreeSearchResultModel Output { get; set; }
        public IEnumerable<SelectListItem> CountryOptions { get; set; }
        public DegreeSearchSummary Summary { get; set; }

    }
}