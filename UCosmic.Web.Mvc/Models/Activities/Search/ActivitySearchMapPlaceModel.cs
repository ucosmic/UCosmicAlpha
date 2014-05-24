using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchMapPlaceModel
    {
        //public int Id { get; set; }
        public int? ContinentId { get; set; }
        public string ContinentCode { get; set; }
        public int? CountryId { get; set; }
        public string CountryCode { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        //public int[] AgreementIds { get; set; }
        //public int[] PartnerIds { get; set; }
        public bool IsEarth { get; set; }
        public bool IsContinent { get; set; }
        public bool IsCountry { get; set; }
        //public bool IsAdmin1 { get; set; }
        //public bool IsAdmin2 { get; set; }
        //public bool IsAdmin3 { get; set; }
        public int Count { get; set; }
        //public PlaceApiModel[] Ancestors { get; set; } // eager loading this slows down query
        //public MapPointModel Center { get; set; }
        public MapPointModel Center { get; set; }
        public MapBoxModel BoundingBox { get; set; }
    }
    //public static class ActivitySearchMapPlaceProfiler
    //{
    //    public class QueryResultToModelProfile : Profile
    //    {
    //        protected override void Configure()
    //        {
    //            CreateMap<AgreementPartnerPlaceResult, ActivitySearchMapPlaceModel>()
    //                .ForMember(d => d.Id, o => o.MapFrom(s => s.Place.RevisionId))
    //                .ForMember(d => d.Name, o => o.MapFrom(s => s.Place.OfficialName))
    //                .ForMember(d => d.Type, o => o.MapFrom(s => s.Place.GeoPlanetPlace != null ? s.Place.GeoPlanetPlace.Type.EnglishName : null))
    //                //.ForMember(d => d.Ancestors, o => o.MapFrom(s => s.Place.Ancestors
    //                //    .OrderByDescending(x => x.Separation)
    //                //    .Select(x => x.Ancestor)
    //                //    .Where(x => !x.IsEarth)
    //                //))
    //                .ForMember(d => d.Center, o => o.MapFrom(s => s.Place.Center))
    //                .ForMember(d => d.BoundingBox, o => o.MapFrom(s => s.Place.BoundingBox))
    //                .ForMember(d => d.IsEarth, o => o.MapFrom(s => s.Place.IsEarth))
    //                .ForMember(d => d.IsContinent, o => o.MapFrom(s => s.Place.IsContinent))
    //                .ForMember(d => d.IsCountry, o => o.MapFrom(s => s.Place.IsCountry))
    //                .ForMember(d => d.IsAdmin1, o => o.MapFrom(s => s.Place.IsAdmin1))
    //                .ForMember(d => d.IsAdmin2, o => o.MapFrom(s => s.Place.IsAdmin2))
    //                .ForMember(d => d.IsAdmin3, o => o.MapFrom(s => s.Place.IsAdmin3))
    //                .ForMember(d => d.ContinentId, o => o.ResolveUsing(s =>
    //                {
    //                    if (s.Place.IsContinent) return s.Place.RevisionId;
    //                    return s.Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                        ? s.Place.Ancestors.First(x => x.Ancestor.IsContinent).AncestorId : default(int?);
    //                }))
    //                .ForMember(d => d.ContinentCode, o => o.ResolveUsing(s =>
    //                {
    //                    if (s.Place.IsContinent) return s.Place.GeoNamesToponym.ContinentCode;
    //                    return s.Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                        ? s.Place.Ancestors.First(x => x.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : null;
    //                }))
    //                .ForMember(d => d.CountryId, o => o.ResolveUsing(s =>
    //                {
    //                    if (s.Place.IsCountry) return s.Place.RevisionId;
    //                    return s.Place.Ancestors.Any(x => x.Ancestor.IsCountry)
    //                        ? s.Place.Ancestors.First(x => x.Ancestor.IsCountry).AncestorId : default(int?);
    //                }))
    //                .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
    //                {
    //                    if (s.Place.IsCountry) return s.Place.GeoPlanetPlace.Country.Code;
    //                    return s.Place.Ancestors.Any(x => x.Ancestor.IsCountry)
    //                        ? s.Place.Ancestors.First(x => x.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Country.Code : null;
    //                }))
    //            ;
    //        }
    //    }
    //}
}