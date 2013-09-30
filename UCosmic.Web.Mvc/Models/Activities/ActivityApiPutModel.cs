using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityApiPutModel
    {
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string DateFormat { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
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
                ;
            }
        }
    }
}