using AutoMapper;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageApiModel
    {
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public static class LanguageApiModelProfiler
    {
        public class ViewToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<LanguageView, LanguageApiModel>()
                    .ForMember(d => d.Code, o => o.MapFrom(s => s.TwoLetterIsoCode))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.TranslatedName))
                ;
            }
        }
    }
}