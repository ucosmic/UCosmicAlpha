using System;
using System.Runtime.Serialization;
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
                        var countryNames = s.Participants.Where(x => !x.IsOwner).Select(x => x.CountryName).Distinct();

                        return countryNames.Implode(", ");
                    }))
                    //.ForMember(d => d.OfficialUrl, o => o.ResolveUsing(s => s.WebsiteUrl))
                    //.AfterMap((s, d) => d.Participants = d.Participants
                    //    .OrderByDescending(x => x.IsOwner)
                    //    .ThenBy(x => x.EstablishmentTranslatedName).ToArray())
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

    //public static class AgreementPageApiProfiler
    //{
    //    public class EntityToModelProfile : Profile
    //    {
    //        protected override void Configure()
    //        {
    //            CreateMap<Agreement, AgreementApiModel>()
    //                //.ForMember(d => d.Content, o => o.MapFrom(s => s.Description))
    //                .AfterMap((s, d) => d.Participants = d.Participants
    //                                                      .OrderByDescending(x => x.IsOwner)
    //                                                      .ThenBy(x => x.AgreementTranslatedName).ToArray())
    //                ;
    //        }
    //    }
    //}

}