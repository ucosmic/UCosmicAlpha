using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class CountryApiModel
    {
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public static class CountryApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<Place, CountryApiModel>()
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.OfficialName))
                    .ForMember(d => d.Code, o => o.MapFrom(s => s.GeoPlanetPlace.Country.Code))
                ;
            }
        }
    }

}