using System;
using System.Linq;
using AutoMapper;
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
        public AgreementParticipantApiModel[] Participants { get; set; }
    }

    public static class AgreementPageApiProfiler
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
    }

}