using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPublicViewModel
    {
        public ActivityMode Mode { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public HtmlString Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public bool? IsExternallyFunded { get; set; }
        public bool? IsInternallyFunded { get; set; }
        public ActivityTypeViewModel[] Types { get; set; }
        public ActivityPlaceViewModel[] Places { get; set; }
        public ActivityTagViewModel[] Tags { get; set; }
        public ActivityDocumentViewModel[] Documents { get; set; }
        public ActivityPersonViewModel Person { get; set; }
    }

    public static class ActivityPublicViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivityPublicViewModel>()
                    .ForMember(d => d.IsExternallyFunded, o => o.MapFrom(s => s.WasExternallyFunded))
                    .ForMember(d => d.IsInternallyFunded, o => o.MapFrom(s => s.WasInternallyFunded))
                    .ForMember(d => d.Places, o => o.MapFrom(s => s.Locations))
                    .ForMember(d => d.Content, o => o.MapFrom(s => new HtmlString(s.Content)))
                    .ForMember(d => d.Person, o => o.MapFrom(s => s.Activity.Person))
                ;
            }
        }
    }
}