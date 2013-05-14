using System;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.GeographicExpertises;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class GeographicExpertiseApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public Guid EntityId { get; set; }
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
        public int PlaceId { get; set; }
        public string Description { get; set; }
        public string PlaceOfficialName { get; set; }
    }

    public class GeographicExpertiseSearchInputModel
    {
        public int PersonId { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PageOfGeographicExpertiseApiModel : PageOf<GeographicExpertiseApiModel> { }

    public static class GeographicExpertiseApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            public class PlaceOfficialNameNameResolver : ValueResolver<GeographicExpertise, String>
            {
                private readonly IQueryEntities _entities;

                public PlaceOfficialNameNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(GeographicExpertise source)
                {
                    var place = _entities.Query<Place>()
                                                .SingleOrDefault(x => x.RevisionId == source.PlaceId);
                    return place != null ? place.OfficialName : null;
                }
            }

            protected override void Configure()
            {
                CreateMap<GeographicExpertise, GeographicExpertiseApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.Description, o => o.MapFrom(s => s.Description))
                    .ForMember(d => d.PlaceOfficialName, o => o.ResolveUsing<PlaceOfficialNameNameResolver>()
                        .ConstructedBy(() => new PlaceOfficialNameNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    ;

                CreateMap<GeographicExpertiseSearchInputModel, GeographicExpertisesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());
            }
        }

        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<GeographicExpertiseApiModel, CreateGeographicExpertise>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.CreatedGeographicExpertise, o => o.Ignore())
                    .ForMember(d => d.Description, o => o.MapFrom(s => s.Description))
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    ;

                CreateMap<GeographicExpertiseApiModel, UpdateGeographicExpertise>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOn, o => o.Ignore())
                    .ForMember(d => d.NoCommit, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Description, o => o.MapFrom(s => s.Description))
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    ;
            }
        }


        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<GeographicExpertise>, PageOfGeographicExpertiseApiModel>();
            }
        }
    }
}