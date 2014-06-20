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
    public class ActivitySearchResultMapRegionsModel
    {
        public ActivitySearchResultPlacesRegions[] Regions { get; set; }
        internal static readonly IEnumerable<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
        {
            x => x.Locations,
            x => x.Locations.Select(z => z.Place),
            //x => x.Locations.Select(z => z.Place.GeoNamesToponym),
            //x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
            x => x.Locations.Select(z => z.Place.Composites),
            //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor)),
            //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
            //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),
        };
    }


    public static class ActivitySearchResultMapRegionsProfiler
    {
        public class EntitiyToModel : Profile
        {
            public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                //x => x.Types.Select(y => y.Type),
                x => x.Locations,
                x => x.Locations.Select(y => y.Place),

                //x => x.Locations.Select(z => z.Place.GeoNamesToponym),
                //x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
            //x => x.Locations.Select(z => z.Place.GeoPlanetPlace.Center.HasValue),
                x => x.Locations.Select(z => z.Place.Composites),
                //x => x.Locations.Select(z => z.Place.Composites.Select(y => y.Ancestor)),
                //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
                //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),

            };

            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivitySearchResultMapRegionsModel>()

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

                ;
            }
        }

    }
}