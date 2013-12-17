using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchResultModel
    {
        public ActivityMode Mode { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public ActivityTypeViewModel[] Types { get; set; }
        public ActivityPlaceViewModel[] Places { get; set; }
        public ActivitySearchResultOwnerModel Owner { get; set; }

        public class ActivitySearchResultOwnerModel
        {
            public int PersonId { get; set; }
            public string DisplayName { get; set; }
        }
    }

    public class PageOfActivitySearchResultModel : PageOf<ActivitySearchResultModel>
    {
    }

    public static class ActivitySearchResultProfiler
    {
        public class EntitiyToModel : Profile
        {

            public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                x => x.Types.Select(y => y.Type),
                x => x.Locations.Select(y => y.Place),
            };

            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivitySearchResultModel>()
                    .ForMember(d => d.Owner, o => o.Ignore())
                    .ForMember(d => d.Places, o => o.MapFrom(s => s.Locations.OrderBy(x => x.Place.OfficialName)))
                    .ForMember(d => d.Types, o => o.MapFrom(s => s.Types.OrderBy(x => x.Type.Type)))
                ;
            }
        }

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<ActivityValues>, PageOfActivitySearchResultModel>();
            }
        }
    }
}