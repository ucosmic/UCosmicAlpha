using System;
using AutoMapper;
using System.Linq;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementPageApiModel
    {

        public int Id { get; set; }

        public string Name { get; set; }

        public string Type { get; set; }

        public string Status { get; set; }

        public DateTime StartsOn { get; set; }

        public DateTime ExpiresOn { get; set; }

        public string CountryNames { get; set; }

        public string[] EstablishmentOfficialName { get; set; }

        public string[] EstablishmentTranslatedName { get; set; }

    }
    public class PageOfAgreementApiFlatModel : PageOf<AgreementPageApiModel> { }

    public static class AgreementPageApiProfiler
    {
        public class ViewToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementView, AgreementPageApiModel>()
                    .ForMember(d => d.CountryNames, o => o.ResolveUsing(s =>
                    {
                        var countryNames =
                            s.Participants.Where(x => !x.IsOwner)
                             .OrderBy(x => x.CountryName)
                             .Select(x => x.CountryName)
                             .Distinct();
                        return countryNames.Implode(", ");
                    }))
                    .ForMember(d => d.EstablishmentTranslatedName, o => o.ResolveUsing(s =>
                    {
                        var translatedNames =
                            s.Participants.Where(x => !x.IsOwner).Select(x => x.EstablishmentTranslatedName);
                        return translatedNames;//.Implode(", ");
                    }))
                    .ForMember(d => d.EstablishmentOfficialName, o => o.ResolveUsing(s =>
                    {
                        var officialNames =
                            s.Participants.Where(x => !x.IsOwner).Select(x => x.EstablishmentOfficialName);
                        return officialNames;//.Implode(", ");
                    }))
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<AgreementView>, PageOfAgreementApiFlatModel>();
            }
        }
    }
}