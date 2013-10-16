using System;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementApiModel
    {
        public int Id { get; set; }
        public int? UmbrellaId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public string Notes { get; set; }
        public bool? IsAutoRenew { get; set; }
        public string Status { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime ExpiresOn { get; set; }
        public bool IsExpirationEstimated { get; set; }
        public string Visibility { get; set; }
        public AgreementParticipantApiModel[] Participants { get; set; }
    }

    public static class AgreementApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Agreement, AgreementApiModel>()
                    //.ForMember(d => d.Content, o => o.MapFrom(s => s.Description))
                    .AfterMap((s, d) => d.Participants = d.Participants
                        .OrderByDescending(x => x.IsOwner)
                        .ThenBy(x => x.EstablishmentTranslatedName).ToArray())
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementApiModel, CreateAgreement>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.CreatedAgreementId, o => o.Ignore())
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementApiModel, UpdateAgreement>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.AgreementId, o => o.Ignore())
                ;
            }
        }
    }
}