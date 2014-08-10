using AutoMapper;
using UCosmic.Domain.Home;
using UCosmic.Domain.Files;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Models
{
    public class HomeSectionModel
    {
        public int Id { get; set; }
        public int EstablishmentId { get; set; }
        public ExternalFile Photo { get; set; }
        public HomeLink[] Links {get; set;}
        public string Title { get; set; }
        public string Description { get; set; }
    }

    public static class HomeSectionProfiler
    {
        public class EntityToModelProfile: Profile
        {
            protected override void Configure()
            {
                CreateMap<HomeSection, HomeSectionModel>();
            }
        }
    }
}