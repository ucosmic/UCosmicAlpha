using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementParticipantApiModel
    {
        public bool IsOwner { get; set; }
        public int? AgreementId { get; set; }
        public int EstablishmentId { get; set; }
        public string EstablishmentOfficialName { get; set; }
        public string EstablishmentTranslatedName { get; set; }
        public MapPointModel Center { get; set; }
        public int? GoogleMapZoomLevel { get; set; }
    }

    public static class AgreementParticipantApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementParticipant, AgreementParticipantApiModel>()
                    .ForMember(d => d.AgreementId, o => o.MapFrom(s =>
                        s.AgreementId == 0 ? (int?)null : s.AgreementId))
                    .ForMember(d => d.EstablishmentId, o => o.MapFrom(s => s.Establishment.RevisionId))
                    .ForMember(d => d.EstablishmentOfficialName, o => o.MapFrom(s =>
                        s.Establishment.OfficialName == s.Establishment.TranslatedName.Text ? null : s.Establishment.OfficialName))
                    .ForMember(d => d.Center, o => o.MapFrom(s => s.Establishment.Location.Center))
                    .ForMember(d => d.GoogleMapZoomLevel, o => o.MapFrom(s => s.Establishment.Location.GoogleMapZoomLevel))
                ;
            }
        }

        public class EntityToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementParticipantApiModel, CreateParticipant>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }
    }
}