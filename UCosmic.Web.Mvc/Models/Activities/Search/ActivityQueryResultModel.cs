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
    //public class ActivityMapCountsAllApiQueryResultModel
    //{
    //    public int id { get; set; }
    //    public string name { get; set; }
    //}
}