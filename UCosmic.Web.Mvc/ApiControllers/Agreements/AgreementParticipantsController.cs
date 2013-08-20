using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements/{agreementId:int}/participants")]
    public class AgreementParticipantsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateParticipant> _createHandler;
        private readonly IHandleCommands<PurgeParticipant> _purgeHandler;

        public AgreementParticipantsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateParticipant> createHandler
            , IHandleCommands<PurgeParticipant> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _purgeHandler = purgeHandler;
        }

        [GET("")]
        public IEnumerable<AgreementParticipantApiModel> GetParticipants(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ParticipantsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
                OrderBy = new Dictionary<Expression<Func<AgreementParticipant, object>>, OrderByDirection>
                {
                    { x => x.IsOwner, OrderByDirection.Descending },
                },
            });
            if (entities == null || !entities.Any()) throw new HttpResponseException(HttpStatusCode.NotFound);
            var models = Mapper.Map<AgreementParticipantApiModel[]>(entities);
            return models;
        }

        [GET("{establishmentId:int}", ControllerPrecedence = 1)]
        public AgreementParticipantApiModel GetParticipant(int agreementId, int establishmentId)
        {
            var entity = _queryProcessor.Execute(new ParticipantByEstablishmentId(User, establishmentId, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementParticipant, object>>[]
                {
                    x => x.Establishment.Names,
                },
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementParticipantApiModel>(entity);
            return model;
        }

        [PUT("{establishmentId:int}")]
        public HttpResponseMessage Put(int agreementId, int establishmentId, [FromBody] AgreementParticipantApiModel model)
        {
            model.AgreementId = agreementId;
            model.EstablishmentId = establishmentId;
            var command = new CreateParticipant(User, agreementId, establishmentId);
            Mapper.Map(model, command);

            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement participant was successfully created.");
            return response;
        }

        [DELETE("{establishmentId:int}")]
        public HttpResponseMessage Delete(int agreementId, int establishmentId)
        {
            var command = new PurgeParticipant(User, agreementId, establishmentId);

            _purgeHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement participant was successfully deleted.");
            return response;
        }
    }
}
