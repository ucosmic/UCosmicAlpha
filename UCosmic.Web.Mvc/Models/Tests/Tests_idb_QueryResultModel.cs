using System;
using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Models
{
    public class Tests_idb_QueryResultModel
    {
        public int id { get; set; }
        public int personId { get; set; }
        public int place_id { get; set; }
        public string firstNameSort { get; set; }
        public string lastNameSort { get; set; }
        public string displayName { get; set; }
        //public string locationName { get; set; }
        //public string type { get; set; }
        public int typeId { get; set; }
        //public DateTime StartsOn { get; set; }
        //public DateTime EndsOn { get; set; }
        public DateTime StartsOnCalc { get; set; }
        public DateTime EndsOnCalc { get; set; }
        public string StartsOnFormat { get; set; }
        public string EndsOnFormat { get; set; }
        public string title { get; set; }
        public bool onGoing { get; set; }
        //public string place2officialname { get; set; }
        public string id_name { get; set; }
        public string tag_text { get; set; }
        public string contentsearchable { get; set; }
    }

    public class Tests_idb_return_model
    {
        public int id { get; set; }
        public int personId { get; set; }
        public int[] person_affiliations { get; set; }
        public int[] place_ids { get; set; }
        public string firstNameSort { get; set; }
        public string lastNameSort { get; set; }
        public string displayName { get; set; }
       
        //public string locationName { get; set; }
        //public string type { get; set; }
        public int[] typeIds { get; set; }
        //public DateTime StartsOn { get; set; }
        //public DateTime EndsOn { get; set; }
        public DateTime StartsOnCalc { get; set; }
        public DateTime EndsOnCalc { get; set; }
        public string StartsOnFormat { get; set; }
        public string EndsOnFormat { get; set; }
        public string title { get; set; }
        public bool onGoing { get; set; }
        //public string place2officialname { get; set; }
        public string id_name { get; set; }
        public string tag_text { get; set; }
        public string contentsearchable { get; set; }
    }

    public class Tests_idb_person_affiliation_QueryResultModel
    {
        public int personId { get; set; }
        public int establishmentId { get; set; }
    }

    //public class ActivityTypesApiQueryResultModel
    //{
    //    public int id { get; set; }
    //    public string type { get; set; }
    //    public int rank { get; set; }
    //}
    //public class ActivityTypesApiCountsModel
    //{
    //    public int activityTypeId { get; set; }
    //    public string text { get; set; }
    //    public bool hasIcon { get; set; }
    //    public string iconSrc { get; set; }
    //    public int count { get; set; }
    //    public int peopleCount { get; set; }
    //}
    //public class ActivityYearApiCountsModel
    //{
    //    public int year { get; set; }
    //    public int count { get; set; }
    //    public int peopleCount { get; set; }
    //}
}