using System.Linq;
using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentLocationApiModel
    {
        public MapPointModel Center { get; set; }
        public MapBoxModel Box { get; set; }
        public int? GoogleMapZoomLevel { get; set; }
        public PlaceApiModel[] Places { get; set; }
    }

    public class EstablishmentLocationPutModel
    {
        public MapPointModel Center { get; set; }
        public MapBoxModel Box { get; set; }
        public int? GoogleMapZoomLevel { get; set; }
        public int? PlaceId { get; set; }
    }

    public static class EstablishmentLocationApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentLocation, EstablishmentLocationApiModel>()
                    .ForMember(d => d.Box, o => o.MapFrom(s => s.BoundingBox))
                    .ForMember(d => d.Places, o => o.ResolveUsing(s =>
                        s.Places == null ? null : s.Places.OrderBy(x => x.Ancestors.Count)))
                ;
            }
        }

        public class PutModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentLocationPutModel, UpdateEstablishmentLocation>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.Ignore())
                ;
            }
        }
    }
}