using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class MapBoxModel
    {
        public MapPointModel NorthEast { get; set; }
        public MapPointModel SouthWest { get; set; }
        public bool HasValue
        {
            get
            {
                return NorthEast != null && NorthEast.HasValue
                    && SouthWest != null && SouthWest.HasValue;
            }
        }
    }

    public static class MapBoxProfiler
    {
        public class DomainToModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<BoundingBox, MapBoxModel>();
            }
        }
    }
}