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
        //public string[] LocationNames { get; set; }
        //public string CountryName { get; set; }
        //public string ContinentName { get; set; }
        //public string CountryCode { get; set; }
        //public string ContinentCode { get; set; }
        //public string[] ContinentNames { get; set; }
        //public string[] ContinentCodes { get; set; }
        public ActivitySearchResultPlaces[] Continents { get; set; }
        public ActivitySearchResultPlaces[] Waters { get; set; }
        public ActivitySearchResultPlaces[] Countries { get; set; }
        public ActivitySearchResultPlacesRegions[] Regions { get; set; }
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
        public string PlaceType { get; set; }
        public string Name { get; set; }
        public int Id { get; set; }
        public string Code { get; set; }
        public MapPointModel Center { get; set; }
        public BoundingBox BoundingBox { get; set; }

    }
    public class ActivitySearchResultPlacesRegions
    {
        public int Id { get; set; }
        public string Name { get; set; }

    }
    public class ActivitySearchResultPlacesCounted
    {
        public string PlaceType { get; set; }
        public string Name { get; set; }
        public int Id { get; set; }
        public string Code { get; set; }
        public MapPointModel Center { get; set; }
        public BoundingBox BoundingBox { get; set; }
        public int Count { get; set; }
        public int? ActivityCount { get; set; }

    }
    public class ActivitySearchResultPlacesCountedRegions
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Count { get; set; }

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
                    //.ForMember(d => d.LocationNames, o => o.MapFrom(s => s.Locations.Select(x => x.Place.OfficialName.ToString()).Distinct()))
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
                                    Center = x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                    : (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) ? new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }
                                    : new MapPointModel { Latitude = 0, Longitude = -180 },
                                    BoundingBox = null
                                    //Center =  x.Place.IsContinent ? new MapPointModel { Latitude = x.Place.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.GeoPlanetPlace.Center.Longitude }
                                    //: (x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent) != null ? x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent).Ancestor.IsContinent : false) ? new MapPointModel { Latitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Latitude, Longitude = x.Place.Ancestors.FirstOrDefault(z => z.Ancestor.IsContinent).Ancestor.GeoPlanetPlace.Center.Longitude }
                                    //: new MapPointModel { Latitude = 0, Longitude = -180 } ,
                                    //BoundingBox = null// x.Place.IsContinent || x.Place.IsWater ? x.Place.BoundingBox : x.Place.Ancestors.FirstOrDefault(y => y.Ancestor.IsContinent || y.Ancestor.IsWater).Ancestor.GeoPlanetPlace.BoundingBox
                                });
                        }
                        else
                        {
                            return null;
                        }
                    }))


                    .ForMember(d => d.Regions, o => o.ResolveUsing(s =>
                    {
                        if ((s.Locations.FirstOrDefault(y => y.Place.IsRegion) != null ? s.Locations.FirstOrDefault(y => y.Place.IsRegion).Place.IsRegion : false)
                            || (s.Locations.SelectMany(x => x.Place.Composites).FirstOrDefault(x => x.IsRegion) != null ? s.Locations.SelectMany(x => x.Place.Composites).FirstOrDefault(x => x.IsRegion).IsRegion : false))
                        {
                            return s.Locations.Where(x => x.Place.IsRegion)
                                .Select(x => new ActivitySearchResultPlacesRegions
                                {
                                    Name = x.Place.OfficialName,
                                    Id = -1,
                                }).Union(s.Locations.Where(x => x.Place.IsCountry).SelectMany(x => x.Place.Composites).Where(x => x.IsRegion).Select(x => new ActivitySearchResultPlacesRegions
                                {
                                    Name = x.OfficialName,
                                    Id = 0,
                                }));
                        }
                        else
                        {
                            return null;
                        }
                    }))


                    .ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    {
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
                    }))
                    
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
                    }))

                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Locations.FirstOrDefault().Place.OfficialName))
                ;
            }
        }

    }
}