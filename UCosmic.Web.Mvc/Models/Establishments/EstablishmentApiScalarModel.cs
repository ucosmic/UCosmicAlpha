using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentApiScalarModel
    {
        public int Id { get; set; }
        public int? ParentId { get; set; }
        public int TypeId { get; set; }
        public string UCosmicCode { get; set; }
        public string ExternalId { get; set; }
        public string CeebCode { get; set; }
    }

    public static class EstablishmentApiScalarProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Establishment, EstablishmentApiScalarModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ParentId, o => o.MapFrom(s => s.Parent != null ? s.Parent.RevisionId : (int?)null))
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => s.Type.RevisionId))
                    .ForMember(d => d.CeebCode, o => o.MapFrom(s => s.CollegeBoardDesignatedIndicator))
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentApiScalarModel, UpdateEstablishment>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentApiScalarModel, CreateEstablishment>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.OfficialName, o => o.Ignore())
                    .ForMember(d => d.OfficialUrl, o => o.Ignore())
                    .ForMember(d => d.Location, o => o.Ignore())
                    .ForMember(d => d.CreatedEstablishmentId, o => o.Ignore())
                ;
            }
        }
    }
}