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
        public string[] LocationNames { get; set; }
        //public string CountryName { get; set; }
        //public string ContinentName { get; set; }
        //public string CountryCode { get; set; }
        //public string ContinentCode { get; set; }
        //public string[] ContinentNames { get; set; }
        //public string[] ContinentCodes { get; set; }
        public ActivitySearchResultPlaces[] Continents { get; set; }
        public ActivitySearchResultPlaces[] Waters { get; set; }
        public ActivitySearchResultPlaces[] Countries { get; set; }
        //public ActivitySearchResultContinents[] Countries { get; set; }
        //public int ContinentId { get; set; }
        //public Domain.Places.Coordinates Center { get; set; }
        //public MapPointModel Center { get; set; }
        //public MapPointModel CenterCountry { get; set; }
        //public MapBoxModel BoundingBox { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime EndsOn { get; set; }
       
    }

    public class ActivitySearchResultPlaces
    {
        public string Name { get; set; }
        public int Id { get; set; }
        public string Code { get; set; }
        public MapPointModel Center { get; set; }
        public BoundingBox BoundingBox { get; set; }

    }
    //public class ActivitySearchResultCountries
    //{
    //    public string CountriesName { get; set; }
    //    public string CountriesCode { get; set; }
    //    public MapPointModel Center { get; set; }
    //    public BoundingBox BoundingBox { get; set; }

    //}

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
                    .ForMember(d => d.LocationNames, o => o.MapFrom(s => s.Locations.Select(x => x.Place.OfficialName.ToString()).Distinct()))
                    .ForMember(d => d.ActivityTypeIds, o => o.MapFrom(s => s.Types.Select(y => y.TypeId)))

                    .ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    {
                        if ((s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false)
                            || (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false))
                        {
                            return s.Locations.Where(x => x.Place.IsContinent 
                                || x.Place.IsWater
                                || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false)
                            || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.IsWater : false))
                            .Select(x => 
                                new ActivitySearchResultPlaces
                                {
                                    //Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                                    Code = x.Place.IsContinent ? x.Place.GeoNamesToponym.ContinentCode : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode : "WATER"),
                                    Name = x.Place.IsContinent ? x.Place.OfficialName 
                                    : x.Place.IsWater ? "Bodies of water"
                                    : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.OfficialName 
                                    : "Bodies of water",
                                    Id = x.Place.IsContinent || x.Place.IsWater ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.RevisionId,
                                    Center =  x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                    : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) ? new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }
                                    : new MapPointModel { Latitude = 0, Longitude = -180 } ,
                                    BoundingBox = null// x.Place.IsContinent || x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.GeoPlanetPlace.BoundingBox
                                });
                        }
                        else
                        {
                            //return new ActivitySearchResultPlaces[]
                            //{
                            //    new ActivitySearchResultPlaces
                            //        { 
                            //            Code = null, 
                            //            Name = "Not associated with a continent", 
                            //            Id = default(int),
                            //            Center = new MapPointModel { Latitude = 0, Longitude = -280 },// if in continent view put placemark here.
                            //            BoundingBox = null
                            //        }
                            //};
                            return null;
                        }
                        //return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)
                        //    ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                        //    {
                        //        Code = x.Ancestor.GeoNamesToponym.ContinentCode.ToString(),
                        //        Name = x.Ancestor.OfficialName.ToString(),
                        //        Id = x.Ancestor.RevisionId,
                        //        Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                        //        BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                        //    }) : new ActivitySearchResultPlaces[]
                        //    {
                        //        new ActivitySearchResultPlaces
                        //            { 
                        //                Code = null, 
                        //                Name = "Not associated with a continent", 
                        //                Id = default(int),
                        //                Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if in continent view put placemark here.
                        //                BoundingBox = null
                        //            }
                        //    };
                    }))
                    

                    //.ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false) return s.Locations.Where(x => x.Place.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //    {
                    //        Code = x.Place.GeoNamesToponym.ContinentCode.ToString(),
                    //        Name = x.Place.OfficialName.ToString(),
                    //        Id = x.Place.RevisionId,
                    //        Center = new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude },
                    //        BoundingBox = x.Place.GeoPlanetPlace.BoundingBox
                    //    });
                    //    return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)
                    //        ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //        {
                    //            Code = x.Ancestor.GeoNamesToponym.ContinentCode.ToString(),
                    //            Name = x.Ancestor.OfficialName.ToString(),
                    //            Id = x.Ancestor.RevisionId,
                    //            Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                    //            BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                    //        }) : new ActivitySearchResultPlaces[]
                    //        {
                    //            new ActivitySearchResultPlaces
                    //                { 
                    //                    Code = null, 
                    //                    Name = "Not associated with a continent", 
                    //                    Id = default(int),
                    //                    Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if in continent view put placemark here.
                    //                    BoundingBox = null
                    //                }
                    //        };
                    //    //if( (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : false)){
                    //    //    return s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //    //    {
                    //    //        Code = x.Ancestor.GeoNamesToponym.ContinentCode.ToString(),
                    //    //        Name = x.Ancestor.OfficialName.ToString(),
                    //    //        Id = x.Ancestor.RevisionId,
                    //    //        Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                    //    //        BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                    //    //    });
                    //    //}
                    //    //else if (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                    //    //{
                    //    //    return s.Locations.Where(x => x.Place.IsWater).Select(x => new ActivitySearchResultPlaces
                    //    //    {
                    //    //        Code = null,
                    //    //        Name = x.Place.OfficialName.ToString(),
                    //    //        Id = x.Place.RevisionId,
                    //    //        Center = new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude },
                    //    //        BoundingBox = x.Place.BoundingBox
                    //    //    });
                    //    //}
                    //    //return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false)
                    //    //    //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //    //    ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsWater).Select(x => new ActivitySearchResultPlaces
                    //    //    {
                    //    //        Code = null,
                    //    //        Name = x.Ancestor.OfficialName.ToString(),
                    //    //        Id = x.Ancestor.RevisionId,
                    //    //        Center = new MapPointModel { Latitude = x.Ancestor.Center.Latitude, Longitude = x.Ancestor.Center.Longitude },
                    //    //        BoundingBox = x.Ancestor.BoundingBox
                    //    //    }) 
                    //    //    : null;
                    //        //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                             
                    //}))

                    //.ForMember(d => d.Continents, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault(y => y.Place.IsContinent) != null ? s.Locations.FirstOrDefault(y => y.Place.IsContinent).Place.IsContinent : false) return s.Locations.Where(x => x.Place.IsContinent).Select(x => new ActivitySearchResultPlaces 
                    //    { 
                    //        Code = x.Place.GeoNamesToponym.ContinentCode.ToString(), 
                    //        Name = x.Place.OfficialName.ToString(),
                    //        Center = new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude },
                    //        BoundingBox = x.Place.GeoPlanetPlace.BoundingBox
                    //    });
                    //    //return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    return (s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) != null ?
                    //        s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.IsContinent : 
                    //        false)
                    //        ? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //        {
                    //            Code = x.Ancestor.GeoNamesToponym.ContinentCode.ToString(),
                    //            Name = x.Ancestor.OfficialName.ToString(),
                    //            Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                    //            BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                    //        }) : new ActivitySearchResultPlaces[]
                    //        {
                    //            new ActivitySearchResultPlaces
                    //                { 
                    //                    Code = null, 
                    //                    Name = null, 
                    //                    Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if in continent view put placemark here.
                    //                    BoundingBox = null
                    //                }
                    //        };
                    //}))


                    .ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    {
                        //if (s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry) return s.Locations.Where(x => x.Place.IsCountry).Select(x => new ActivitySearchResultPlaces
                        if ((s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry).Ancestor.IsCountry : false))
                        {
                            return s.Locations.Where(x => x.Place.IsCountry
                                || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false))
                                .Select(x => new ActivitySearchResultPlaces
                            {
                                Code = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                                Name = x.Place.IsCountry ? x.Place.OfficialName.ToString() : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.OfficialName,
                                Id = x.Place.IsCountry ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.RevisionId,
                                Center = x.Place.IsCountry ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                    : new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.Center.Longitude },
                                BoundingBox = x.Place.IsCountry ? x.Place.GeoPlanetPlace.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.GeoPlanetPlace.BoundingBox
                            });
                        }
                        else
                        {
                            return null;
                        }
                        //return s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry).Place.Ancestors.Any(x => x.Ancestor.IsCountry)
                        //return (s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false) != null ?
                        //    s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false).Place.Ancestors.FirstOrDefault().Ancestor.IsCountry :
                        //    false)
                        //return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry).Ancestor.IsCountry : false)
                        //    //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                        //    ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsCountry).Select(x => new ActivitySearchResultPlaces
                        //    {
                        //        Code = x.Ancestor.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                        //        Name = x.Ancestor.OfficialName.ToString(),
                        //        Id = x.Ancestor.RevisionId,
                        //        Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                        //        BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                        //    }) : null;//new ActivitySearchResultPlaces[]
                        //{
                        //    new ActivitySearchResultPlaces
                        //        { 
                        //            Code = null, 
                        //            Name = "Not associated with a country", 
                        //            Id = default(int),
                        //            Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if not in country view put placemark here.
                        //            BoundingBox = null
                        //        }
                        //};
                    }))
                    //.ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    //{
                    //    //if (s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry) return s.Locations.Where(x => x.Place.IsCountry).Select(x => new ActivitySearchResultPlaces
                    //    if (s.Locations.FirstOrDefault(y => y.Place.IsCountry) != null ? s.Locations.FirstOrDefault(y => y.Place.IsCountry).Place.IsCountry : false) return s.Locations.Where(x => x.Place.IsCountry).Select(x => new ActivitySearchResultPlaces
                    //    {
                    //        Code = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //        Name = x.Place.OfficialName.ToString(),
                    //        Id = x.Place.RevisionId,
                    //        Center = new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude },
                    //        BoundingBox = x.Place.GeoPlanetPlace.BoundingBox
                    //    });
                    //    //return s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry).Place.Ancestors.Any(x => x.Ancestor.IsCountry)
                    //    //return (s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false) != null ?
                    //    //    s.Locations.FirstOrDefault(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor.IsCountry : false).Place.Ancestors.FirstOrDefault().Ancestor.IsCountry :
                    //    //    false)
                    //    return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsCountry).Ancestor.IsCountry : false)
                    //        //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                    //        ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsCountry).Select(x => new ActivitySearchResultPlaces
                    //        {
                    //            Code = x.Ancestor.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //            Name = x.Ancestor.OfficialName.ToString(),
                    //            Id = x.Ancestor.RevisionId,
                    //            Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                    //            BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                    //        }) : null;//new ActivitySearchResultPlaces[]
                    //        //{
                    //        //    new ActivitySearchResultPlaces
                    //        //        { 
                    //        //            Code = null, 
                    //        //            Name = "Not associated with a country", 
                    //        //            Id = default(int),
                    //        //            Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if not in country view put placemark here.
                    //        //            BoundingBox = null
                    //        //        }
                    //        //};
                    //}))





                    //.ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Place.IsCountry) return s.Locations.Where(x => x.Place.IsCountry).Select(x => new ActivitySearchResultPlaces
                    //    {
                    //        Code =  x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //        Name = x.Place.OfficialName.ToString(),
                    //        Center = new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude },
                    //        BoundingBox = x.Place.GeoPlanetPlace.BoundingBox
                    //    });
                    //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsCountry)
                    //        ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsCountry).Select(x => new ActivitySearchResultPlaces
                    //        {
                    //            Code = x.Ancestor.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.GeoNamesToponym.ContinentCode,
                    //            Name = x.Ancestor.OfficialName.ToString(),
                    //            Center = new MapPointModel { Latitude = x.Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Ancestor.GeoPlanetPlace.Center.Longitude },
                    //            BoundingBox = x.Ancestor.GeoPlanetPlace.BoundingBox
                    //        }) : new ActivitySearchResultPlaces[]
                    //        {
                    //            new ActivitySearchResultPlaces
                    //                { 
                    //                    Code = null, 
                    //                    Name = null, 
                    //                    Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if not in country view put placemark here.
                    //                    BoundingBox = null
                    //                }
                    //        };
                    //}))

                    .ForMember(d => d.Waters, o => o.ResolveUsing(s =>
                    {
                        if ((s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false)
                            || (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false))
                        {
                            return s.Locations.Where(x => x.Place.IsWater
                                || (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.IsWater : false))
                                .Select(x => new ActivitySearchResultPlaces
                                {
                                    Code = null,
                                    Name = x.Place.IsWater ? x.Place.OfficialName.ToString() : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.OfficialName,
                                    Id = x.Place.IsWater ? x.Place.RevisionId : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.RevisionId,
                                    Center = x.Place.IsWater ? new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude }
                                    : new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.Center.Longitude },
                                    BoundingBox = x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsWater).Ancestor.BoundingBox
                                });
                        }else{
                            return null;
                        }
                        //return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false)
                        //    //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                        //    ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsWater).Select(x => new ActivitySearchResultPlaces
                        //    {
                        //        Code = null,
                        //        Name = x.Ancestor.OfficialName.ToString(),
                        //        Id = x.Ancestor.RevisionId,
                        //        Center = new MapPointModel { Latitude = x.Ancestor.Center.Latitude, Longitude = x.Ancestor.Center.Longitude },
                        //        BoundingBox = x.Ancestor.BoundingBox
                        //    }) : null;//new ActivitySearchResultPlaces[]
                            //{
                            //    new ActivitySearchResultPlaces
                            //        { 
                            //            Code = null, 
                            //            Name = "Not associated with a body of water.", 
                            //            Id = default(int),
                            //            Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if not in water view put placemark here.
                            //            BoundingBox = null
                            //        }
                            //};
                    }))
                     //.ForMember(d => d.Waters, o => o.ResolveUsing(s =>
                     //{
                     //    if (s.Locations.FirstOrDefault(y => y.Place.IsWater) != null ? s.Locations.FirstOrDefault(y => y.Place.IsWater).Place.IsWater : false) return s.Locations.Where(x => x.Place.IsWater).Select(x => new ActivitySearchResultPlaces
                     //    {
                     //        Code = null,
                     //        Name = x.Place.OfficialName.ToString(),
                     //        Id = x.Place.RevisionId,
                     //        Center = new MapPointModel { Latitude = x.Place.Center.Latitude, Longitude = x.Place.Center.Longitude },
                     //        BoundingBox = x.Place.BoundingBox
                     //    });
                     //    return (s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater) != null ? s.Locations.SelectMany(x => x.Place.Ancestors).FirstOrDefault(x => x.Ancestor.IsWater).Ancestor.IsWater : false)
                     //        //? s.Locations.Where(x => x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent).SelectMany(x => x.Place.Ancestors).Where(y => y.Ancestor.IsContinent).Select(x => new ActivitySearchResultPlaces
                     //        ? s.Locations.SelectMany(x => x.Place.Ancestors).Where(x => x.Ancestor.IsWater).Select(x => new ActivitySearchResultPlaces
                     //        {
                     //            Code = null,
                     //            Name = x.Ancestor.OfficialName.ToString(),
                     //            Id = x.Ancestor.RevisionId,
                     //            Center = new MapPointModel { Latitude = x.Ancestor.Center.Latitude, Longitude = x.Ancestor.Center.Longitude },
                     //            BoundingBox = x.Ancestor.BoundingBox
                     //        }) : null;//new ActivitySearchResultPlaces[]
                     //    //{
                     //    //    new ActivitySearchResultPlaces
                     //    //        { 
                     //    //            Code = null, 
                     //    //            Name = "Not associated with a body of water.", 
                     //    //            Id = default(int),
                     //    //            Center = new MapPointModel { Latitude = 0, Longitude = -180 },// if not in water view put placemark here.
                     //    //            BoundingBox = null
                     //    //        }
                     //    //};
                     //}))



                    //.ForMember(d => d.ContinentCodes, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.Where(x => x.Place.IsContinent).Select(x => x.Place.GeoNamesToponym.ContinentCode.ToString()).Distinct();
                    //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //        ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsContinent).Select(x => x.Ancestor.GeoNamesToponym.ContinentCode.ToString()).Distinct() : null;
                    //}))

                    //.ForMember(d => d.ContinentNames, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.Where(x => x.Place.IsContinent).Select(x => x.Place.OfficialName.ToString()).Distinct();
                    //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //        ? s.Locations.FirstOrDefault().Place.Ancestors.Where(x => x.Ancestor.IsContinent).Select(x => x.Ancestor.OfficialName.ToString()).Distinct() : null;
                    //}))
                    //.ForMember(d => d.ContinentId, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? s.Locations.FirstOrDefault().Place.Ancestors.First(x => x.Ancestor.IsContinent).AncestorId : default(int?)))
                    //    .ForMember(d => d.ContinentId, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Place.IsContinent) return s.Locations.FirstOrDefault().Place.RevisionId;
                    //    return s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //        ? s.Locations.FirstOrDefault().Place.Ancestors.First(x => x.Ancestor.IsContinent).AncestorId : default(int?);
                    //}))

                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.OfficialName))
                    //.ForMember(d => d.Center, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.Any(x => x.Ancestor.IsContinent)
                    //    ? new MapPointModel { Latitude = s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }//s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center
                    //    : new MapPointModel { Latitude = 0, Longitude = -180 }))
                    //.ForMember(d => d.CenterCountry, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.IsCountry
                    //    ? new MapPointModel { Latitude = s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Center.Latitude, Longitude = s.Locations.FirstOrDefault().Place.GeoPlanetPlace.Center.Longitude }//s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center
                    //    : new MapPointModel { Latitude = 0, Longitude = -180 }))
                    //: s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center))
                    //: new MapPointModel { Latitude = 0, Longitude = -180 }))
                    //.ForMember(d => d.Center, o => o.ResolveUsing(s =>
                    //{
                    //    if (s.Locations.FirstOrDefault().Center.HasValue)
                    //        return s.Locations.FirstOrDefault().Center;
                    //    //var place = s.Locations.FirstOrDefault().Places.OrderByDescending(x => x.Ancestors.Count).FirstOrDefault(x => x.Center.HasValue);
                    //    return Coordinates.Default;
                    //}))
                    //.ForMember(d => d.BoundingBox, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.Ancestors.FirstOrDefault(x => x.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.BoundingBox))
                ;
            }
        }

        

        //public class PageQueryResultToPageOfItems : Profile
        //{
        //    protected override void Configure()
        //    {
        //        CreateMap<PagedQueryResult<ActivityValues>, PageOfActivitySearchResultMapModel>();
        //    }
        //}
    }
}