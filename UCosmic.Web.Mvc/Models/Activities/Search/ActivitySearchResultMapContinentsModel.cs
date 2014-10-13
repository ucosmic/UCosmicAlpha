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
    public class ActivitySearchResultMapContinentsModel
    {
        public ActivitySearchResultPlaces[] Continents { get; set; }

        internal static readonly IEnumerable<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
        {
            x => x.Locations,
            x => x.Locations.Select(z => z.Place),
            x => x.Locations.Select(z => z.Place.GeoNamesToponym),
            x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
            x => x.Locations.Select(z => z.Place.Ancestors),
            x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor)),
            x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
            x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),
        };
    }


    public static class ActivitySearchResultMapContinentsProfiler
    {
        public class EntitiyToModel : Profile
        {
            public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                //x => x.Types.Select(y => y.Type),
                x => x.Locations,
                x => x.Locations.Select(y => y.Place),

                x => x.Locations.Select(z => z.Place.GeoNamesToponym),
                x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
            //x => x.Locations.Select(z => z.Place.GeoPlanetPlace.Center.HasValue),
                x => x.Locations.Select(z => z.Place.Ancestors),
                x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor)),
                x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
                x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),

            };

            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivitySearchResultMapContinentsModel>()

                    .ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    {
                        if ((s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false)
                            || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                            || (s.Locations.FirstOrDefault(y => y.Place.IsEarth) != null ? s.Locations.FirstOrDefault(y => y.Place.IsEarth).Place.IsEarth : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false))
                        {
                            return s.Locations.Where(x => x.Place.IsContinent
                                || x.Place.IsWater
                                || x.Place.IsEarth
                                || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false)
                            || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.IsWater : false))
                            .Select(x =>
                                new ActivitySearchResultPlaces
                                {
                                    PlaceType = (x.Place.IsWater) ? "water" : (x.Place.IsEarth) ? "global" : "continent",
                                    //Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                                    Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : x.Place.IsWater ? "WATER" : x.Place.IsEarth ? "GLOBAL" : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                                    Name = x.Place.IsContinent ? x.Place.OfficialName
                                    : x.Place.IsWater ? "Bodies of water"
                                    : x.Place.IsEarth ? "Global"
                                    : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.OfficialName
                                    : "Global",
                                    Id = x.Place.IsContinent || x.Place.IsWater || x.Place.IsEarth ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.RevisionId,
                                    //Center = new MapPointModel { Latitude = 0, Longitude = -180 },
                                    Center = x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                    : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) ? new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }
                                    : (x.Place.IsWater) ? new MapPointModel { Latitude = 0, Longitude = -180 }
                                    : new MapPointModel { Latitude = 76, Longitude = -180 },
                                    BoundingBox = null// x.Place.IsContinent || x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.GeoPlanetPlace.BoundingBox
                                });
                        }
                        else
                        {
                            return null;
                        }
                    }))
                    //.ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    //{
                    //    if ((s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                    //        || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)
                    //        || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false))
                    //    {
                    //        return s.Locations.Where(x => x.Place.IsContinent
                    //            || x.Place.IsWater
                    //            || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false)
                    //        || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.IsWater : false))
                    //        .Select(x =>
                    //            new ActivitySearchResultPlaces
                    //            {
                    //                PlaceType = (x.Place.IsWater) ? "water" : "continent",
                    //                //Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //                Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : "WATER"),
                    //                Name = x.Place.IsContinent ? x.Place.OfficialName
                    //                : x.Place.IsWater ? "Bodies of water"
                    //                : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.OfficialName
                    //                : "Bodies of water",
                    //                Id = x.Place.IsContinent || x.Place.IsWater ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.RevisionId,
                    //                //Center = new MapPointModel { Latitude = 0, Longitude = -180 },
                    //                Center = x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) ? new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }
                    //                : new MapPointModel { Latitude = 0, Longitude = -180 },
                    //                BoundingBox = null// x.Place.IsContinent || x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.GeoPlanetPlace.BoundingBox
                    //            });
                    //    }
                    //    else
                    //    {
                    //        return null;
                    //    }
                    //}))
                    //.ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    //{
                    //    if ((s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false))
                    //    {
                    //        return s.Locations.Where(x => x.Place.IsContinent
                    //            || x.Place.IsWater)
                    //        .Select(x =>
                    //            new ActivitySearchResultPlaces
                    //            {
                    //                //Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //                Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : "WATER",
                    //                Name = x.Place.IsContinent ? x.Place.OfficialName
                    //                : "Bodies of water",
                    //                Id = x.Place.RevisionId,
                    //                Center = x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                    : new MapPointModel { Latitude = 0, Longitude = -180 },
                    //                BoundingBox = null// x.Place.IsContinent || x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.GeoPlanetPlace.BoundingBox
                    //            });
                    //    }
                    //    else
                    //    {
                    //        return null;
                    //    }
                    //}))

                ;
            }
        }

    }
}