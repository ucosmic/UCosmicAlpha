using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentApiScalarModel
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string UCosmicCode { get; set; }
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
    }
}