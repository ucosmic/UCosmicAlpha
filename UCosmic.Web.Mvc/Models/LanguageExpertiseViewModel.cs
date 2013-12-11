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
        public string LanguageName { get; set; } // For Language Expertises page
        public LanguageExpertiseItemViewModel Speaking { get; set; }
        public LanguageExpertiseItemViewModel Listening { get; set; }
        public LanguageExpertiseItemViewModel Reading { get; set; }
        public LanguageExpertiseItemViewModel Writing { get; set; }


        //public int SpeakingProficiency { get; set; }
        //public int ListeningProficiency { get; set; }
        //public int ReadingProficiency { get; set; }
        //public int WritingProficiency { get; set; }
        //public string SpeakingMeaning { get; set; }
        //public string ReadingMeaning { get; set; }
        //public string ListeningMeaning { get; set; }
        //public string WritingMeaning { get; set; }
        //public string SpeakingDescription { get; set; }
        //public string ReadingDescription { get; set; }
        //public string ListeningDescription { get; set; }
        //public string WritingDescription { get; set; }
    }

    public class LanguageExpertiseItemViewModel
    {
        public string Meaning { get; set; }
        public int Proficiency { get; set; }
        public string Description { get; set; }
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
                    .ForMember(d => d.LanguageName, o => o.MapFrom(s => s.LanguageId.HasValue ? s.Language.GetTranslatedName() : null))
                    .ForMember(d => d.Speaking, o => o.MapFrom(s => new LanguageExpertiseItemViewModel
                    {
                        Proficiency = s.SpeakingProficiency,
                        Description = LanguageProficiency.Scales[s.SpeakingProficiency].Description,
                        Meaning = LanguageProficiency.SpeakingMeanings
                        .SingleOrDefault(m => m.Proficiency == LanguageProficiency.Scales[s.SpeakingProficiency].Proficiency).Description
                    }))
                    .ForMember(d => d.Listening, o => o.MapFrom(s => new LanguageExpertiseItemViewModel
                    {
                        Proficiency = s.ListeningProficiency,
                        Description = LanguageProficiency.Scales[s.ListeningProficiency].Description,
                        Meaning = LanguageProficiency.ListeningMeanings
                        .SingleOrDefault(m => m.Proficiency == LanguageProficiency.Scales[s.ListeningProficiency].Proficiency).Description
                    }))
                    .ForMember(d => d.Reading, o => o.MapFrom(s => new LanguageExpertiseItemViewModel
                    {
                        Proficiency = s.ReadingProficiency,
                        Description = LanguageProficiency.Scales[s.ReadingProficiency].Description,
                        Meaning = LanguageProficiency.ReadingMeanings
                        .SingleOrDefault(m => m.Proficiency == LanguageProficiency.Scales[s.ReadingProficiency].Proficiency).Description
                    }))
                    .ForMember(d => d.Writing, o => o.MapFrom(s => new LanguageExpertiseItemViewModel
                    {
                        Proficiency = s.WritingProficiency,
                        Description = LanguageProficiency.Scales[s.WritingProficiency].Description,
                        Meaning = LanguageProficiency.WritingMeanings
                        .SingleOrDefault(m => m.Proficiency == LanguageProficiency.Scales[s.WritingProficiency].Proficiency).Description
                    }))
                    ;
            }
        }

    }
}