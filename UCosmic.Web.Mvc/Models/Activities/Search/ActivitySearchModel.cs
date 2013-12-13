using System;
using System.Collections.Generic;
using System.Web.Mvc;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchModel
    {
        public ActivitySearchInputModel Input { get; set; }
        public PageOfActivitySearchResultModel Output { get; set; }
        public IEnumerable<SelectListItem> CountryOptions { get; set; }
    }

    public class ActivitySearchInputModel : BaseSearchInputModel
    {
        public string CountryCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
    }

    public class ActivitySearchResultModel
    {
        public ActivityMode Mode { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public ActivityTypeViewModel[] Types { get; set; }
        public ActivityPlaceViewModel[] Places { get; set; }
        public ActivitySearchResultOwnerModel Owner { get; set; }

        public class ActivitySearchResultOwnerModel
        {
            public int PersonId { get; set; }
            public string DisplayName { get; set; }
        }
    }

    public class PageOfActivitySearchResultModel : PageOf<ActivitySearchResultModel>
    {
    }
}