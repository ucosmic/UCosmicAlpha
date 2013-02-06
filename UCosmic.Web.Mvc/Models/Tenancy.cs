using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;
namespace UCosmic.Web.Mvc.Models
{
    public class Tenancy
    {
        public string StyleDomain { get; set; }
        public int? TenantId { get; set; }
        public int? PersonId { get; set; }
        public int? UserId { get; set; }
        public string CustomProfileTitle { get; set; }
    }

    public static class TenancyProfiler
    {
        public class EntitiesToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<User, Tenancy>()
                    .ForMember(d => d.StyleDomain, o => o.MapFrom(s => s.Person.DefaultAffiliation.Establishment.WebsiteUrl.GetUrlDomain()))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.Person.RevisionId))
                    .ForMember(d => d.TenantId, o => o.MapFrom(s => s.Person.DefaultAffiliation.EstablishmentId))
                    .ForMember(d => d.UserId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.CustomProfileTitle, o => o.Ignore())
                ;
                CreateMap<EmployeeModuleSettings, Tenancy>()
                    .ForMember(d => d.CustomProfileTitle, o => o.MapFrom(s => s.PersonalInfoAnchorText))
                    .ForMember(d => d.StyleDomain, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.TenantId, o => o.Ignore())
                    .ForMember(d => d.UserId, o => o.Ignore())
                ;
            }
        }
    }
}