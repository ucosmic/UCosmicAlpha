using AutoMapper;
using System.Collections.Generic;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementSummaryApiQueryResultModel
    {
        public int id { get; set; }
        public int id2 { get; set; }
        public string officialName { get; set; }
        public string type { get; set; }
        public string type2 { get; set; }
        public int place_id { get; set; }
    }

    public class AgreementSummaryApiModel
    {
        public List<AgreementSummaryItemsApiModel> items { get; set; }
        public int LocationCount { get; set; }
        public int TypeCount { get; set; }

    }
    public class AgreementSummaryItemsApiModel
    {
        public int LocationCount { get; set; }
        public int TypeCount { get; set; }
        public string Type { get; set; }
        public int TypeId { get; set; }

        //public ActivityLocationsApiModel(int locationCount, int typeCount, string type)//cannot use a constructor because it creates an error with the JSON return...
        //{
        //    LocationCount = locationCount;
        //    TypeCount = typeCount;
        //    Type = type;
        //}
    }

    public class AgreementMapSummaryApiQueryResultModel
    {
        public int id { get; set; }
        public string officialName { get; set; }
        public string countryCode { get; set; }
    }
    public class AgreementMapSummaryApiModel
    {
        public int LocationCount { get; set; }
        public string CountryCode { get; set; }
        //public string officialName { get; set; }
    }
}