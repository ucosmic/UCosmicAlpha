using System;
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
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));
        }

        public override bool CanReadType(Type type)
        {
            return type == typeof (FileMedia);
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

                var fileContent = t.Result.Contents.First(x => SupportedMediaTypes.Contains(x.Headers.ContentType));
                var fileName = fileContent.Headers.ContentDisposition.FileName;
                var mediaType = fileContent.Headers.ContentType.MediaType;

                using (var imgStream = fileContent.ReadAsStreamAsync().Result)
                {
                    var imageBuffer = ReadFully(imgStream);
                    var result = new FileMedia(fileName, mediaType, imageBuffer);
                    taskCompletionSource.SetResult(result);
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