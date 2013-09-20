using System;
using System.Linq;
using AutoMapper;
using System.Runtime.Serialization;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    [DataContract(Name = "Agreement", Namespace = "")]
    public class AgreementPageApiModel
    {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Type { get; set; }

        [DataMember]
        public string Status { get; set; }

        [DataMember]
        public DateTime StartsOn { get; set; }

        [DataMember]
        public DateTime ExpiresOn { get; set; }

        //[DataMember]
        //public AgreementParticipantApiModel[] Participants { get; set; }
    }
    [DataContract(Name = "PageOfAgreements", Namespace = "")]
    public class PageOfAgreementApiFlatModel : PageOf<AgreementPageApiModel> { }

    public static class AgreementPageApiProfiler
    {
        public class ViewToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementView, AgreementPageApiModel>()
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