using AutoMapper;
using System.Collections.Generic;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySummaryApiQueryResultModel
    {
        public int id { get; set; }
        public string officialName { get; set; }
        public string type { get; set; }
        public int type_id { get; set; }
        public int person_id { get; set; }
    }
    public class ActivitySummaryApiModel
    {
        public int TotalLocations { get; set; }
        public int TotalActivities { get; set; }
        public int TotalPeople { get; set; }
        public List<ActivitySummaryTypesApiModel> ActivitySummaryTypes { get; set; }

        //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
        //{
        //    LocationCount = locationCount;
        //    TypeCount = typeCount;
        //    Type = type;
        //}
    }
    public class ActivitySummaryTypesApiModel
    {
        public int LocationCount { get; set; }
        public int TypeCount { get; set; }
        public int PersonCount { get; set; }
        public string Type { get; set; }
        public int TypeId { get; set; }

        //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
        //{
        //    LocationCount = locationCount;
        //    TypeCount = typeCount;
        //    Type = type;
        //}
    }

    public class ActivityMapSummaryApiQueryResultModel
    {
        public int id { get; set; }
        public string officialName { get; set; }
        public string countryCode { get; set; }
        //public string type { get; set; }
    }
    public class ActivityMapSummaryApiModel
    {
        public int LocationCount { get; set; }
        //public int TypeCount { get; set; }
        public string CountryCode { get; set; }
        //public string officialName { get; set; }
        //public string Type { get; set; }
        //public int TypeId { get; set; }

        //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
        //{
        //    LocationCount = locationCount;
        //    TypeCount = typeCount;
        //    Type = type;
        //}
    }
}