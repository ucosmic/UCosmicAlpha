using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySnapshotApiQueryResultModel
    {
        public int id { get; set; }
        public int placeId { get; set; }
        public int personId { get; set; }
    }
    //public class ActivitySnapshotApiModel
    //{
    //    public int LocationCount { get; set; }
    //    public int TypeCount { get; set; }
    //    public int personId { get; set; }

    //    //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
    //    //{
    //    //    LocationCount = locationCount;
    //    //    TypeCount = typeCount;
    //    //    Type = type;
    //    //}
    //}
}