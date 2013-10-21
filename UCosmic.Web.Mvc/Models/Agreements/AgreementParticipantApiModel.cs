using System;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementParticipantApiModel
    {
        public bool IsOwner { get; set; }
        public int? AgreementId { get; set; }
        public int EstablishmentId { get; set; }
        public string EstablishmentOfficialName { get; set; }
        public string EstablishmentTranslatedName { get; set; }
        public string Url { get; set; }
        public string AgreementType { get; set; }
        public DateTime AgreementStartsOn { get; set; }
        public MapPointModel Center { get; set; }
        public MapBoxModel BoundingBox { get; set; }
        public int? GoogleMapZoomLevel { get; set; }
    }

    public static class AgreementParticipantApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementParticipant, AgreementParticipantApiModel>()
                    .ForMember(d => d.AgreementId, o => o.MapFrom(s =>
                        s.AgreementId == 0 ? (int?)null : s.AgreementId))
                    .ForMember(d => d.EstablishmentId, o => o.MapFrom(s => s.Establishment.RevisionId))
                    .ForMember(d => d.EstablishmentOfficialName, o => o.MapFrom(s =>
                        s.Establishment.OfficialName == s.Establishment.TranslatedName.Text ? null : s.Establishment.OfficialName))
                    .ForMember(d => d.Url, o => o.MapFrom(s => s.Establishment.WebsiteUrl))
                    .ForMember(d => d.Center, o => o.ResolveUsing(s =>
                    {
                        if (s.Establishment.Location.Center.HasValue)
                            return s.Establishment.Location.Center;
                        var place = s.Establishment.Location.Places.OrderByDescending(x => x.Ancestors.Count).FirstOrDefault(x => x.Center.HasValue);
                        return place != null ? place.Center : Coordinates.Default;
                    }))
                    .ForMember(d => d.BoundingBox, o => o.MapFrom(s => s.Establishment.Location.BoundingBox))
                    .ForMember(d => d.GoogleMapZoomLevel, o => o.MapFrom(s => s.Establishment.Location.GoogleMapZoomLevel))
                ;
            }
        }

        public class EntityToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementParticipantApiModel, CreateParticipant>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;
            }
        }
    }
}