using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityLocationApiModel
    {
        public int Id { get; set; }
        public int PlaceId { get; set; }
        public string Version { get; set; }
    }

    public static class ActivityLocationApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityLocation, ActivityLocationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;
            }
        }

        public class ModelToEntity : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityLocationApiModel, ActivityLocation>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Place, o => o.Ignore())
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
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