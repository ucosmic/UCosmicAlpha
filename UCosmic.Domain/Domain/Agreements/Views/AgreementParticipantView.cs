using UCosmic.Domain.Places;
using System.Linq;

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
        public string CountryCode { get; set; }
        public string CountryName { get; set; }

        public AgreementParticipantView() { }

        public AgreementParticipantView(AgreementParticipant entity)
        {
            IsOwner = entity.IsOwner;
            AgreementId = entity.AgreementId;
            EstablishmentId = entity.EstablishmentId;
            EstablishmentOfficialName = entity.Establishment.OfficialName;
            EstablishmentTranslatedName = entity.Establishment.TranslatedName.Text;

            
            var country = entity.Establishment.Location.Places.FirstOrDefault(x => x.IsCountry);
            if(country != null && country.GeoPlanetPlace != null)
            {
                CountryCode = country.GeoPlanetPlace.Country.Code;
                CountryName = country.OfficialName;
            }

            Center = new MapPointView(entity.Establishment.Location.Center);
        }
    }
}