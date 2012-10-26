using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Xml.Serialization;
using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Www.Mvc.Models
{
    [DataContract(Name = "Establishment", Namespace = "")]
    public class EstablishmentApiModel
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
    public class PageOfEstablishmentApiModel : PageOf<EstablishmentApiModel> { }

    public static class EstablishmentApiProfiler
    {
        public class ViewToModelProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentView, EstablishmentApiModel>()
                    .ForMember(d => d.Id, o => o.ResolveUsing(s => s.RevisionId))
                    .ForMember(d => d.OfficialUrl, o => o.ResolveUsing(s => s.WebsiteUrl))
                ;
            }
        }

        //public class PagedViewResultToPageOfModelsProfiler
        //    : PagedQueryResultToPageOfItemsProfiler<EstablishmentView, EstablishmentApiModel>
        //{
        //}

        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<EstablishmentView>, PageOfEstablishmentApiModel>();
            }
        }

    }
}