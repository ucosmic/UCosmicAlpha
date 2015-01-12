using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class ExpertiseSummaryApiQueryResultModel
    {
        public int ExpertiseId { get; set; }
        public string personId { get; set; }
        public string description { get; set; }
        //public string placeId { get; set; }
    }
    public class ExpertiseSummaryApiModel
    {
        public int LocationCount { get; set; }
        public int PersonCount { get; set; }
        //public int EstablishmentCount { get; set; }
        public int ExpertiseCount { get; set; }

    }
}