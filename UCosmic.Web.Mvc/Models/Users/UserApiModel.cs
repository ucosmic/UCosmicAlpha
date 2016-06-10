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
        public string Email { get; set; }
        public int? PersonId { get; set; }
        public string PersonDisplayName { get; set; }
        public bool IsRegistered { get; set; }
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
                    .ForMember(d => d.Email, o => o.MapFrom(s => s.Name))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.Person.DefaultEmail))
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

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<UserApiModel, CreateUser>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.CreatedUserId, o => o.Ignore())
                    .ForMember(d => d.Name, o => o.Ignore())
                ;
            }
        }

    }
}