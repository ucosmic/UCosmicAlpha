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
    public class ActivitySearchResultMapWatersModel
    {
        public ActivitySearchResultPlaces[] Waters { get; set; }
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


    public static class ActivitySearchResultMapWatersProfiler
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
                CreateMap<ActivityValues, ActivitySearchResultMapWatersModel>()

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