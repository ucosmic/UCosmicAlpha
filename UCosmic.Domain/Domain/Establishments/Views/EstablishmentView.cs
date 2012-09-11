using System.Collections.Generic;
using System.Linq;
using AutoMapper;
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
        public IEnumerable<EstablishmentNameView> Names { get; set; }
        public IEnumerable<EstablishmentUrlView> Urls { get; set; }

        public EstablishmentView()
        {
        }

        public EstablishmentView(Establishment entity)
        {
            OfficialName = entity.Names.Single(e => e.IsOfficialName).Text;

            var officialUrl = entity.Urls.SingleOrDefault(e => e.IsOfficialUrl);
            WebsiteUrl = officialUrl != null ? officialUrl.Value : string.Empty;

            var country = GetCountry(entity);
            CountryCode = country != null ? country.GeoPlanetPlace.Country.Code : string.Empty;
            CountryName = country != null ? country.OfficialName : string.Empty;
        }

        private Place GetCountry(Establishment establishment)
        {
            var country = establishment.Location.Places.FirstOrDefault(e => e.IsCountry);
            if (country == null)
            {
                var ancestors = establishment.Ancestors.OrderBy(x => x.Separation).Select(x => x.Ancestor);
                foreach (var ancestor in ancestors)
                {
                    country = ancestor.Location.Places.FirstOrDefault(e => e.IsCountry);
                    if (country != null) break;
                }
            }
            return country;
        }
    }

    public class EstablishmentViewProfile : Profile
    {
        protected override void Configure()
        {
            CreateMap<Establishment, EstablishmentView>()
                .ConstructUsing(s => new EstablishmentView(s))
            ;
        }
    }
}
