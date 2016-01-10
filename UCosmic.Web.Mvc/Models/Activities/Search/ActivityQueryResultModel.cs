using System;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityQueryResultModel
    {
        public int id { get; set; }
        public int personId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string displayName { get; set; }
        public string locationName { get; set; }
        public string type { get; set; }
        public int typeId { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime EndsOn { get; set; }
        public string StartsOnFormat { get; set; }
        public string EndsOnFormat { get; set; }
        public string title { get; set; }
        public bool onGoing { get; set; }
    }
    public class ActivityTypesApiQueryResultModel
    {
        public int id { get; set; }
        public string type { get; set; }
        public int rank { get; set; }
    }
    public class ActivityTypesApiCountsModel
    {
        public int activityTypeId { get; set; }
        public string text { get; set; }
        public bool hasIcon { get; set; }
        public string iconSrc { get; set; }
        public int count { get; set; }
        public int peopleCount { get; set; }
    }
    public class ActivityYearApiCountsModel
    {
        public int year { get; set; }
        public int count { get; set; }
        public int peopleCount { get; set; }
    }
}