using UCosmic.Domain.Places;

namespace UCosmic.Domain.Agreements
{
    public class AgreementParticipantView
    {
        public bool IsOwner { get; set; }
        public int? AgreementId { get; set; }
        public int EstablishmentId { get; set; }
        public string EstablishmentOfficialName { get; set; }
        public string EstablishmentTranslatedName { get; set; }
        public MapPointView Center { get; set; }

        public AgreementParticipantView() { }

        public AgreementParticipantView(AgreementParticipant entity)
        {
            IsOwner = entity.IsOwner;
            AgreementId = entity.AgreementId;
            EstablishmentId = entity.EstablishmentId;
            //EstablishmentOfficialName = entity.EstablishmentOfficialName;
            //EstablishmentTranslatedName = entity.EstablishmentTranslatedName;

            //Center = new MapPointView(entity.Center);

        }
    }
}