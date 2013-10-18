using System.Linq;
using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class CountryApiModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int? ContinentId { get; set; }
        public string ContinentCode { get; set; }
        public string ContinentName { get; set; }
        public MapBoxModel Box { get; set; }
    }

    public static class CountryApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<Place, CountryApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.OfficialName))
                    .ForMember(d => d.Code, o => o.MapFrom(s => s.GeoPlanetPlace.Country.Code))
                    .ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    .ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    .ForMember(d => d.ContinentCode, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : null))
                    .ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.OfficialName : null))
                    .ForMember(d => d.Box, o => o.MapFrom(s => s.BoundingBox))
                ;
            }
        }
    }

}