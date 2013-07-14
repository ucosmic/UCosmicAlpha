using AutoMapper;
using UCosmic.Domain.Files;

namespace UCosmic.Web.Mvc.Models
{
    public class FileMedia
    {
        internal FileMedia(string fileName, string contentType, byte[] content)
        {
            FileName = fileName.WithoutEnclosingDoubleQuotes();
            ContentType = contentType;
            Content = content;
        }

        public string FileName { get; private set; }
        public string ContentType { get; private set; }
        public byte[] Content { get; private set; }
    }

    public static class FileMediaProfiler
    {
        public class ModelToCreateLooseFile : Profile
        {
            protected override void Configure()
            {
                CreateMap<FileMedia, CreateLooseFile>()
                    .ForMember(d => d.Content, o => o.MapFrom(s => s.Content))
                    .ForMember(d => d.MimeType, o => o.MapFrom(s => s.ContentType))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.FileName))
                    .ForMember(d => d.Created, o => o.Ignore())
                ;
            }
        }
    }
}