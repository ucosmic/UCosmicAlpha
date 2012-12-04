using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentUrlApiModel
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public string Value { get; set; }
        public bool IsOfficialUrl { get; set; }
        public bool IsFormerUrl { get; set; }
    }

    public static class EstablishmentUrlApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentUrl, EstablishmentUrlApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.OwnerId, o => o.MapFrom(s => s.ForEstablishment.RevisionId))
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentUrlApiModel, UpdateEstablishmentUrl>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentUrlApiModel, CreateEstablishmentUrl>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }
    }
}