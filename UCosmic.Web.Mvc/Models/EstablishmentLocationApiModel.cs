using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentLocationApiModel
    {
        public MapPointModel Center { get; set; }
        public MapBoxModel Box { get; set; }
    }

    public static class EstablishmentLocationApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentLocation, EstablishmentLocationApiModel>()
                    .ForMember(d => d.Box, o => o.MapFrom(s => s.BoundingBox));
            }
        }
    }
}