using System;
using System.Collections.Generic;
using System.IO;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityDocumentApiModel
    {
        public int ActivityId { get; set; }
        public int DocumentId { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        public long ByteCount { get; set; }
        public string Size
        {
            get { return ByteCount.ToFileSize(); }
        }
        public string Extension
        {
            get { return Path.GetExtension(FileName); }
        }

        internal static readonly IEnumerable<Expression<Func<ActivityDocument, object>>> EagerLoad = new Expression<Func<ActivityDocument, object>>[]
        {
            x => x.ActivityValues,
        };
    }

    public static class ActivityDocumentApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityDocument, ActivityDocumentApiModel>()
                    .ForMember(d => d.DocumentId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.ActivityValues.ActivityId))
                    .ForMember(d => d.Extension, o => o.MapFrom(s => Path.GetExtension(s.FileName).Substring(1)))
                    .ForMember(d => d.ByteCount, o => o.MapFrom(s => s.Length))
                ;
            }
        }
    }
}