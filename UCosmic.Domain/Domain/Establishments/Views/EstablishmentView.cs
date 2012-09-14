using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentView
    {
        public int RevisionId { get; set; }
        public string OfficialName { get; set; }
        public string WebsiteUrl { get; set; }
        public string CountryCode { get; set; }
        public string CountryName { get; set; }
        public string CeebCode { get; set; }
        public string UCosmicCode { get; set; }
        public IEnumerable<EstablishmentNameView> Names { get; set; }
        public IEnumerable<EstablishmentUrlView> Urls { get; set; }

        public string TranslatedName
        {
            get
            {
                // try to translate to ui culture
                var cultureCode = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
                var name = Names.FirstOrDefault(x => x.LanguageCode.Equals(cultureCode));
                return name != null ? name.Text : OfficialName;
            }
        }

        public EstablishmentView() { }

        public EstablishmentView(Establishment entity)
        {
            RevisionId = entity.RevisionId;

            OfficialName = entity.Names.Single(e => e.IsOfficialName).Text;

            var officialUrl = entity.Urls.SingleOrDefault(e => e.IsOfficialUrl);
            WebsiteUrl = officialUrl != null ? officialUrl.Value : string.Empty;

            var country = GetCountry(entity);
            CountryCode = country != null ? country.GeoPlanetPlace.Country.Code : string.Empty;
            CountryName = country != null ? country.OfficialName : string.Empty;

            CeebCode = entity.CollegeBoardDesignatedIndicator ?? "";
            UCosmicCode = entity.UCosmicCode ?? "";

            var names = new List<EstablishmentNameView>();
            foreach (var name in entity.Names)
                names.Add(new EstablishmentNameView(name));
            Names = names;

            var urls = new List<EstablishmentUrlView>();
            foreach (var url in entity.Urls)
                urls.Add(new EstablishmentUrlView(url));
            Urls = urls;
        }

        private Place GetCountry(Establishment establishment)
        {
            var country = establishment.Location.Places.FirstOrDefault(e => e.IsCountry);
            if (country == null)
            {
                var parent = establishment.Parent;
                while (parent != null)
                {
                    country = parent.Location.Places.FirstOrDefault(e => e.IsCountry);
                    if (country != null) break;
                    parent = parent.Parent;
                }
            }
            return country;
        }
    }
}
