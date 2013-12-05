using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.LanguageExpertise;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageExpertiseViewModel
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public int? LanguageId { get; set; }
        public string Dialect { get; set; }
        public string Other { get; set; }
        public int SpeakingProficiency { get; set; }
        public int ListeningProficiency { get; set; }
        public int ReadingProficiency { get; set; }
        public int WritingProficiency { get; set; }
        public string LanguageName { get; set; }    // For Language Expertises page
    }
    
    public static class LanguageExpertiseViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<LanguageExpertise, LanguageExpertiseViewModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.LanguageId, o => o.MapFrom(s => s.LanguageId))
                    .ForMember(d => d.Dialect, o => o.MapFrom(s => s.Dialect))
                    .ForMember(d => d.Other, o => o.MapFrom(s => s.Other))
                    .ForMember(d => d.SpeakingProficiency, o => o.MapFrom(s => s.SpeakingProficiency))
                    .ForMember(d => d.ListeningProficiency, o => o.MapFrom(s => s.ListeningProficiency))
                    .ForMember(d => d.ReadingProficiency, o => o.MapFrom(s => s.ReadingProficiency))
                    .ForMember(d => d.WritingProficiency, o => o.MapFrom(s => s.WritingProficiency))
                    .ForMember(d => d.LanguageName, o => o.MapFrom(s => s.LanguageId.HasValue ? s.Language.GetTranslatedName() : null))
                    ;

            }
        }

    }
}