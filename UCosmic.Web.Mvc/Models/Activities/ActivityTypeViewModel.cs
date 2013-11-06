using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTypeViewModel
    {
        //public int ActivityId { get; set; }
        public int TypeId { get; set; }
        public string Text { get; set; }
        //public int Rank { get; set; }
    }

    public static class ActivityTypeViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityType, ActivityTypeViewModel>()
                    .ForMember(d => d.Text, o => o.MapFrom(s => s.Type.Type))
                ;
            }
        }
    }
}