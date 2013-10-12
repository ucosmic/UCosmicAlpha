using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Agreements;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class AgreementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateAgreement> _createValidator;
        private readonly IHandleCommands<CreateAgreement> _createHandler;
        private readonly IHandleCommands<UpdateAgreement> _updateHandler;
        private readonly IHandleCommands<PurgeAgreement> _purgeHandler;

        public AgreementsController(IProcessQueries queryProcessor
            , IValidator<CreateAgreement> createValidator
            , IHandleCommands<CreateAgreement> createHandler
            , IHandleCommands<UpdateAgreement> updateHandler
            , IHandleCommands<PurgeAgreement> purgeHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createValidator = createValidator;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _purgeHandler = purgeHandler;
        }

        [GET("{domain}/agreements")]
        public PageOfAgreementApiFlatModel Get(string domain, [FromUri] AgreementSearchInputModel input)
        {
            if (input.PageSize < 1 || input == null || string.IsNullOrWhiteSpace(domain))
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new AgreementsByKeyword(User, domain);
            Mapper.Map(input, query);

            var results = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfAgreementApiFlatModel>(results);
            return model;
        }

        [GET("agreements/{agreementId:int}")]
        public AgreementApiModel Get(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementApiModel>(entity);
            return model;
        }

        [GET("{domain}/agreements/visibility")]
        public string GetVisibility(string domain)
        {
            var query = new MyAgreementsVisibility(User, domain);
            var visibility = _queryProcessor.Execute(query);
            return visibility.AsSentenceFragment();
        }

        [GET("agreements/{agreementId:int}/visibility")]
        public string GetVisibility(int agreementId)
        {
            var query = new MyAgreementVisibility(User, agreementId);
            var visibility = _queryProcessor.Execute(query);
            return visibility.AsSentenceFragment();
        }

        [GET("agreements/{agreementId:int}/umbrellas")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public IEnumerable<TextValuePair> GetUmbrellaOptions(int agreementId)
        {
            var entities = _queryProcessor.Execute(new UmbrellaOptions(User, agreementId)
            {
                EagerLoad = new Expression<Func<Agreement, object>>[]
                {
                    x => x.Participants.Select(y => y.Establishment.Names.Select(z => z.TranslationToLanguage)),
                }
            });
            var models = Mapper.Map<IEnumerable<TextValuePair>>(entities)
                .OrderBy(x => x.Value);
            return models;
        }

        [POST("agreements")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Post(AgreementApiModel model)
        {
            var command = new CreateAgreement(User);
            Mapper.Map(model, command);
            _createHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.Created, "Agreement was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Agreements",
                action = "Get",
                agreementId = command.CreatedAgreementId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [POST("agreements/validate")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage PostValidate(AgreementApiModel model)
        {
            var command = new CreateAgreement(User);
            Mapper.Map(model, command);
            var validationResult = _createValidator.Validate(command);

            if (!validationResult.IsValid)
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    Mapper.Map<ValidationResultApiModel>(validationResult));

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [PUT("agreements/{agreementId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Put(int agreementId, AgreementApiModel model)
        {
            model.Id = agreementId;
            var command = new UpdateAgreement(User, agreementId);
            Mapper.Map(model, command);

            _updateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement was successfully updated.");
            return response;
        }

        [DELETE("agreements/{agreementId:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Delete(int agreementId)
        {
            var command = new PurgeAgreement(User, agreementId);

            _purgeHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement was successfully deleted.");
            return response;
        }
    }
}
