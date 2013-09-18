//using System.Collections.Generic;
//using System.Globalization;
//using System.Linq;
//using UCosmic.Domain.Places;

//namespace UCosmic.Domain.Agreements
//{
//    public class AgreementView
//    {
//        public int Id { get; set; }
//        public int? ParentId { get; set; }
//        public string OfficialName { get; set; }
//        public string WebsiteUrl { get; set; }
//        public string CountryCode { get; set; }
//        public string CountryName { get; set; }
//        public string CeebCode { get; set; }
//        public string UCosmicCode { get; set; }
//        public AgreementTypeView Type { get; set; }
//        public IEnumerable<AgreementNameView> Names { get; set; }
//        public IEnumerable<AgreementUrlView> Urls { get; set; }

//        public string TranslatedName
//        {
//            get
//            {
//                // try to translate to ui culture
//                var cultureCode = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
//                var name = Names.FirstOrDefault(x => !x.IsFormerName && x.LanguageCode.Equals(cultureCode));
//                return name != null ? name.Text : OfficialName;
//            }
//        }

//        public AgreementView() { }

//        public AgreementView(Agreement entity)
//        {
//            Id = entity.RevisionId;
//            ParentId = entity.Parent == null ? (int?)null : entity.Parent.RevisionId;

//            OfficialName = entity.Names.Single(e => e.IsOfficialName).Text;

//            var officialUrl = entity.Urls.SingleOrDefault(e => e.IsOfficialUrl);
//            WebsiteUrl = officialUrl != null ? officialUrl.Value : string.Empty;

//            var country = GetCountry(entity);
//            CountryCode = country != null ? country.GeoPlanetPlace.Country.Code : string.Empty;
//            CountryName = country != null ? country.OfficialName : string.Empty;

//            CeebCode = entity.CollegeBoardDesignatedIndicator ?? "";
//            UCosmicCode = entity.UCosmicCode ?? "";

//            Type = new AgreementTypeView(entity.Type);

//            var names = new List<AgreementNameView>();
//            foreach (var name in entity.Names)
//                names.Add(new AgreementNameView(name));
//            Names = names;

//            var urls = new List<AgreementUrlView>();
//            foreach (var url in entity.Urls)
//                urls.Add(new AgreementUrlView(url));
//            Urls = urls;
//        }

//        private Place GetCountry(Agreement establishment)
//        {
//            var country = establishment.Location.Places.FirstOrDefault(e => e.IsCountry);
//            if (country == null)
//            {
//                var parent = establishment.Parent;
//                while (parent != null)
//                {
//                    country = parent.Location.Places.FirstOrDefault(e => e.IsCountry);
//                    if (country != null) break;
//                    parent = parent.Parent;
//                }
//            }
//            return country;
//        }
//    }
//}
