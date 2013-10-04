using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchInputModel
    {
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    //public static class ActivitySearchInputProfiler
    //{
    //    public class EntityToQuery : Profile
    //    {
    //        protected override void Configure()
    //        {
    //            CreateMap<ActivitySearchInputModel, ActivitiesByPersonId>()
    //                .ForMember(d => d.EagerLoad, o => o.Ignore());
    //        }
    //    }
    //}
}