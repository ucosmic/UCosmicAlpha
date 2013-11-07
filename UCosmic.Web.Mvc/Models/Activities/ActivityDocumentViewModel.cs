using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityDocumentViewModel
    {
        public int DocumentId { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
    }

    public static class ActivityDocumentViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityDocument, ActivityDocumentViewModel>()
                    .ForMember(d => d.DocumentId, o => o.MapFrom(s => s.RevisionId))
                    ;
            }
        }
    }
}