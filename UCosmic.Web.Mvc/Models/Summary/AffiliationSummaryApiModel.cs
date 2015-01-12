using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class AffiliationSummaryApiQueryResultModel
    {
        public int AffiliationId { get; set; }
        public string personId { get; set; }
        public string institution { get; set; }
        //public string placeId { get; set; }
    }
    public class AffiliationSummaryApiModel
    {
        //public int LocationCount { get; set; }
        public int PersonCount { get; set; }
        public int EstablishmentCount { get; set; }
        public int AffiliationCount { get; set; }

    }
}