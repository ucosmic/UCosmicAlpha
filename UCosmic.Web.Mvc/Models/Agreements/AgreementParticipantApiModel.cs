using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models.Agreements
{
    public class AgreementParticipantApiModel
    {
        public bool IsOwner { get; set; }
        public int? AgreementId { get; set; }
        public int EstablishmentId { get; set; }
        public string EstablishmentOfficialName { get; set; }
        public string EstablishmentTranslatedName { get; set; }
    }

    public static class AgreementParticipantApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementParticipant, AgreementParticipantApiModel>()
                    .ForMember(d => d.AgreementId, o => o.MapFrom(s =>
                        s.Agreement.Id == 0 ? (int?)null : s.Agreement.Id))
                    .ForMember(d => d.EstablishmentId, o => o.MapFrom(s => s.Establishment.RevisionId))
                    .ForMember(d => d.EstablishmentOfficialName, o => o.MapFrom(s =>
                        s.Establishment.OfficialName == s.Establishment.TranslatedName.Text ? null : s.Establishment.OfficialName))
                ;
            }
        }
    }
}