using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

//namespace UCosmic.Web.Mvc.Models
//{
    //public class ActivitySearchResultMapModel
    //{
    //    public int ActivityId { get; set; }
    //    public string[] LocationNames { get; set; }
    //    public ActivitySearchResultContinents[] Continents { get; set; }
    //    public int[] ActivityTypeIds { get; set; }
    //    public DateTime StartsOn { get; set; }
    //    public DateTime EndsOn { get; set; }
       
    //}

    //public class ActivitySearchResultCountries
    //{

    //}
    //public class ActivitySearchResultContinents
    //{
    //    public string ContinentName { get; set; }
    //    public string ContinentCode { get; set; }
    //    public MapPointModel Center { get; set; }
    //    public MapPointModel CenterCountry { get; set; }
    //    public MapBoxModel BoundingBox { get; set; }

    //}

    //public static class ActivitySearchResultMapProfiler
    //{
    //    public class EntitiyToModel : Profile
    //    {
    //        public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
    //        {
    //            x => x.Types.Select(y => y.Type),
    //            x => x.Locations.Select(y => y.Place),
    //        };

    //        protected override void Configure()
    //        {
    //            CreateMap<ActivityValues, ActivitySearchResultMapModel>()
    //                //.ForMember(d => d.Places, o => o.MapFrom(s => s.Locations.OrderBy(x => x.Place.OfficialName)))
    //                .ForMember(d => d.CountryName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Country.Name))
    //                //.ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym.ToponymName)))
    //                .ForMember(d => d.CountryCode, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Country.Code))
    //                .ForMember(d => d.LocationNames, o => o.MapFrom(s => s.Locations.Select(x => x.Place.OfficialName.ToString()).Distinct()))
    //                //.ForMember(d => d.LocationNames, o => o.MapFrom(s => s.Locations.GroupBy(x => x.Place.OfficialName.ToString()).Select(group => group.First())))
    //                .ForMember(d => d.ActivityTypeIds, o => o.MapFrom(s => s.Types.Select(y => y.ActivityValuesId)))
    //                //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
    //                //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
    //                .ForMember(d => d.ContinentCode, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                    ? s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : null))
    //                .ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                    ? s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.OfficialName : null))

    //                    .ForMember(d => d.Continents, o => o.ResolveUsing(s =>
    //                    {
    //                        if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.Where(x => x.Place.IsContinent).Select(x => new ActivitySearchResultContinents { ContinentCode = x.Place.GeoNamesToponym.ContinentCode.ToString(), ContinentName = x.Place.OfficialName.ToString() }).ToArray();
    //                        return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                            ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsContinent).Select(x => new ActivitySearchResultContinents { ContinentCode = x.Ancestor.GeoNamesToponym.ContinentCode.ToString(), ContinentName = x.Ancestor.OfficialName.ToString() }).ToArray() : null;
    //                    }))

    //                //.ForMember(d => d.ContinentCodes, o => o.ResolveUsing(s =>
    //                //{
    //                //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.Where(x => x.Place.IsContinent).Select(x => x.Place.GeoNamesToponym.ContinentCode.ToString()).Distinct();
    //                //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //        ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsContinent).Select(x => x.Ancestor.GeoNamesToponym.ContinentCode.ToString()).Distinct() : null;
    //                //}))

    //                //.ForMember(d => d.ContinentNames, o => o.ResolveUsing(s =>
    //                //{
    //                //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.Where(x => x.Place.IsContinent).Select(x => x.Place.OfficialName.ToString()).Distinct();
    //                //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //        ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsContinent).Select(x => x.Ancestor.OfficialName.ToString()).Distinct() : null;
    //                //}))
    //                //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //    ? s.Locations.FirstOrDefault().Place.Ancestors.First(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
    //                //    .ForMember(d => d.ContinentId, o => o.ResolveUsing(s =>
    //                //{
    //                //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.FirstOrDefault().Place.RevisionId;
    //                //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                //        ? s.Locations.FirstOrDefault().Place.Ancestors.First(x => x.Ancestor.IsContinent).AncestorId : default(int?);
    //                //}))

    //                .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.OfficialName))
    //                .ForMember(d => d.Center, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
    //                    ? new MapPointModel { Latitude = s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }//s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center
    //                    : new MapPointModel { Latitude = 0, Longitude = -180 }))
    //                .ForMember(d => d.CenterCountry, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.IsCountry
    //                    ? new MapPointModel { Latitude = s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Center.Latitude, Longitude = s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Center.Longitude }//s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center
    //                    : new MapPointModel { Latitude = 0, Longitude = -180 }))
    //                //: s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center))
    //                //: new MapPointModel { Latitude = 0, Longitude = -180 }))
    //                //.ForMember(d => d.Center, o => o.ResolveUsing(s =>
    //                //{
    //                //    if (s.Locations.FirstOrDefault().Center.HasValue)
    //                //        return s.Locations.FirstOrDefault().Center;
    //                //    //var place = s.Locations.FirstOrDefault().Places.OrderByDescending(x => x.Ancestors.Count).FirstOrDefault(x => x.Center.HasValue);
    //                //    return Coordinates.Default;
    //                //}))
    //                .ForMember(d => d.BoundingBox, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.BoundingBox))
    //            ;
    //        }
    //    }

        

        //public class PageQueryResultToPageOfItems : Profile
        //{
        //    protected override void Configure()
        //    {
        //        CreateMap<PagedQueryResult<ActivityValues>, PageOfActivitySearchResultMapModel>();
        //    }
        //}
//    }
//}