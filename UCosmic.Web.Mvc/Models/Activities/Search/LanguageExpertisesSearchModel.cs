using System.Collections.Generic;
using System.Web.Mvc;
using UCosmic.Domain.LanguageExpertises;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageExpertiseSearchModel
    {
        public string Domain { get; set; }
        public LanguageExpertisesSearchInputModel Input { get; set; }
        //public PagedQueryResult<LanguageExpertise> Output { get; set; }
        //public List<LanguageExpertise> Output2 { get; set; }
        public PageOfLanguageExpertiseSearchResultModel Output { get; set; }
        public IEnumerable<SelectListItem> LanguageOptions { get; set; }
    }
}