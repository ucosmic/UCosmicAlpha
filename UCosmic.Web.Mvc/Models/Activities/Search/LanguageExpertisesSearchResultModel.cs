using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using AutoMapper;
using UCosmic.Domain.LanguageExpertises;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageExpertiseSearchResultModel
    {
        public int LanguageExpertiseId { get; set; }
        public string SpeakingProficiency { get; set; }
        public string ListeningProficiency { get; set; }
        public string WritingProficiency { get; set; }
        public string ReadingProficiency { get; set; }
        public string Name { get; set; }
        public string Dialect { get; set; }
        public string Other { get; set; }
        public LanguageExpertiseSearchResultOwnerModel Owner { get; set; }
        //public LanguageExpertiseSearchResultEstablishmentModel AlmaMater { get; set; }

        public class LanguageExpertiseSearchResultOwnerModel
        {
            public int PersonId { get; set; }
            public string DisplayName { get; set; }
            public string LastCommaFirst { get; set; }
        }

    }

    public class PageOfLanguageExpertiseSearchResultModel : PageOf<LanguageExpertiseSearchResultModel>
    {
    }

    public static class LanguageExpertiseSearchResultProfiler
    {
        public class EntitiyToModel : Profile
        {
            public static IList<Expression<Func<LanguageExpertise, object>>> EagerLoad = new Expression<Func<LanguageExpertise, object>>[]
            {
                x => x.Person,
            };

            protected override void Configure()
            {
                CreateMap<LanguageExpertise, LanguageExpertiseSearchResultModel>()
                    .ForMember(d => d.LanguageExpertiseId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Owner, o => o.MapFrom(s => s.Person))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.Language.Names.FirstOrDefault().Text))
                    .ForMember(d => d.Dialect, o => o.MapFrom(s => s.Dialect))
                    .ForMember(d => d.Other, o => o.MapFrom(s => s.Other))
                    //.ForMember(d => d.ListeningProficiency, o => o.MapFrom(s => s.ListeningProficiency))
                    //.ForMember(d => d.ReadingProficiency, o => o.MapFrom(s => s.ReadingProficiency))
                    //.ForMember(d => d.WritingProficiency, o => o.MapFrom(s => s.WritingProficiency))
                    //.ForMember(d => d.SpeakingProficiency, o => o.MapFrom(s => s.SpeakingProficiency))
                    
                    .ForMember(d => d.SpeakingProficiency, o => o.ResolveUsing(s =>
                    {
                         if(s.SpeakingProficiency == 1){
                            return "Elementary speaking";
                        }else if(s.SpeakingProficiency == 2){
                            return "Limited speaking";
                        }else if(s.SpeakingProficiency == 3){
                            return "General speaking";
                        }else if(s.SpeakingProficiency == 4){
                            return "Advanced speaking";
                        }else if(s.SpeakingProficiency == 5){
                            return "Fluent speaking";
                        }else  {
                          return "Not able to speak";                          
                        }
                    }))
                    .ForMember(d => d.ListeningProficiency, o => o.ResolveUsing(s =>
                    {
                         if(s.ListeningProficiency == 1){
                            return "elementary listening";
                        }else if(s.ListeningProficiency == 2){
                            return "limited listening";
                        }else if(s.ListeningProficiency == 3){
                            return "general listening";
                        }else if(s.ListeningProficiency == 4){
                            return "advanced listening";
                        }else if(s.ListeningProficiency == 5){
                            return "fluent listening";
                        }else {
                          return "not able to listen";                          
                        }
                    }))
                    .ForMember(d => d.WritingProficiency, o => o.ResolveUsing(s =>
                    {
                        if(s.WritingProficiency == 1){
                            return "elementary writing";
                        }else if(s.WritingProficiency == 2){
                            return "limited writing";
                        }else if(s.WritingProficiency == 3){
                            return "general writing";
                        }else if(s.WritingProficiency == 4){
                            return "advanced writing";
                        }else if(s.WritingProficiency == 5){
                            return "fluent writing";
                        } else {
                          return "not able to write";                          
                        }
                    }))
                    .ForMember(d => d.ReadingProficiency, o => o.ResolveUsing(s =>
                    {
                        if(s.ReadingProficiency == 1){
                            return "and elementary reading.";
                        }else if(s.ReadingProficiency == 2){
                            return "and limited reading.";
                        }else if(s.ReadingProficiency == 3){
                            return "and general reading.";
                        }else if(s.ReadingProficiency == 4){
                            return "and advanced reading.";
                        }else if (s.ReadingProficiency == 5){
                            return "and fluent reading.";
                        }else {
                          return "and not able to read.";                          
                        }
                    }))

                ;
            }
        }

        public class PersonToOwner : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, LanguageExpertiseSearchResultModel.LanguageExpertiseSearchResultOwnerModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.LastCommaFirst, o => o.ResolveUsing(s =>
                    {
                        if (!string.IsNullOrWhiteSpace(s.LastName))
                        {
                            var builder = new StringBuilder(s.LastName);
                            if (!string.IsNullOrWhiteSpace(s.Salutation) || !string.IsNullOrWhiteSpace(s.FirstName) ||
                                !string.IsNullOrWhiteSpace(s.MiddleName) || !string.IsNullOrWhiteSpace(s.Suffix))
                                builder.Append(",");
                            if (!string.IsNullOrWhiteSpace(s.Salutation))
                                builder.Append(string.Format(" {0}", s.Salutation));
                            if (!string.IsNullOrWhiteSpace(s.FirstName))
                                builder.Append(string.Format(" {0}", s.FirstName));
                            if (!string.IsNullOrWhiteSpace(s.MiddleName))
                                builder.Append(string.Format(" {0}", s.MiddleName));
                            if (!string.IsNullOrWhiteSpace(s.Suffix))
                                builder.Append(string.Format(" {0}", s.Suffix));
                            return builder.ToString();
                        }
                        return s.DisplayName;
                    }))
                ;
            }
        }

        //public class EstablishmentToModel : Profile
        //{
        //    protected override void Configure()
        //    {
        //        CreateMap<Establishment, LanguageExpertiseSearchResultModel.LanguageExpertiseSearchResultEstablishmentModel>()
        //            .ForMember(d => d.EstablishmentId, o => o.MapFrom(s => s.RevisionId))
        //        ;
        //    }
        //}

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<LanguageExpertise>, PageOfLanguageExpertiseSearchResultModel>();
            }
        }
    }
}