using System;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public Guid EntityId { get; set; }
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
        public string Title { get; set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        public string InstitutionOfficialName { get; set; }
        public string InstitutionCountryOfficialName { get; set; }
        public string FormattedInfo { get; set; }   // used in Degree List, for display only
    }

    public class DegreeSearchInputModel
    {
        public int PersonId { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PageOfDegreeApiModel : PageOf<DegreeApiModel> { }

    public static class DegreeApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            public class FormattedInfoResolver : ValueResolver<Degree, String>
            {
                private readonly IQueryEntities _entities;

                public FormattedInfoResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Degree source)
                {
                    string info = null;

                    if (source.YearAwarded.HasValue)
                    {
                        info = source.YearAwarded.ToString();
                    }

                    if (source.InstitutionId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                .SingleOrDefault(x => x.RevisionId == source.InstitutionId);

                        if (institution != null)
                        {
                            if (!String.IsNullOrEmpty(info))
                            {
                                info += ", ";
                            }

                            info = String.Format("{0}{1}", info, institution.OfficialName);

                            var country = institution.Location.Places.FirstOrDefault(x => x.IsCountry);
                            if (country != null)
                            {
                                if (!String.IsNullOrEmpty(info))
                                {
                                    info += ", ";
                                }

                                info = String.Format("{0}{1}", info, country.OfficialName);
                            }
                        }
                    }

                    return info;
                }
            }

            public class InstitutionNameResolver : ValueResolver<Degree, String>
            {
                private readonly IQueryEntities _entities;

                public InstitutionNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Degree source)
                {
                    string info = null;

                    if (source.InstitutionId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                .SingleOrDefault(x => x.RevisionId == source.InstitutionId);

                        if (institution != null)
                        {
                            info = institution.OfficialName;
                        }
                    }

                    return info;
                }
            }

            public class InstitutionCountryNameResolver : ValueResolver<Degree, String>
            {
                private readonly IQueryEntities _entities;

                public InstitutionCountryNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Degree source)
                {
                    string info = null;

                    if (source.InstitutionId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                .SingleOrDefault(x => x.RevisionId == source.InstitutionId);

                        if (institution != null)
                        {
                            var country = institution.Location.Places.FirstOrDefault(x => x.IsCountry);
                            if (country != null)
                            {
                                info = country.OfficialName;
                            }
                        }
                    }

                    return info;
                }
            }

            protected override void Configure()
            {
                CreateMap<Degree, DegreeApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.Title, o => o.MapFrom(s => s.Title))
                    .ForMember(d => d.YearAwarded, o => o.MapFrom(s => s.YearAwarded))
                    .ForMember(d => d.InstitutionId, o => o.MapFrom(s => s.InstitutionId))
                    .ForMember(d => d.InstitutionOfficialName, o => o.ResolveUsing<InstitutionNameResolver>()
                        .ConstructedBy(() => new InstitutionNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.InstitutionCountryOfficialName, o => o.ResolveUsing<InstitutionCountryNameResolver>()
                        .ConstructedBy(() => new InstitutionCountryNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.FormattedInfo, o => o.ResolveUsing<FormattedInfoResolver>()
                        .ConstructedBy(() => new FormattedInfoResolver(DependencyResolver.Current.GetService<IQueryEntities>()))) // Yucky
                    ;

                CreateMap<DegreeSearchInputModel, DegreesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());
            }
        }

        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<DegreeApiModel, CreateDegree>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.CreatedDegree, o => o.Ignore())
                    .ForMember(d => d.Title, o => o.MapFrom(s => s.Title))
                    .ForMember(d => d.YearAwarded, o => o.MapFrom(s => s.YearAwarded))
                    .ForMember(d => d.InstitutionId, o => o.MapFrom(s => s.InstitutionId))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    ;

                CreateMap<DegreeApiModel, UpdateDegree>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOn, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Title, o => o.MapFrom(s => s.Title))
                    .ForMember(d => d.YearAwarded, o => o.MapFrom(s => s.YearAwarded))
                    .ForMember(d => d.InstitutionId, o => o.MapFrom(s => s.InstitutionId))
                    ;
            }
        }


        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Degree>, PageOfDegreeApiModel>();
            }
        }
    }
}