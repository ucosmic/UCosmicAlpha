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
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{
    public class ImageMediaFormatter : MediaTypeFormatter
    {
        public ImageMediaFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/png"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/gif"));

            // IE8 sometimes uses these mime types
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/pjpeg"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/x-png"));

            SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));
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
                            var imageBuffer = ReadFully(imgStream);
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

        private static byte[] ReadFully(Stream input)
        {
            var buffer = new byte[16*1024];
            using (var memoryStream = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    memoryStream.Write(buffer, 0, read);
                }
                return memoryStream.ToArray();
            }
        }
    }
}