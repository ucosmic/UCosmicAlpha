using System.Runtime.Serialization;
using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    [DataContract(Name = "Establishment", Namespace = "")]
    public class EstablishmentApiFlatModel
    {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string OfficialName { get; set; }

        [DataMember]
        public string TranslatedName { get; set; }

        [DataMember]
        public string OfficialUrl { get; set; }

        [DataMember]
        public string CountryName { get; set; }

        [DataMember]
        public string CountryCode { get; set; }

        [DataMember]
        public string UCosmicCode { get; set; }

        [DataMember]
        public string CeebCode { get; set; }
    }

    [DataContract(Name = "PageOfEstablishments", Namespace = "")]
    public class PageOfEstablishmentApiFlatModel : PageOf<EstablishmentApiFlatModel> { }

    public static class EstablishmentApiProfiler
    {
        public class ViewToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentView, EstablishmentApiFlatModel>()
                    .ForMember(d => d.OfficialUrl, o => o.ResolveUsing(s => s.WebsiteUrl))
                ;
            }
        }

        public class PagedQueryResultToPageOfItemsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<EstablishmentView>, PageOfEstablishmentApiFlatModel>();
            }
        }
    }
}