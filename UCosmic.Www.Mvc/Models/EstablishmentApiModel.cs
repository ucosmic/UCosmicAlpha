using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Www.Mvc.Models
{
    public class EstablishmentApiModel
    {
        public int RevisionId { get; set; }
        public string OfficialName { get; set; }
        public string WebsiteUrl { get; set; }
        public string CountryName { get; set; }
    }

    public static class EstablishmentApiProfiler
    {
        public class ViewToModelProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentView, EstablishmentApiModel>();
            }
        }

        public class PagedViewResultToPageOfModelsProfiler
            : PagedQueryResultToPageOfItemsProfiler<EstablishmentView, EstablishmentApiModel>
        {
        }
    }
}