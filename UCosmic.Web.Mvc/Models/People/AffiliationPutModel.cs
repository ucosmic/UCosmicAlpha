using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class AffiliationPutModel
    {
        public int? EstablishmentId { get; set; }
        public int? FacultyRankId { get; set; }
        public string JobTitles { get; set; }
    }

    public static class AffiliationPutProfiler
    {
        public class ModelToCreateCommand : Profile
        {
            protected override void Configure()
            {
                CreateMap<AffiliationPutModel, CreateAffiliation>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.Created, o => o.Ignore())
                ;
            }
        }

        public class ModelToUpdateCommand : Profile
        {
            protected override void Configure()
            {
                CreateMap<AffiliationPutModel, UpdateAffiliation>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.NewEstablishmentId, o => o.MapFrom(s => s.EstablishmentId))
                ;
            }
        }
    }
}