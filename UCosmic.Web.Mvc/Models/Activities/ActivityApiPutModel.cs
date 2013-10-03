using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityApiPutModel
    {
        public ActivityMode? Mode { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? IsExternallyFunded { get; set; }
        public bool? IsInternallyFunded { get; set; }
    }

    public static class ActivityApiPutProfiler
    {
        public class ModelToCommand : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityApiPutModel, UpdateActivity>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.ActivityId, o => o.Ignore())
                    .ForMember(d => d.Impersonator, o => o.Ignore())
                    .ForMember(d => d.StartsOn, o => o.MapFrom(s => s.StartsOn.HasValue ? s.StartsOn.Value.ToUniversalTime() : (DateTime?)null))
                    .ForMember(d => d.EndsOn, o => o.MapFrom(s => s.EndsOn.HasValue ? s.EndsOn.Value.ToUniversalTime() : (DateTime?)null))
                    .ForMember(d => d.WasExternallyFunded, o => o.MapFrom(s => s.IsExternallyFunded))
                    .ForMember(d => d.WasInternallyFunded, o => o.MapFrom(s => s.IsInternallyFunded))
                ;
            }
        }
    }
}