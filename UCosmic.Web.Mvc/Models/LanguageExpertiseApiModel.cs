using System;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.LanguageExpertises;
using UCosmic.Domain.Languages;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageExpertiseApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
        public int? LanguageId { get; set; }
        public string Dialect { get; set; }
        public string Other { get; set; }
        public int SpeakingProficiency { get; set; }
        public int ListeningProficiency { get; set; }
        public int ReadingProficiency { get; set; }
        public int WritingProficiency { get; set; }
        public string LanguageName { get; set; }
    }

    public class LanguageExpertiseSearchInputModel
    {
        public int PersonId { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PageOfLanguageExpertiseApiModel : PageOf<LanguageExpertiseApiModel> { }

    public static class LanguageExpertiseApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            public class LanguageNameResolver : ValueResolver<LanguageExpertise, String>
            {
                private readonly IQueryEntities _entities;

                public LanguageNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(LanguageExpertise source)
                {
                    String name = null;

                    if (source.LanguageId.HasValue)
                    {
                        var languageName =
                            _entities.Query<LanguageName>().FirstOrDefault(x => x.LanguageId == source.LanguageId.Value);
                        name = languageName != null ? languageName.Text : null;
                        if (!String.IsNullOrEmpty(source.Dialect))
                        {
                            name = String.Format("{0}, {1}", name, source.Dialect);
                        }
                    }
                    else
                    {
                        name = source.Other;
                        if (!String.IsNullOrEmpty(source.Dialect))
                        {
                            name = String.Format("{0}, {1}", name, source.Dialect);
                        }
                    }
                    return name;
                }
            }

            protected override void Configure()
            {
                CreateMap<LanguageExpertise, LanguageExpertiseApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.LanguageId, o => o.MapFrom(s => s.LanguageId))
                    .ForMember(d => d.Dialect, o => o.MapFrom(s => s.Dialect))
                    .ForMember(d => d.Other, o => o.MapFrom(s => s.Other))
                    .ForMember(d => d.SpeakingProficiency, o => o.MapFrom(s => s.SpeakingProficiency))
                    .ForMember(d => d.ListeningProficiency, o => o.MapFrom(s => s.ListeningProficiency))
                    .ForMember(d => d.ReadingProficiency, o => o.MapFrom(s => s.ReadingProficiency))
                    .ForMember(d => d.WritingProficiency, o => o.MapFrom(s => s.WritingProficiency))
                    .ForMember(d => d.LanguageName, o => o.ResolveUsing<LanguageNameResolver>()
                        .ConstructedBy(() => new LanguageNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    ;

                CreateMap<LanguageExpertiseSearchInputModel, LanguageExpertisesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());
            }
        }

        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<LanguageExpertiseApiModel, CreateLanguageExpertise>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.CreatedLanguageExpertise, o => o.Ignore())
                    .ForMember(d => d.LanguageId, o => o.MapFrom(s => s.LanguageId))
                    .ForMember(d => d.Dialect, o => o.MapFrom(s => s.Dialect))
                    .ForMember(d => d.Other, o => o.MapFrom(s => s.Other))
                    .ForMember(d => d.SpeakingProficiency, o => o.MapFrom(s => s.SpeakingProficiency))
                    .ForMember(d => d.ListeningProficiency, o => o.MapFrom(s => s.ListeningProficiency))
                    .ForMember(d => d.ReadingProficiency, o => o.MapFrom(s => s.ReadingProficiency))
                    .ForMember(d => d.WritingProficiency, o => o.MapFrom(s => s.WritingProficiency))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    ;

                CreateMap<LanguageExpertiseApiModel, UpdateLanguageExpertise>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOn, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.LanguageId, o => o.MapFrom(s => s.LanguageId))
                    .ForMember(d => d.Dialect, o => o.MapFrom(s => s.Dialect))
                    .ForMember(d => d.Other, o => o.MapFrom(s => s.Other))
                    .ForMember(d => d.SpeakingProficiency, o => o.MapFrom(s => s.SpeakingProficiency))
                    .ForMember(d => d.ListeningProficiency, o => o.MapFrom(s => s.ListeningProficiency))
                    .ForMember(d => d.ReadingProficiency, o => o.MapFrom(s => s.ReadingProficiency))
                    .ForMember(d => d.WritingProficiency, o => o.MapFrom(s => s.WritingProficiency))
                    ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<LanguageExpertise>, PageOfLanguageExpertiseApiModel>();
            }
        }
    }
}