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

                ;
            }
        }

    }
}