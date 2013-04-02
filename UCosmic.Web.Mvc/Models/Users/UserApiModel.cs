using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Models
{
    public class UserApiModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int PersonId { get; set; }
        public string PersonDisplayName { get; set; }
        public IEnumerable<RoleApiModel> Roles { get; set; }
    }

    public class PageOfUserApiModel : PageOf<UserApiModel> { }

    public static class UserApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<User, UserApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.Person.RevisionId))
                    .ForMember(d => d.Roles, o => o.MapFrom(s => s.Grants.Select(x => x.Role)))
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<User>, PageOfUserApiModel>();
            }
        }
    }
}