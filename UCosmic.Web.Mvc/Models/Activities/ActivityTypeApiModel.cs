using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTypeApiModel2
    {
        public int ActivityId { get; set; }
        public int TypeId { get; set; }
        public string Text { get; set; }
        public int Rank { get; set; }
    }

    public class ActivityTypeApiModel
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string Version { get; set; }
    }

    public static class ActivityTypeApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityType, ActivityTypeApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => s.TypeId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;
            }
        }
    }
}