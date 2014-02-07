using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PersonUrlViewModel
    {
        public int UrlId { get; set; }
        public int PersonId { get; set; }
        public string Description { get; set; }
        public string Value { get; set; }
    }

    public static class PersonUrlProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ExternalUrl, PersonUrlViewModel>()
                    .ForMember(d => d.UrlId, o => o.MapFrom(s => s.Id))
                ;
            }
        }
    }
}