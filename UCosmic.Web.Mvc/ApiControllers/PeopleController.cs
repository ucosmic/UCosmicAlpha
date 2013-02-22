using System;
using System.IO;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting.Web.Http;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [LocalOnly]
    [DefaultApiHttpRouteConvention]
    public class PeopleController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public PeopleController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
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

            Stream stream;
            var mimeType = "image/png";

            if (person.Photo != null)
            {
                // resize the user's photo image
                stream = person.Photo.Binary.Content.ResizeImage(model);
                mimeType = person.Photo.MimeType;
            }
            else
            {
                // otherwise, return the unisex photo
                var relativePath = string.Format("~/{0}", Links.images.icons.user.unisex_a_128_png);
                var absolutePath = Request.GetHttpContext().Server.MapPath(relativePath);
                stream = absolutePath.ResizeImage(model);
            }

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream),
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            return response;
        }
    }
}
