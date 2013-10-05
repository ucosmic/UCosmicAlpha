using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityApiModel
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
        public ActivityTypeApiModel[] Types { get; set; }
        public ActivityPlaceApiModel[] Places { get; set; }
        public ActivityTagApiModel[] Tags { get; set; }
        public ActivityDocumentApiModel[] Documents { get; set; }

        internal static readonly IEnumerable<Expression<Func<Activity, object>>> EagerLoad = new Expression<Func<Activity, object>>[]
        {
            x => x.Values.Select(y => y.Locations.Select(z => z.Place)),
            x => x.Values.Select(y => y.Types.Select(z => z.Type)),
            x => x.Values.Select(y => y.Tags),
            x => x.Values.Select(y => y.Documents),
        };
    }

    public class PageOfActivityApiModel : PageOf<ActivityApiModel> { }

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
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.UpdatedOnUtc, o => o.MapFrom(s => s.UpdatedOnUtc ?? s.CreatedOnUtc))
                    .ForMember(d => d.UpdatedOnUtc, o => o.ResolveUsing(s =>
                    { // documents do not update the activity due to concurrency on multi-uploads
                        var activity = s.UpdatedOnUtc ?? s.CreatedOnUtc;
                        var docs = s.Values.Single(x => x.Mode == s.Mode).Documents;
                        var ons = docs.Select(x => x.UpdatedOnUtc.HasValue ? x.UpdatedOnUtc.Value : x.CreatedOnUtc).Union(new[] { activity })
                            .OrderByDescending(x => x);
                        return ons.First();
                    }))
                    .ForMember(d => d.Title, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Title))
                    .ForMember(d => d.Content, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Content))
                    .ForMember(d => d.StartsOn, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).StartsOn))
                    .ForMember(d => d.StartsFormat, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).StartsFormat))
                    .ForMember(d => d.OnGoing, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).OnGoing))
                    .ForMember(d => d.EndsOn, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).EndsOn))
                    .ForMember(d => d.EndsFormat, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).EndsFormat))
                    .ForMember(d => d.IsExternallyFunded, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).WasExternallyFunded))
                    .ForMember(d => d.IsInternallyFunded, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).WasInternallyFunded))
                    .ForMember(d => d.Types, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Types))
                    .ForMember(d => d.Places, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Locations))
                    .ForMember(d => d.Tags, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Tags))
                    .ForMember(d => d.Documents, o => o.MapFrom(s => s.Values.Single(x => x.Mode == s.Mode).Documents))
                ;
            }
        }
    }
}