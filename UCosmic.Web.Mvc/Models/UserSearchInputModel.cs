using AutoMapper;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Models
{
    public class UserSearchInputModel
    {
        public UserSearchInputModel()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public string Keyword { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public static class UserSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<UserSearchInputModel, MyUsersByKeyword>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())
                ;
            }
        }
    }
}