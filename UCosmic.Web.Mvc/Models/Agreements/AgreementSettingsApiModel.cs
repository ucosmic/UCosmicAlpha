using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementSettingsApiModel
    {
        public int Id { get; set; }
        public bool IsCustomTypeAllowed { get; set; }
        public bool IsCustomStatusAllowed { get; set; }
        public bool IsCustomContactTypeAllowed { get; set; }

        public string[] TypeOptions { get; set; }
        public string[] StatusOptions { get; set; }
        public string[] ContactTypeOptions { get; set; }
    }

    public static class AgreementSettingsProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementSettings, AgreementSettingsApiModel>()
                    .ForMember(d => d.TypeOptions, o => o.MapFrom(s => s.AllowedTypeValues.Select(x => x.Text)))
                    .ForMember(d => d.StatusOptions, o => o.MapFrom(s => s.AllowedStatusValues.Select(x => x.Text)))
                    .ForMember(d => d.ContactTypeOptions, o => o.MapFrom(s => s.AllowedContactTypeValues.Select(x => x.Text)))
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                ;
            }
        }

        public class ModelToCreateOrUpdateSettingsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementSettingsApiModel, CreateOrUpdateSettings>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.Ignore())
                    .ForMember(d => d.AllowedTypeValues, o => o.MapFrom(s => s.TypeOptions))
                    .ForMember(d => d.AllowedStatusValues, o => o.MapFrom(s => s.StatusOptions))
                    .ForMember(d => d.AllowedContactTypeValues, o => o.MapFrom(s => s.ContactTypeOptions))
                    //.ForMember(d => d.StatusOptions, o => o.MapFrom(s => s.AllowedStatusValues.Select(x => x.Text)))
                    //.ForMember(d => d.ContactTypeOptions, o => o.MapFrom(s => s.AllowedContactTypeValues.Select(x => x.Text)))
                    //.ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                ;
            }
        }
    }
}