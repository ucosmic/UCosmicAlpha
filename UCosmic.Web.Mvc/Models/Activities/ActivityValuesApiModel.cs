using System;
using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityValuesApiModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public ICollection<ActivityLocationApiModel> Locations { get; set; }    // only Locations with same mode as Activity
        public ICollection<ActivityTypeApiModel> Types { get; set; }            // only Types with same mode as Activity
        public ICollection<ActivityTagApiModel> Tags { get; set; }              // only Tags with same mode as Activity
        public ICollection<ActivityDocumentApiModel> Documents { get; set; }    // only Documents with same mode as Activity
        public string ModeText { get; set; }
        public string Version { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
    }

    public static class ActivityValuesApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivityValuesApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.WasExternallyFunded, o => o.MapFrom(s => s.WasExternallyFunded))
                    .ForMember(d => d.WasInternallyFunded, o => o.MapFrom(s => s.WasInternallyFunded))
                ;
            }
        }
    }
}