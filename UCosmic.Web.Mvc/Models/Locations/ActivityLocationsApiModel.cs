using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityLocationsApiQueryResultModel
    {
        public int id { get; set; }
        public string officialName { get; set; }
        public string type { get; set; }
    }
    public class ActivityLocationsApiModel
    {
        public int LocationCount { get; set; }
        public int TypeCount { get; set; }
        public string Type { get; set; }

        //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
        //{
        //    LocationCount = locationCount;
        //    TypeCount = typeCount;
        //    Type = type;
        //}
    }
}