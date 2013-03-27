using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class MapPointModel
    {
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool HasValue
        {
            get { return Latitude.HasValue && Longitude.HasValue; }
        }
    }

    public static class MapPointProfiler
    {
        public class DomainToModelProfile: Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<Coordinates, MapPointModel>();
            }
        }
    }
}