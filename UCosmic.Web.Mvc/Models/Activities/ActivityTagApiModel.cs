using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTagApiModel
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public string DomainTypeText { get; set; }
        public int? DomainKey { get; set; }
        public string ModeText { get; set; }
        public string Version { get; set; }
    }

    public static class ActivityTagApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityTag, ActivityTagApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.DomainTypeText, o => o.MapFrom(s => s.DomainTypeText))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;
            }
        }

        public class ModelToEntity : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityTagApiModel, ActivityTag>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.DomainTypeText, o => o.MapFrom(s => s.DomainTypeText))
                    .ForMember(d => d.DomainType, o => o.Ignore())
                    .ForMember(d => d.DomainKey, o => o.MapFrom(s => s.DomainKey))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.ActivityValues, o => o.Ignore())
                    .ForMember(d => d.ActivityValuesId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                ;
            }
        }
    }
}