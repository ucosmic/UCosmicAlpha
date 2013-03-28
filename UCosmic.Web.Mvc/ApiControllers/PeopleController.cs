using System;
using System.IO;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using ImageResizer;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [LocalApiEndpoint]
    [DefaultApiHttpRouteConvention]
    public class PeopleController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;

        public PeopleController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
        }

        [GET("{id}/photo")]
        public virtual HttpResponseMessage GetPhoto(int id, [FromUri] ImageResizeRequestModel model)
        {
            var person = _queryProcessor.Execute(new PersonById(id)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Photo.Binary,
                }
            });

            var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
            var mimeType = "image/png";
            var settings = Mapper.Map<ResizeSettings>(model);

            if (person.Photo != null)
            {
                // resize the user's photo image
                mimeType = person.Photo.MimeType;
                ImageBuilder.Current.Build(new MemoryStream(_binaryData.Get(person.Photo.Path)), stream, settings, true);
            }
            else
            {
                // otherwise, return the unisex photo
                var relativePath = string.Format("~/{0}", Links.images.icons.user.unisex_a_128_png);
                ImageBuilder.Current.Build(relativePath, stream, settings);
            }

            stream.Position = 0;
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream), // will dispose the stream
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            return response;
        }
    }
}
