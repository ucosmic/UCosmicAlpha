using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/image")]
    public class ImagesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryStore;

        public ImagesController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryStore
        )
        {
            _queryProcessor = queryProcessor;
            _binaryStore = binaryStore;
        }

        [GET("{filename}")]
        public HttpResponseMessage Get(string filename)
        {
            if (string.IsNullOrEmpty(filename) || string.IsNullOrWhiteSpace(filename))
            {
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }

            byte[] content = _binaryStore.Get(filename);
            if (content == null)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }

            var stream = new MemoryStream(content);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream)
            };

            string mimeType = null;
            string ext = Path.GetExtension(filename);
            if (ext == ".png")
            {
                mimeType = "image/png";
            }

            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            return response;
        }
    }
}
