using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTypeApiModel
    {
        public int ActivityId { get; set; }
        public int TypeId { get; set; }
        public string Text { get; set; }
        public int Rank { get; set; }

        internal static readonly IEnumerable<Expression<Func<ActivityType, object>>> EagerLoad = new Expression<Func<ActivityType, object>>[]
        {
            x => x.ActivityValues,
            x => x.Type,
        };
    }

    public static class ActivityTypeApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityType, ActivityTypeApiModel>()
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.ActivityValues.ActivityId))
                    .ForMember(d => d.Text, o => o.MapFrom(s => s.Type.Type))
                    .ForMember(d => d.Rank, o => o.MapFrom(s => s.Type.Rank))
                ;
            }
        }
    }
}