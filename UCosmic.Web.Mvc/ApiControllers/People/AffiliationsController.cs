using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class AffiliationsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateAffiliation> _create;
        private readonly IHandleCommands<UpdateAffiliation> _update;
        private readonly IHandleCommands<PurgeAffiliation> _purge;

        public AffiliationsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateAffiliation> create
            , IHandleCommands<UpdateAffiliation> update
            , IHandleCommands<PurgeAffiliation> purge
        )
        {
            _queryProcessor = queryProcessor;
            _create = create;
            _update = update;
            _purge = purge;
        }

        [GET("user/affiliations")]
        [GET("people/{personId:int}/affiliations", ActionPrecedence = 1)]
        public IEnumerable<AffiliationApiModel> Get(int? personId = null)
        {
            var entities = _queryProcessor.Execute(new AffiliationsByPerson(User, personId)
            {
                EagerLoad = AffiliationApiModel.EagerLoad,
            });

            var models = Mapper.Map<AffiliationApiModel[]>(entities);
            return models;
        }

        [Authorize]
        [PUT("user/affiliations/{establishmentId:int}")]
        [PUT("people/{personId:int}/affiliations/{establishmentId:int}", ActionPrecedence = 1)]
        public HttpResponseMessage Put(AffiliationPutModel model, int establishmentId, int? personId = null)
        {
            if (model == null) throw new HttpResponseException(HttpStatusCode.BadRequest);

            // need to decide whether to create or update
            var entity = !personId.HasValue
                ? _queryProcessor.Execute(new AffiliationByUser(User, establishmentId))
                : _queryProcessor.Execute(new AffiliationByPrimaryKey(personId.Value, establishmentId));

            try
            {
                if (entity == null)
                {
                    var command = !personId.HasValue
                        ? new CreateAffiliation(User, establishmentId)
                        : new CreateAffiliation(User, personId.Value, establishmentId);
                    Mapper.Map(model, command);
                    _create.Handle(command);
                }
                else
                {
                    var command = !personId.HasValue
                        ? new UpdateAffiliation(User, establishmentId, model.EstablishmentId)
                        : new UpdateAffiliation(User, personId.Value, establishmentId, model.EstablishmentId);
                    Mapper.Map(model, command);
                    _update.Handle(command);
                }

                var response = Request.CreateResponse(entity == null ? HttpStatusCode.Created : HttpStatusCode.OK, "Affiliation was saved successfully.");
                return response;
            }
            catch (ValidationException ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Errors);
                return response;
            }
        }

        [Authorize]
        [DELETE("user/affiliations/{establishmentId:int}")]
        [DELETE("people/{personId:int}/affiliations/{establishmentId:int}", ActionPrecedence = 1)]
        public HttpResponseMessage Delete(int establishmentId, int? personId = null)
        {
            //System.Threading.Thread.Sleep(15000);
            try
            {
                var command = !personId.HasValue
                    ? new PurgeAffiliation(User, establishmentId)
                    : new PurgeAffiliation(User, personId.Value, establishmentId);
                _purge.Handle(command);

                var response = Request.CreateResponse(HttpStatusCode.OK, "Affiliation was successfully deleted.");
                return response;
            }
            catch (ValidationException ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Errors);
                return response;
            }
        }
    }
}
