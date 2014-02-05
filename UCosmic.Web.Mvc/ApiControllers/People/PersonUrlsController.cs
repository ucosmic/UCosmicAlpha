using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class PersonUrlsController : ApiController
    {
        private readonly IProcessQueries _queries;
        private readonly IProcessCommands _commands;
        private readonly IProcessValidation _validation;

        public PersonUrlsController(IProcessQueries queries, IProcessCommands commands, IProcessValidation validation)
        {
            _queries = queries;
            _commands = commands;
            _validation = validation;
        }

        [GET("people/{personId:int}/urls")]
        public HttpResponseMessage GetPlural(int personId)
        {
            var entities = _queries.Execute(new ExternalUrlsBy(personId));
            var models = entities.Select(x => new PersonUrlApiModel
            {
                UrlId = x.Id,
                PersonId = x.PersonId,
                Description = x.Description,
                Value = x.Value,
            });
            return Request.CreateResponse(HttpStatusCode.OK, models);
        }

        [Authorize]
        [POST("people/{personId:int}/urls")]
        public HttpResponseMessage Post(int personId, PersonUrlApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Please set Content-Type header to application/x-www-form-urlencoded.");

            var command = new CreateExternalUrl(User, personId)
            {
                Description = model.Description,
                Value = model.Value,
            };
            var validation = _validation.Validate(command);
            if (!validation.IsValid)
            {
                var firstMessage = validation.Errors.Select(x => x.ErrorMessage).First();
                return Request.CreateResponse(HttpStatusCode.BadRequest, firstMessage);
            }

            _commands.Execute(command);
            return Request.CreateResponse(HttpStatusCode.Created, "External link was created successfully.");
        }

        [Authorize]
        [PUT("people/{personId:int}/urls/{urlId:int}")]
        public HttpResponseMessage Put(int personId, int urlId, PersonUrlApiModel model)
        {
            if (model == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Please set Content-Type header to application/x-www-form-urlencoded.");

            var command = new UpdateExternalUrl(User, urlId)
            {
                Description = model.Description,
                Value = model.Value,
            };
            var validation = _validation.Validate(command);
            if (!validation.IsValid)
            {
                var firstMessage = validation.Errors.Select(x => x.ErrorMessage).First();
                return Request.CreateResponse(HttpStatusCode.BadRequest, firstMessage);
            }

            _commands.Execute(command);
            return Request.CreateResponse(HttpStatusCode.NoContent, "External link was updated successfully.");
        }

        [Authorize]
        [DELETE("people/{personId:int}/urls/{urlId:int}")]
        public HttpResponseMessage Delete(int personId, int urlId)
        {
            var entity = _queries.Execute(new ExternalUrlBy(urlId));
            if (entity != null)
            {
                var command = new DeleteExternalUrl(User, urlId);
                var validation = _validation.Validate(command);
                if (!validation.IsValid)
                {
                    var firstMessage = validation.Errors.Select(x => x.ErrorMessage).First();
                    return Request.CreateResponse(HttpStatusCode.BadRequest, firstMessage);
                }
                _commands.Execute(command);
            }
            return Request.CreateResponse(HttpStatusCode.NoContent, "External link was deleted successfully.");
        }
    }
}
