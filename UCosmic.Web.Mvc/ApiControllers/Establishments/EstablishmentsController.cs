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
using FluentValidation.Results;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/establishments")]
    public class EstablishmentsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEstablishment> _createHandler;
        private readonly IHandleCommands<UpdateEstablishment> _updateHandler;
        private readonly IValidator<CreateEstablishment> _createValidator;
        private readonly IValidator<UpdateEstablishment> _updateValidator;

        public EstablishmentsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishment> createHandler
            , IHandleCommands<UpdateEstablishment> updateHandler
            , IValidator<CreateEstablishment> createValidator
            , IValidator<UpdateEstablishment> updateValidator
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [GET("")]
        public PageOfEstablishmentApiFlatModel Get([FromUri] EstablishmentSearchInputModel input)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = Mapper.Map<EstablishmentViewsByKeyword>(input);
            var views = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfEstablishmentApiFlatModel>(views);
            return model;
        }

        [GET("{establishmentId:int}", ControllerPrecedence = 1)]
        public EstablishmentApiScalarModel Get(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Type,
                }
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<EstablishmentApiScalarModel>(entity);
            return model;
        }

        [GET("{establishmentId:int}/children")]
        public IEnumerable<EstablishmentApiScalarModel> GetChildren(int establishmentId, [FromUri] EstablishmentChildrenSearchInputModel input)
        {
            var query = new EstablishmentChildren(establishmentId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<EstablishmentApiScalarModel[]>(entities);
            return models;
        }

        [GET("{establishmentId:int}/offspring")]
        public IEnumerable<EstablishmentApiScalarModel> GetOffspring(int establishmentId)
        {
            var query = new EstablishmentOffspring(establishmentId);
            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<EstablishmentApiScalarModel[]>(entities);
            return models;
        }

        [POST("")]
        public HttpResponseMessage Post(EstablishmentPostModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new CreateEstablishment(User)
            {
                OfficialName = new CreateEstablishmentName(User),
                OfficialUrl = new CreateEstablishmentUrl(User),
                Location = new UpdateEstablishmentLocation(0, User),
            };
            Mapper.Map(model, command);

            try
            {
                _createHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.Created, "Establishment was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Establishments",
                action = "Get",
                establishmentId = command.Created.RevisionId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);

            return response;
        }

        [PUT("{establishmentId:int}")]
        public HttpResponseMessage Put(int establishmentId, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            model.Id = establishmentId;
            var command = new UpdateEstablishment(User, establishmentId);
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

            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment was successfully updated.");
            return response;
        }

        [POST("{establishmentId:int}/validate-ceeb-code")]
        public HttpResponseMessage ValidateCeebCode(int establishmentId, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            model.Id = establishmentId;

            ValidationResult validationResult;
            string propertyName;
            if (model.Id < 1)
            {
                var command = new CreateEstablishment(User);
                Mapper.Map(model, command);
                validationResult = _createValidator.Validate(command);
                propertyName = command.PropertyName(y => y.CeebCode);
            }
            else
            {
                var command = new UpdateEstablishment(User, model.Id);
                Mapper.Map(model, command);
                validationResult = _updateValidator.Validate(command);
                propertyName = command.PropertyName(y => y.CeebCode);
            }

            Func<ValidationFailure, bool> forText = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forText))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forText).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [POST("{establishmentId:int}/validate-ucosmic-code")]
        public HttpResponseMessage ValidateUCosmicCode(int establishmentId, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            model.Id = establishmentId;

            ValidationResult validationResult;
            string propertyName;
            if (model.Id < 1)
            {
                var command = new CreateEstablishment(User);
                Mapper.Map(model, command);
                validationResult = _createValidator.Validate(command);
                propertyName = command.PropertyName(y => y.UCosmicCode);
            }
            else
            {
                var command = new UpdateEstablishment(User, model.Id);
                Mapper.Map(model, command);
                validationResult = _updateValidator.Validate(command);
                propertyName = command.PropertyName(y => y.UCosmicCode);
            }

            Func<ValidationFailure, bool> forText = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forText))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forText).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [POST("{establishmentId:int}/validate-parent-id")]
        public HttpResponseMessage ValidateParentId(int establishmentId, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            model.Id = establishmentId;

            var command = new UpdateEstablishment(User, model.Id);
            Mapper.Map(model, command);
            var validationResult = _updateValidator.Validate(command);
            var propertyName = command.PropertyName(y => y.ParentId);

            Func<ValidationFailure, bool> forText = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forText))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forText).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
