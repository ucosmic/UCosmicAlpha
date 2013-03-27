using AutoMapper;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Models
{
    public class RoleApiModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class PageOfRoleApiModel : PageOf<RoleApiModel> { }

    public static class RoleApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Role, RoleApiModel>()
                    .ForMember(d => d.Id, o => o.ResolveUsing(s => s.RevisionId))
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Role>, PageOfRoleApiModel>();
            }
        }
    }
}