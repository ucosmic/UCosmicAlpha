using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeSummaryApiQueryResultModel
    {
        public int degreeId { get; set; }
        public string personId { get; set; }
        public string establishmentId { get; set; }
        //public string placeId { get; set; }
    }
    public class DegreeSummaryApiModel
    {
        //public int LocationCount { get; set; }
        public int PersonCount { get; set; }
        public int EstablishmentCount { get; set; }
        public int DegreeCount { get; set; }

    }

    public class DegreeMapSummaryApiQueryResultModel
    {
        public int id { get; set; }
        public string officialName { get; set; }
        public string countryCode { get; set; }
    }
    public class DegreeMapSummaryApiModel
    {
        public int LocationCount { get; set; }
        //public int TypeCount { get; set; }
        public string CountryCode { get; set; }
        //public string officialName { get; set; }
    }
}