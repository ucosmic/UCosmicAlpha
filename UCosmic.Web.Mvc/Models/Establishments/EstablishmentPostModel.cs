using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentPostModel
    {
        public int TypeId { get; set; }
        public int? ParentId { get; set; }
        public EstablishmentNameApiModel OfficialName { get; set; }
        public EstablishmentUrlApiModel OfficialUrl { get; set; }
        public EstablishmentLocationPutModel Location { get; set; }
        public string UCosmicCode { get; set; }
        public string ExternalId { get; set; }
        public string CeebCode { get; set; }
    }

    public static class EstablishmentPostProfiler
    {
        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentPostModel, CreateEstablishment>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.CreatedEstablishmentId, o => o.Ignore())
                ;
            }
        }
    }
}