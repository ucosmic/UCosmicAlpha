using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{
    public class FileMediaFormatter : MediaTypeFormatter
    {
        public FileMediaFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));

            #region Previous Supported Media Types
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));
            //
            //// image file types
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpg"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/pjpeg")); // IE8 uses this
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/png"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/x-png")); // IE8 uses this
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/gif"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/bmp"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/tiff"));
            //
            //// document file types
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/pdf"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/msword")); // doc
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.ms-excel")); // xls
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.ms-powerpoint")); // ppt
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.wordprocessingml.document")); // docx
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")); // xlsx
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.presentationml.presentation")); // pptx
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.oasis.opendocument.text")); // odt
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.oasis.opendocument.spreadsheet")); // ods
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));
            //
            //// video media types
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/mp4"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/x-ms-wmv"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("video/quicktime"));
            //
            //// audio media types
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mp3"));
            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mpeg")); // IE8 uses this
            #endregion
        }

        public override bool CanReadType(Type type)
        {
            return true;
        }

        public override bool CanWriteType(Type type)
        {
            return false;
        }

        public override Task<object> ReadFromStreamAsync(Type type, Stream readStream, HttpContent content, IFormatterLogger formatterLogger)
        {
            if (!content.IsMimeMultipartContent())
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            var taskCompletionSource = new TaskCompletionSource<object>();

            content.ReadAsMultipartAsync().ContinueWith(t =>
            {
                if (t.IsFaulted || t.IsCanceled)
                    throw new HttpResponseException(HttpStatusCode.InternalServerError);

                var streamContents = t.Result.Contents.ToArray();

                var isRequestForFileMediaOrMedium = IsRequestForFileMediaOrMedium(type);
                var fileMedia = new List<FileMedium>();
                var dataPairs = new ExpandoObject() as IDictionary<string, object>;
                foreach (var streamContent in streamContents)
                {
                    using (var stream = streamContent.ReadAsStreamAsync().Result)
                    {
                        var buffer = stream.ReadFully();

                        // the stream content is file data
                        if (!string.IsNullOrWhiteSpace(streamContent.Headers.ContentDisposition.FileName) && streamContent.Headers.ContentType != null)
                        {
                            var fileMedium = new FileMedium
                            {
                                FileName = streamContent.Headers.ContentDisposition.FileName.Trim('"'),
                                ContentType = streamContent.Headers.ContentType.MediaType,
                                Content = buffer,
                            };
                            if (isRequestForFileMediaOrMedium)
                                fileMedia.Add(fileMedium);
                            else
                                dataPairs.Add(streamContent.Headers.ContentDisposition.Name.Trim('"'), fileMedium);
                        }

                        // the stream content is not file data
                        else if (!isRequestForFileMediaOrMedium)
                        {
                            var textContent = Encoding.UTF8.GetString(buffer);
                            dataPairs.Add(streamContent.Headers.ContentDisposition.Name.Trim('"'), textContent);
                        }
                    }
                }

                if (isRequestForFileMediaOrMedium)
                {
                    if (!fileMedia.Any())
                        taskCompletionSource.SetResult(null);

                    else if (fileMedia.Count() == 1)
                        taskCompletionSource.SetResult(fileMedia.Single());

                    else
                        taskCompletionSource.SetResult(fileMedia);
                }
                else
                {
                    var json = JsonConvert.SerializeObject(dataPairs);
                    var model = JsonConvert.DeserializeObject(json, type);
                    taskCompletionSource.SetResult(model);
                }
            });

            return taskCompletionSource.Task;
        }

        private static bool IsRequestForFileMediaOrMedium(Type type)
        {
            return IsRequestForFileMedia(type) || IsRequestForFileMedium(type);
        }

        private static bool IsRequestForFileMedium(Type type)
        {
            return type == typeof(FileMedium);
        }

        private static bool IsRequestForFileMedia(Type type)
        {
            return typeof(IEnumerable<FileMedium>).IsAssignableFrom(type);
        }
    }
}