using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchResultMapModel
    {
        public int ActivityId { get; set; }
        //public string Title { get; set; }
        //public ActivityPlaceMapViewModel[] Places { get; set; }
        public string PlaceName { get; set; }
        public string CountryName { get; set; }
        public string ContinentName { get; set; }
        public string CountryCode { get; set; }
        public string ContinentCode { get; set; }
        public MapPointModel Center { get; set; }
        public MapBoxModel BoundingBox { get; set; }
       
    }

    public class PageOfActivitySearchResultMapModel : PageOf<ActivitySearchResultMapModel>
    {
    }

    public static class ActivitySearchResultMapProfiler
    {
        public class EntitiyToModel : Profile
        {
            public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                x => x.Types.Select(y => y.Type),
                x => x.Locations.Select(y => y.Place),
            };

            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivitySearchResultMapModel>()
                    //.ForMember(d => d.Places, o => o.MapFrom(s => s.Locations.OrderBy(x => x.Place.OfficialName)))
                    .ForMember(d => d.CountryName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Country.Name))
                    //.ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym.ToponymName)))
                    .ForMember(d => d.CountryCode, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Country.Code))
                    //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? s.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    .ForMember(d => d.ContinentCode, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : null))
                    .ForMember(d => d.ContinentName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                        ? s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.OfficialName : null))
                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.OfficialName))
                    .ForMember(d => d.Center, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Center))
                    //.ForMember(d => d.Center, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Center.HasValue)
                    //        return s.Locations.FirstOrDefault().Center;
                    //    //var place = s.Locations.FirstOrDefault().Places.OrderByDescending(x => x.Ancestors.Count).FirstOrDefault(x => x.Center.HasValue);
                    //    return Coordinates.Default;
                    //}))
                    .ForMember(d => d.BoundingBox, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.BoundingBox))
                ;
            }
        }

        

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<ActivityValues>, PageOfActivitySearchResultMapModel>();
            }
        }
    }
}