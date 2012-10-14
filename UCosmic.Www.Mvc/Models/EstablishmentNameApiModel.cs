using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Www.Mvc.Models
{
    public class EstablishmentNameApiModel
    {
        public int RevisionId { get; set; }
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
                    .ForMember(d => d.LanguageName, o => o.ResolveUsing(s =>
                        s.TranslationToLanguage == null ? null : s.TranslationToLanguage.GetTranslatedName()))
                    .ForMember(d => d.LanguageCode, o => o.ResolveUsing(s => 
                        s.TranslationToLanguage == null ? null : s.TranslationToLanguage.TwoLetterIsoCode))
                ;
            }
        }
    }
}