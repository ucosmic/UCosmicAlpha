using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Models
{
    public class ActivitiesPage : PageOf<ActivitiesPage.Item>
    {
        public class Item
        {
            public int Number { get; set; }
            public string Title { get; set; }
            public ActivityMode Mode { get; set; }
            public Tag[] Tags { get; set; }
            public class Tag
            {
                public string Text { get; set; }
            }
        }
    }

    public static class ActivitiesPageProfiler
    {
        public class EntitiesToModelsProfile : Profile
        {
            protected override void Configure()
            {
                //CreateMap<PagedResult<Activity>, ActivitiesPage>();
                CreateMap<PagedQueryResult<Activity>, ActivitiesPage>();

                CreateMap<Activity, ActivitiesPage.Item>()
                    .ForMember(d => d.Title, o => o.ResolveUsing(s =>
                        s.Values.Title ??
                        s.DraftedValues.Title ??
                        string.Format("New Activity #{0}", s.Number)
                    ))
                ;

                CreateMap<ActivityTag, ActivitiesPage.Item.Tag>();
            }
        }
    }
}