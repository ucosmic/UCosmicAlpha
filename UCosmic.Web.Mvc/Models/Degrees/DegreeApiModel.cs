using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        public string InstitutionOfficialName { get; set; }
        public string InstitutionCountryOfficialName { get; set; }
        public string InstitutionTranslatedName { get; set; }
        public string FormattedInfo { get; set; }   // used in Degree List, for display only

        internal static readonly IEnumerable<Expression<Func<Degree, object>>> EagerLoads = new Expression<Func<Degree, object>>[]
        {
            x => x.Institution.Location.Places,
        };

    }

    public class PageOfDegreeApiModel : PageOf<DegreeApiModel> { }

    public static class DegreeApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            public class FormattedInfoResolver : ValueResolver<Degree, string>
            {
                private readonly IQueryEntities _entities;

                public FormattedInfoResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Degree source)
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
                        //var official_name = _entities.Query<EstablishmentName>()
                        //                        .SingleOrDefault(x => x.ForEstablishment.RevisionId == source.InstitutionId && x.IsOfficialName).Text;

                        if (institution != null)
                        {
                            if (!string.IsNullOrEmpty(info))
                            {
                                info += ", ";
                            }

                            //info = string.Format("{0}{1}", info, official_name);
                            info = string.Format("{0}{1}", info, institution.OfficialName);

                            var country = institution.Location.Places.FirstOrDefault(x => x.IsCountry);
                            if (country != null)
                            {
                                if (!string.IsNullOrEmpty(info))
                                {
                                    info += ", ";
                                }

                                info = string.Format("{0}{1}", info, country.OfficialName);
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
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    //.ForMember(d => d.InstitutionOfficialName, o => o.MapFrom(s =>
                    //    s.Institution.Names.SingleOrDefault(x => x.IsOfficialName).Text))
                    .ForMember(d => d.InstitutionOfficialName, o => o.MapFrom(s =>
                        s.Institution.OfficialName == s.Institution.TranslatedName.Text ? null : s.Institution.OfficialName))
                    //.ForMember(d => d.InstitutionOfficialName, o => o.MapFrom(s => s.InstitutionId.HasValue ? s.Institution.OfficialName : null))
                    .ForMember(d => d.InstitutionCountryOfficialName, o => o.MapFrom(s => 
                        s.InstitutionId.HasValue && s.Institution.Location.Places.Any(x => x.IsCountry)
                            ? s.Institution.Location.Places.FirstOrDefault(x => x.IsCountry) : null))
                    .ForMember(d => d.FormattedInfo, o => o.ResolveUsing<FormattedInfoResolver>()
                        .ConstructedBy(() => new FormattedInfoResolver(DependencyResolver.Current.GetService<IQueryEntities>()))) // Yucky
                    ;

            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<DegreeApiModel, CreateDegree>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.CreatedDegreeId, o => o.Ignore())
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<DegreeApiModel, UpdateDegree>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.DegreeId, o => o.Ignore())
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Degree>, PageOfDegreeApiModel>();
            }
        }
    }
}