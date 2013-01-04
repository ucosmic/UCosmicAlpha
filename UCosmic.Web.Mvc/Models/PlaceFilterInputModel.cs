using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class PlaceFilterInputModel
    {
        public int? ParentId { get; set; }
        public bool? IsCountry { get; set; }
        public bool? IsContinent { get; set; }
        public bool? IsAdmin1 { get; set; }
    }

    public static class PlaceFilterInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PlaceFilterInputModel, FilteredPlaces>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())
                ;
            }
        }
    }
}