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
    public class ActivitySearchResultMapCountriesModel
    {
        public ActivitySearchResultPlaces[] Countries { get; set; }
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


    public static class ActivitySearchResultMapCountriesProfiler
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
                CreateMap<ActivityValues, ActivitySearchResultMapCountriesModel>()


                    //.ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    //{
                    //    if ((s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false)
                    //        || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry).Ancestor.IsCountry : false))
                    //    {
                    //        return s.Locations.Where(x => x.Place.IsCountry
                    //            || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false))
                    //            .Select(x => new ActivitySearchResultPlaces
                    //            {
                    //                Code = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //                Name = x.Place.IsCountry ? x.Place.OfficialName.ToString() : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                    //                Id = x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                    //                Center = x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                    : new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                    //                BoundingBox = x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                    //            });
                    //    }
                    //    else
                    //    {
                    //        return null;
                    //    }
                    //}))
                    .ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    {
                        //if ((s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false)
                        //    || (s.Locations.FirstOrDefault(y => y.Place.IsRegion) != null ? s.Locations.FirstOrDefault(y => y.Place.IsRegion).Place.IsRegion : false)
                        //    || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                        //    || (s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false))
                        ////|| (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion).Ancestor.IsRegion : false))
                        //{
                            return s.Locations.Select(x => new ActivitySearchResultPlaces
                            {
                                //PlaceIsContinentOrRegion = (x.Place.IsContinent || x.Place.IsRegion || x.Place.IsWater) ? true : false,
                                PlaceType = x.Place.IsContinent ? "continent" : x.Place.IsWater ? "water" : x.Place.IsRegion ? "region" : x.Place.IsEarth ? "global" : "country",
                                Code = (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null) ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : null,
                                Name = x.Place.OfficialName, //x.Place.IsCountry ? x.Place.OfficialName : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                                Id = x.Place.RevisionId, //x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                                Center = x.Place.IsWater ? new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude }
                                : x.Place.IsEarth ? new MapPointModel { Latitude = 0, Longitude = -180 }
                                : new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }, //x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                //: new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                                BoundingBox = null//x.Place.GeoPlanetPlace.BoundingBox //x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                            });
                        //}
                        //else
                        //{
                        //    //Global
                        //    return s.Locations.Select(x => new ActivitySearchResultPlaces
                        //    {
                        //        //PlaceIsContinentOrRegion = (x.Place.IsContinent || x.Place.IsRegion || x.Place.IsWater) ? true : false,
                        //        PlaceType = "global",
                        //        Code = (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null) ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : null,
                        //        Name = x.Place.OfficialName, //x.Place.IsCountry ? x.Place.OfficialName : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                        //        Id = x.Place.RevisionId, //x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                        //        Center = new MapPointModel { Latitude = 0, Longitude = -180 }, //x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                        //        //: new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                        //        BoundingBox = null//x.Place.GeoPlanetPlace.BoundingBox //x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                        //    });
                        //}
                    }))
                    //.ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    //{
                    //    if ((s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsRegion) != null ? s.Locations.FirstOrDefault(y => y.Place.IsRegion).Place.IsRegion : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false))
                    //    //|| (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion).Ancestor.IsRegion : false))
                    //    {
                    //        return s.Locations.Select(x => new ActivitySearchResultPlaces
                    //            {
                    //                //PlaceIsContinentOrRegion = (x.Place.IsContinent || x.Place.IsRegion || x.Place.IsWater) ? true : false,
                    //                PlaceType = x.Place.IsContinent ? "continent" : x.Place.IsWater ? "water" : x.Place.IsRegion ? "region" : "country",
                    //                Code = (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null) ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : null,
                    //                Name = x.Place.OfficialName, //x.Place.IsCountry ? x.Place.OfficialName : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                    //                Id = x.Place.RevisionId, //x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                    //                Center = x.Place.IsWater ? new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude }
                    //                : new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }, //x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                //: new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                    //                BoundingBox = null//x.Place.GeoPlanetPlace.BoundingBox //x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                    //            });
                    //    }
                    //    else
                    //    {
                    //        //Global
                    //        return s.Locations.Select(x => new ActivitySearchResultPlaces
                    //            {
                    //                //PlaceIsContinentOrRegion = (x.Place.IsContinent || x.Place.IsRegion || x.Place.IsWater) ? true : false,
                    //                PlaceType = "global",
                    //                Code = (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null) ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : null,
                    //                Name = x.Place.OfficialName, //x.Place.IsCountry ? x.Place.OfficialName : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                    //                Id = x.Place.RevisionId, //x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                    //                Center = new MapPointModel { Latitude = 0, Longitude = -180 }, //x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                //: new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                    //                BoundingBox = null//x.Place.GeoPlanetPlace.BoundingBox //x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                    //            });
                    //    }
                    //}))
                    //.ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    //{
                    //    if ((s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsRegion) != null ? s.Locations.FirstOrDefault(y => y.Place.IsRegion).Place.IsRegion : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                    //        || (s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false))
                    //        //|| (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsRegion).Ancestor.IsRegion : false))
                    //    {
                    //        return s.Locations.Where(x => x.Place.IsCountry
                    //            || x.Place.IsRegion
                    //            || x.Place.IsWater
                    //            || x.Place.IsContinent)
                    //            .Select(x => new ActivitySearchResultPlaces
                    //            {
                    //                //PlaceIsContinentOrRegion = (x.Place.IsContinent || x.Place.IsRegion || x.Place.IsWater) ? true : false,
                    //                PlaceType = x.Place.IsContinent ? "continent" : x.Place.IsWater ? "water" : x.Place.IsRegion ? "region" : "country",
                    //                Code =  (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null) ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : null,
                    //                Name = x.Place.OfficialName, //x.Place.IsCountry ? x.Place.OfficialName : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                    //                Id = x.Place.RevisionId, //x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                    //                Center = x.Place.IsWater ? new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude }
                    //                : new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }, //x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                    //                    //: new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                    //                BoundingBox = null//x.Place.GeoPlanetPlace.BoundingBox //x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
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
                    
                ;
            }
        }

    }
}