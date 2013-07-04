using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain;
using UCosmic.Domain.InternationalAffiliations;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class InternationalAffiliationLocationApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
        public int AffiliationId { get; set; }
        public string PlaceOfficialName { get; set; }
        public int PlaceId { get; set; }
    }

    public class InternationalAffiliationApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
        public int From { get; set; }
        public int? To { get; set; }
        public bool OnGoing { get; set; }
        public string Institution { get; set; }
        public string Position { get; set; }
        public ICollection<InternationalAffiliationLocationApiModel> Locations { get; set; }
    }

    public class InternationalAffiliationSearchInputModel
    {
        public int PersonId { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PageOfInternationalAffiliationApiModel : PageOf<InternationalAffiliationApiModel> { }

    public static class InternationalAffiliationApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            public class PlaceOfficialNameNameResolver : ValueResolver<InternationalAffiliationLocation, String>
            {
                private readonly IQueryEntities _entities;

                public PlaceOfficialNameNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(InternationalAffiliationLocation source)
                {
                    var place = _entities.Query<Place>().SingleOrDefault(x => x.RevisionId == source.PlaceId);
                    return place != null ? place.OfficialName : null;
                }
            }

            protected override void Configure()
            {
                CreateMap<InternationalAffiliation, InternationalAffiliationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.From, o => o.MapFrom(s => s.From.Year))
                    .ForMember(d => d.To, o => o.MapFrom(s => (s.To.HasValue ? s.To.Value.Year : (int?)null)))
                    ;

                CreateMap<InternationalAffiliationLocation, InternationalAffiliationLocationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.AffiliationId, o => o.MapFrom(s => s.InternationalAffiliationId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.PlaceOfficialName, o => o.ResolveUsing<PlaceOfficialNameNameResolver>()
                        .ConstructedBy(() => new PlaceOfficialNameNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    ;

                CreateMap<InternationalAffiliationSearchInputModel, InternationalAffiliationsByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());
            }
        }

        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<InternationalAffiliationApiModel, CreateInternationalAffiliation>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.CreatedInternationalAffiliation, o => o.Ignore())
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.From, o => o.MapFrom(s => new DateTime(s.From, 1, 1)))
                    .ForMember(d => d.To, o => o.MapFrom(s => s.To.HasValue ? new DateTime(s.To.Value, 1, 1) : (DateTime?)null))
                    .ForMember(d => d.OnGoing, o => o.MapFrom(s => s.OnGoing))
                    .ForMember(d => d.Institution, o => o.MapFrom(s => s.Institution))
                    .ForMember(d => d.Position, o => o.MapFrom(s => s.Position))
                    ;

                CreateMap<InternationalAffiliationApiModel, UpdateInternationalAffiliation>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOn, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.From, o => o.MapFrom(s => new DateTime(s.From, 1, 1)))
                    .ForMember(d => d.To, o => o.MapFrom(s => s.To.HasValue ? new DateTime(s.To.Value, 1, 1) : (DateTime?)null))
                    .ForMember(d => d.OnGoing, o => o.MapFrom(s => s.OnGoing))
                    .ForMember(d => d.Institution, o => o.MapFrom(s => s.Institution))
                    .ForMember(d => d.Position, o => o.MapFrom(s => s.Position))
                    ;

                CreateMap<InternationalAffiliationLocationApiModel, InternationalAffiliationLocation>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.InternationalAffiliation, o => o.Ignore())
                    .ForMember(d => d.InternationalAffiliationId, o => o.MapFrom(s => s.AffiliationId))
                    .ForMember(d => d.Place, o => o.Ignore())
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<InternationalAffiliation>, PageOfInternationalAffiliationApiModel>();
            }
        }
    }
}