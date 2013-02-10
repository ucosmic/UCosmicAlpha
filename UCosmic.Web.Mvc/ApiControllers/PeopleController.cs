using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    [Authorize(Roles = "Person API Invoker")]
    public class PeopleController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdatePerson> _updateHandler;

        // reformatted: makes it easier to add additional constructor args if needed
        // (for example additional command handlers or command validators)
        public PeopleController(IProcessQueries queryProcessor
            , IHandleCommands<UpdatePerson> updateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
        }

        [GET("{id}")]
        public PersonApiModel GetPerson(int id)
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            Person person = _queryProcessor.Execute(new PersonById(id));

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            var model = Mapper.Map<PersonApiModel>(person);

            return model;
        }

        [PUT("{id}")]
        public HttpResponseMessage Put(int id, PersonApiModel model)
        {
            var command = new UpdatePerson(id);
            Mapper.Map(model, command);

            try
            {
                _updateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Personal information was successfully updated.");
        }
    }
}
