using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Newtonsoft.Json;
using UCosmic.Domain.Places;
using System.Globalization;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentLocation : RevisableEntity
    {
        protected internal EstablishmentLocation()
        {
            Center = new Coordinates(null, null);
            BoundingBox = new BoundingBox(null, null, null, null);

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Addresses = new Collection<EstablishmentAddress>();
            Places = new Collection<Place>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Establishment ForEstablishment { get; protected internal set; }

        public virtual ICollection<EstablishmentAddress> Addresses { get; protected set; }

        public EstablishmentAddress TranslateAddressTo(string languageIsoCode)
        {
            if (string.IsNullOrWhiteSpace(languageIsoCode)) return null;

            return Addresses.SingleOrDefault(a =>
                a.TranslationToLanguage.TwoLetterIsoCode.Equals(languageIsoCode, StringComparison.OrdinalIgnoreCase) ||
                a.TranslationToLanguage.ThreeLetterIsoCode.Equals(languageIsoCode, StringComparison.OrdinalIgnoreCase) ||
                a.TranslationToLanguage.ThreeLetterIsoBibliographicCode.Equals(languageIsoCode, StringComparison.OrdinalIgnoreCase));
        }

        public EstablishmentAddress GetDefaultAddress()
        {
            if (Addresses.Count == 1)
                return Addresses.Single();

            var currentUiAddress = TranslateAddressTo(
                CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);

            return currentUiAddress ?? TranslateAddressTo("en");
        }

        public Coordinates Center { get; protected internal set; }
        public BoundingBox BoundingBox { get; protected internal set; }
        public int? GoogleMapZoomLevel { get; protected internal set; }

        public virtual ICollection<Place> Places { get; protected internal set; }
    }

    internal static class EstablishmentLocationSerializer
    {
        internal static string ToJsonAudit(this EstablishmentLocation establishmentLocation)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = establishmentLocation.RevisionId,
                CenterLatitude = establishmentLocation.Center.Latitude,
                CenterLongitude = establishmentLocation.Center.Longitude,
                BoxNorthEastLatitude = establishmentLocation.BoundingBox.Northeast.Latitude,
                BoxNorthEastLongitude = establishmentLocation.BoundingBox.Northeast.Longitude,
                BoxSouthWestLatitude = establishmentLocation.BoundingBox.Southwest.Latitude,
                BoxSouthWestLongitude = establishmentLocation.BoundingBox.Southwest.Longitude,
                establishmentLocation.GoogleMapZoomLevel,
                PlaceIds = establishmentLocation.Places.Select(x => x.RevisionId).ToArray(),
            });
            return state;
        }
    }
}