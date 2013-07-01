using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Files;

namespace UCosmic.Web.Mvc
{
    public class FileMediaFormatter : MediaTypeFormatter
    {
        public FileMediaFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));

            // image file types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/pjpeg")); // IE8 uses this
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/png"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/x-png")); // IE8 uses this
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/gif"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/bmp"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/tiff"));

            // document file types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/pdf"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/msword")); // doc
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.ms-excel")); // xls
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.ms-powerpoint")); // ppt
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.wordprocessingml.document")); // docx
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")); // xlsx
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.presentationml.presentation")); // pptx
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.oasis.opendocument.text")); // odt
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.oasis.opendocument.spreadsheet")); // ods
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));

            // video media types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/mp4"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/x-ms-wmv"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/quicktime"));

            // audio media types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mp3"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mpeg")); // IE8 uses this
        }

        public override bool CanReadType(Type type)
        {
            // allow this formatter to handle batch requests with multiple files
            return type == typeof(FileMedia) || typeof(IEnumerable<FileMedia>).IsAssignableFrom(type);
        }

        public override bool CanWriteType(Type type)
        {
            return false;
        }

        public override Task<object> ReadFromStreamAsync(Type type, Stream readStream, HttpContent content, IFormatterLogger formatterLogger)
        {
            if (!content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var taskCompletionSource = new TaskCompletionSource<object>();

            content.ReadAsMultipartAsync().ContinueWith(t =>
            {
                if (t.IsFaulted || t.IsCanceled)
                    throw new HttpResponseException(HttpStatusCode.InternalServerError);

                var fileContents = t.Result.Contents.Where(x => SupportedMediaTypes.Contains(x.Headers.ContentType))
                    .ToArray();
                if (!fileContents.Any())
                {
                    taskCompletionSource.SetResult(null);
                }
                else
                {
                    var fileMedias = new List<FileMedia>();
                    foreach (var fileContent in fileContents)
                    {
                        var fileName = fileContent.Headers.ContentDisposition.FileName;
                        var mediaType = fileContent.Headers.ContentType.MediaType;

                        using (var imgStream = fileContent.ReadAsStreamAsync().Result)
                        {
                            var imageBuffer = imgStream.ReadFully();
                            var result = new FileMedia(fileName, mediaType, imageBuffer);
                            fileMedias.Add(result);
                        }
                    }

                    if (fileMedias.Count == 1)
                    {
                        taskCompletionSource.SetResult(fileMedias.Single());
                    }
                    else
                    {
                        taskCompletionSource.SetResult(fileMedias);
                    }
                }
            });

            return taskCompletionSource.Task;
        }
    }

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