using System;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models.Agreements
{
    public class AgreementSettingsApiModel
    {
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
                ;
            }
        }
    }
}