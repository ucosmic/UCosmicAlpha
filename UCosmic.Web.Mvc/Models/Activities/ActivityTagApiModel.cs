using AutoMapper;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTagApiModel
    {
        public int ActivityId { get; set; }
        public string Text { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public ActivityTagDomainType DomainType { get; set; }

        public int? DomainKey { get; set; }
    }

    public static class ActivityTagApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityTag, ActivityTagApiModel>()
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.ActivityValues.ActivityId))
                ;
            }
        }
    }
}