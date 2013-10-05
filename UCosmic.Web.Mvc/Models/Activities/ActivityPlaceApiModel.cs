using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPlaceApiModel
    {
        public int ActivityId { get; set; }
        public int PlaceId { get; set; }
        public string PlaceName { get; set; }

        internal static readonly IEnumerable<Expression<Func<ActivityLocation, object>>> EagerLoad = new Expression<Func<ActivityLocation, object>>[]
        {
            x => x.ActivityValues,
            x => x.Place,
        };
    }

    public static class ActivityLocationApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityLocation, ActivityPlaceApiModel>()
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.ActivityValues.ActivityId))
                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Place.OfficialName))
                ;
            }
        }
    }
}