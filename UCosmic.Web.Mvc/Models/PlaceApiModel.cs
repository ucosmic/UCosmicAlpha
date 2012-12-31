using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class PlaceApiModel
    {
        public int Id { get; set; }
        public string OfficialName { get; set; }
        public MapPointModel Center { get; set; }
        public MapBoxModel Box { get; set; }
        public bool IsEarth { get; set; }
        public bool IsContinent { get; set; }
        public bool IsCountry { get; set; }
        public bool IsAdmin1 { get; set; }
        public bool IsAdmin2 { get; set; }
        public bool IsAdmin3 { get; set; }
        public string CountryCode { get; set; }

        public string PlaceTypeEnglishName { get; set; }
    }

    public static class PlaceApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Place, PlaceApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Box, o => o.MapFrom(s => s.BoundingBox))
                    .ForMember(d => d.CountryCode, o => o.MapFrom(s => s.GeoPlanetPlace.Country.Code))
                    .ForMember(d => d.PlaceTypeEnglishName, o => o.MapFrom(s => s.GeoPlanetPlace.Type.EnglishName))
                ;
            }
        }
    }
}