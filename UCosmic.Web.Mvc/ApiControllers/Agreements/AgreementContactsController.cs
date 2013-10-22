using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Web.Http;
using System.Net;
using System.Net.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/agreements")]
    public class AgreementContactsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateContact> _createHandler;
        private readonly IHandleCommands<UpdateContact> _updateHandler;
        private readonly IHandleCommands<PurgeContact> _purgeHandler;

        public AgreementContactsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateContact> createHandler
            , IHandleCommands<UpdateContact> updateHandler
            , IHandleCommands<PurgeContact> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _purgeHandler = purgeHandler;
        }

        [GET("{agreementId:int}/contacts")]
        public IEnumerable<AgreementContactApiModel> Get(int agreementId)
        {
            var entities = _queryProcessor.Execute(new ContactsByAgreementId(User, agreementId)
            {
                EagerLoad = new Expression<Func<AgreementContact, object>>[]
                {
                    x => x.Person.Emails,
                    x => x.PhoneNumbers,
                }
            });

            var models = Mapper.Map<AgreementContactApiModel[]>(entities);

            

            return models;
        }

        [GET("{agreementId:int}/contacts/{contactId:int}", ControllerPrecedence = 1)]
        public AgreementContactApiModel Get(int agreementId, int contactId)
        {
            var entity = _queryProcessor.Execute(new ContactById(User, agreementId, contactId)
            {
                EagerLoad = new Expression<Func<AgreementContact, object>>[]
                {
                    x => x.Person.Emails,
                    x => x.PhoneNumbers,
                }
            });
            if (entity == null || entity.AgreementId != agreementId)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var model = Mapper.Map<AgreementContactApiModel>(entity);

            return model;
        }

        [POST("{agreementId:int}/contacts")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Post(int agreementId, [FromBody] AgreementContactApiModel model)
        {
            model.AgreementId = agreementId;
            var command = new CreateContact(User);
            Mapper.Map(model, command);

            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Agreement contact was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "AgreementContacts",
                action = "Get",
                agreementId,
                contactId = command.CreatedContactId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{agreementId:int}/contacts/{contactId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Put(int agreementId, int contactId, [FromBody] AgreementContactApiModel model)
        {
            model.Id = contactId;
            model.AgreementId = agreementId;
            var command = new UpdateContact(User);
            Mapper.Map(model, command);

            _updateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement contact was successfully updated.");
            return response;
        }

        [DELETE("{agreementId:int}/contacts/{contactId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Delete(int agreementId, int contactId)
        {
            var command = new PurgeContact(User, agreementId, contactId);
            _purgeHandler.Handle(command);
            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement contact was successfully deleted.");
            return response;
        }
    }
}
