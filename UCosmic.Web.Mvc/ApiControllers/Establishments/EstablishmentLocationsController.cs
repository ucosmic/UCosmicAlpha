using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [LocalApiEndpoint]
    [RoutePrefix("api/establishments")]
    public class EstablishmentLocationsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateEstablishmentLocation> _updateHandler;

        public EstablishmentLocationsController(IProcessQueries queryProcessor
            , IHandleCommands<UpdateEstablishmentLocation> updateHandler
        )
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
        }

        [GET("{establishmentId}/location")]
        public EstablishmentLocationApiModel Get(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Location.Places.Select(y => y.Ancestors),
                }
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EstablishmentLocationApiModel>(entity.Location);
            return model;
        }

        [PUT("{establishmentId}/location")]
        [Authorize(Roles = RoleName.EstablishmentAdministrator)]
        public HttpResponseMessage Put(int establishmentId, EstablishmentLocationPutModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //return null; // test client fail callback

            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var command = new UpdateEstablishmentLocation(establishmentId, User);
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

            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment location was successfully updated.");
            return response;
        }
    }
}
