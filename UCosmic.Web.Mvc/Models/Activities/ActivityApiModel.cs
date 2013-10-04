using System;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityApiEditModel
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public ActivityMode Mode { get; set; }

        public int ActivityId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public bool? IsExternallyFunded { get; set; }
        public bool? IsInternallyFunded { get; set; }
        public string UpdatedByPrincipal { get; set; }
        public DateTime UpdatedOnUtc { get; set; }
        public ActivityTypeApiModel2[] Types { get; set; }
        public ActivityPlaceApiModel[] Places { get; set; }
        public ActivityDocumentApiModel2[] Documents { get; set; }
    }

    public class ActivityApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public Guid EntityId { get; set; }
        public string ModeText { get; set; }
        public ActivityValuesApiModel Values { get; set; } // only Values with same mode as Activity
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
    }

    public class PageOfActivityApiModel : PageOf<ActivityApiModel> { }

    public class PageOfActivityApiEditModel : PageOf<ActivityApiEditModel> { }

    public static class ActivityApiProfiler
    {
        public class PagedQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Activity>, PageOfActivityApiModel>();
            }
        }

        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Activity, ActivityApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Values, o => o.MapFrom(s => s.Values.First(a => a.Mode == s.Mode)))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;
            }
        }
    }
}