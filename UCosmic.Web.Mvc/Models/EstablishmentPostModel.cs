using AutoMapper;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentPostModel
    {
        public EstablishmentNameApiModel OfficialName { get; set; }
        public EstablishmentUrlApiModel OfficialUrl { get; set; }
        public EstablishmentLocationPutModel Location { get; set; }
        public string UCosmicCode { get; set; }
        public string CeebCode { get; set; }
    }

    public static class EstablishmentPostProfiler
    {
        public class ModelToCommandProfile : Profile
        {
            protected override void Configure()
            {
                //CreateMap<EstablishmentView, EstablishmentApiModel>()
                //    .ForMember(d => d.OfficialUrl, o => o.ResolveUsing(s => s.WebsiteUrl))
                //;
            }
        }
    }
}