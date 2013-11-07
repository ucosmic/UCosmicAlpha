using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTagViewModel
    {
        //public int ActivityId { get; set; }
        public string Text { get; set; }
        //public ActivityTagDomainType DomainType { get; set; }
        //public int? DomainKey { get; set; }
    }

    public static class ActivityTagViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityTag, ActivityTagViewModel>();
            }
        }
    }
}