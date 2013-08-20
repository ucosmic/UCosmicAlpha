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
    public class AgreementContactPhonesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateContactPhone> _createHandler;
        //private readonly IHandleCommands<UpdateContact> _updateHandler;
        //private readonly IHandleCommands<PurgeContact> _purgeHandler;

        public AgreementContactPhonesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateContactPhone> createHandler
            //, IHandleCommands<UpdateContact> updateHandler
            //, IHandleCommands<PurgeContact> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            //_updateHandler = updateHandler;
            //_purgeHandler = purgeHandler;
        }

        [GET("{agreementId:int}/contacts/{contactId:int}/phones")]
        public IEnumerable<AgreementContactPhoneApiModel> Get(int agreementId, int contactId)
        {
            throw new HttpResponseException(HttpStatusCode.NotImplemented);
        }

        [GET("{agreementId:int}/contacts/{contactId:int}/phones/{phoneId:int}", ControllerPrecedence = 1)]
        public AgreementContactPhoneApiModel Get(int agreementId, int contactId, int phoneId)
        {
            throw new HttpResponseException(HttpStatusCode.NotImplemented);
        }

        [POST("{agreementId:int}/contacts/{contactId:int}/phones")]
        public HttpResponseMessage Post(int agreementId, int contactId, [FromBody] AgreementContactPhoneApiModel model)
        {
            model.ContactId = contactId;
            var command = new CreateContactPhone(User, agreementId, contactId);
            Mapper.Map(model, command);

            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created,
               string.Format("Contact '{0}' was successfully created.", "name"));
            var url = Url.Link(null, new
            {
                controller = "AgreementContactPhones",
                action = "Get",
                agreementId,
                contactId,
                phoneId = command.CreatedContactPhoneId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        //[PUT("{agreementId:int}/contacts/{contactId:int}")]
        //public HttpResponseMessage Put(int agreementId, int contactId, [FromBody] AgreementContactApiModel model)
        //{
        //    model.Id = contactId;
        //    model.AgreementId = agreementId;
        //    var command = new UpdateContact(User);
        //    Mapper.Map(model, command);

        //    _updateHandler.Handle(command);

        //    var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement contact was successfully updated.");
        //    return response;
        //}

        //[DELETE("{agreementId:int}/contacts/{contactId:int}")]
        //public HttpResponseMessage Delete(int agreementId, int contactId)
        //{
        //    var command = new PurgeContact(User, agreementId, contactId);
        //    _purgeHandler.Handle(command);
        //    var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement contact was successfully deleted.");
        //    return response;
        //}
    }
}
