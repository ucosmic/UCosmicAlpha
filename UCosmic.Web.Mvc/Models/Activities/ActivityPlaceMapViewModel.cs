using AutoMapper;
using UCosmic.Domain.Activities;

using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPlaceMapViewModel
    {
        public string PlaceName { get; set; }
        public string CountryName { get; set; }
        public string ContinentName { get; set; }
        public string CountryCode { get; set; }
        public string ContinentCode { get; set; }
        public MapPointModel PlaceCenter { get; set; }
    }

    public static class ActivityPlaceMapViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityLocation, ActivityPlaceMapViewModel>()
                    .ForMember(d => d.CountryName, o => o.MapFrom(s => s.Place.GeoPlanetPlace.Country.Name))
                    //.ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym.ToponymName)))
                    .ForMember(d => d.CountryCode, o => o.MapFrom(s => s.Place.GeoPlanetPlace.Country.Code))
                    //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    .ForMember(d => d.ContinentCode, o => o.MapFrom(s => s.Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : null))
                    .ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.OfficialName : null))
                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Place.OfficialName))
                ;
            }
        }
    }
}