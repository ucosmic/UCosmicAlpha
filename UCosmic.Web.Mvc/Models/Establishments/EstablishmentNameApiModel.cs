using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentNameApiModel
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public string Text { get; set; }
        public bool IsOfficialName { get; set; }
        public bool IsFormerName { get; set; }
        public string LanguageName { get; set; }
        public string LanguageCode { get; set; }
    }

    public static class EstablishmentNameApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentName, EstablishmentNameApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.OwnerId, o => o.MapFrom(s => s.ForEstablishment.RevisionId))
                    .ForMember(d => d.LanguageName, o => o.ResolveUsing(s =>
                        s.TranslationToLanguage == null ? null : s.TranslationToLanguage.GetTranslatedName()))
                    .ForMember(d => d.LanguageCode, o => o.ResolveUsing(s => 
                        s.TranslationToLanguage == null ? null : s.TranslationToLanguage.TwoLetterIsoCode))
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentNameApiModel, UpdateEstablishmentName>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentNameApiModel, CreateEstablishmentName>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }
    }
}