using System;
using System.IO;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityDocumentApiModel
    {
        public int ActivityId { get; set; }
        public int Id { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        public string Extension { get; set; }
        public string ModeText { get; set; }
        public string Path { get; set; }
        public string Version { get; set; }
        public long Length { get; set; }
        public string Size
        {
            get { return Length.ToAbbreviatedFileSize().ToUpper(); }
        }
    }

    public static class ActivityDocumentApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityDocument, ActivityDocumentApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.ActivityValues.ActivityId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Extension, o => o.MapFrom(s => Path.GetExtension(s.FileName).Substring(1)))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;
            }
        }

        public class ModelToEntity : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityDocumentApiModel, ActivityDocument>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.MimeType, o => o.Ignore())
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