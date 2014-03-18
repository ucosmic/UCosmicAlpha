using System;
using AutoMapper;
using System.Linq;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementApiFlatModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime? ExpiresOn { get; set; }

        public string CountryNames { get; set; }
        public string[] Countries { get; set; }
        public AgreementParticipantApiModel[] Participants { get; set; }
        public string[] EstablishmentOfficialName { get; set; }
        public string[] EstablishmentTranslatedName { get; set; }
        public string Contacts { get; set; }
        public string Description { get; set; }

    }
    public class PageOfAgreementApiFlatModel : PageOf<AgreementApiFlatModel> { }

    public static class AgreementPageApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Agreement, AgreementApiFlatModel>()
                    .ForMember(d => d.CountryNames, o => o.ResolveUsing(s =>
                    {
                        var partners = s.Participants.Where(x => !x.IsOwner).Select(x => x.Establishment);
                        var countries = partners.Select(x => x.Location.Places.FirstOrDefault(y => y.IsCountry))
                            .Where(x => x != null).Select(x => x.OfficialName).Distinct()
                            .OrderBy(x => x)
                        ;
                        return countries.Implode(", ");
                    }))
                    .ForMember(d => d.Countries, o => o.ResolveUsing(s =>
                    {
                        var partners = s.Participants.Where(x => !x.IsOwner).Select(x => x.Establishment);
                        var countries = partners.Select(x => x.Location.Places.FirstOrDefault(y => y.IsCountry))
                            .Where(x => x != null).Select(x => x.OfficialName).Distinct()
                            .OrderBy(x => x)
                        ;
                        return countries;
                    }))
                    .ForMember(d => d.EstablishmentOfficialName, o => o.ResolveUsing(s =>
                    {
                        var partners = s.Participants.Where(x => !x.IsOwner).Select(x => x.Establishment)
                            .Select(x => x.OfficialName);
                        return partners.ToArray();
                    }))
                    .ForMember(d => d.EstablishmentTranslatedName, o => o.ResolveUsing(s =>
                    {
                        var partners = s.Participants.Where(x => !x.IsOwner).Select(x => x.Establishment)
                            .Select(x => x.TranslatedName);
                        return partners.ToArray();
                    }))
                    .ForMember(d => d.ExpiresOn, o => o.MapFrom(s => s.ExpiresOn == DateTime.MinValue ? (DateTime?)null : s.ExpiresOn))
                    .ForMember(d => d.Contacts, o => o.ResolveUsing(s =>
                    {
                        var contacts =
                            s.Contacts.Select(x => x.Person.Emails.FirstOrDefault(y => y.IsDefault).Value + '(' + x.Type + ')');
                        //s.Contacts.Select(x => new { x.Type, x.Person.Emails.FirstOrDefault(y => y.IsDefault).Value });// != null ? x.Person.Emails.FirstOrDefault(y => y.IsDefault).Value : '[None]'});
                        //var partners = s.Participants.Where(x => !x.IsOwner).Select(x => x.Establishment);
                        //var countries = partners.Select(x => x.Location.Places.FirstOrDefault(y => y.IsCountry))
                        //    .Where(x => x != null).Select(x => x.OfficialName).Distinct()
                        //    .OrderBy(x => x)
                        //;
                        //var repsonse = String.Join<string>(String.Empty, contacts.ToList());
                        return contacts.Implode(", ");
                    }))
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                //CreateMap<PagedQueryResult<AgreementView>, PageOfAgreementApiFlatModel>();
                CreateMap<PagedQueryResult<Agreement>, PageOfAgreementApiFlatModel>();
            }
        }

        //public class ViewToModelProfile : Profile
        //{
        //    protected override void Configure()
        //    {
        //        CreateMap<AgreementView, AgreementApiFlatModel>()
        //            .ForMember(d => d.CountryNames, o => o.ResolveUsing(s =>
        //            {
        //                var countryNames =
        //                    s.Participants.Where(x => !x.IsOwner)
        //                     .OrderBy(x => x.CountryName)
        //                     .Select(x => x.CountryName)
        //                     .Distinct();
        //                return countryNames.Implode(", ");
        //            }))
        //            .ForMember(d => d.EstablishmentTranslatedName, o => o.ResolveUsing(s =>
        //            {
        //                var translatedNames =
        //                    s.Participants.Where(x => !x.IsOwner).Select(x => x.EstablishmentTranslatedName);
        //                return translatedNames;//.Implode(", ");
        //            }))
        //            .ForMember(d => d.EstablishmentOfficialName, o => o.ResolveUsing(s =>
        //            {
        //                var officialNames =
        //                    s.Participants.Where(x => !x.IsOwner).Select(x => x.EstablishmentOfficialName);
        //                return officialNames;//.Implode(", ");
        //            }))
        //        ;
        //    }
        //}
    }
}