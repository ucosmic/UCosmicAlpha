using AutoMapper;
using UCosmic.Domain.Home;

namespace UCosmic.Web.Mvc.Models
{
    public class HomeLinkModel
    {
        public int Id { get; set; }
        public int HomeSectionId { get; set; }
        public string Url { get; set; }
        public string Text { get; set; }
    }

    public static class HomeLinkProfiler
    {
        public class EntityToModelProfile: Profile
        {
            protected override void Configure()
            {
                CreateMap<HomeLink, HomeLink Model>();
            }
        }
    }
}