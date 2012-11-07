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
using FluentValidation;
using FluentValidation.Results;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [RoutePrefix("api/establishments")]
    public class EstablishmentNamesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateEstablishmentName> _createValidator;
        private readonly IHandleCommands<CreateEstablishmentName> _createHandler;
        private readonly IValidator<UpdateEstablishmentName> _updateValidator;
        private readonly IHandleCommands<UpdateEstablishmentName> _updateHandler;
        private readonly IHandleCommands<DeleteEstablishmentName> _deleteHandler;

        public EstablishmentNamesController(
             IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishmentName> createHandler
            , IValidator<CreateEstablishmentName> createValidator
            , IHandleCommands<UpdateEstablishmentName> updateHandler
            , IValidator<UpdateEstablishmentName> updateValidator
            , IHandleCommands<DeleteEstablishmentName> deleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _createValidator = createValidator;
            _updateHandler = updateHandler;
            _updateValidator = updateValidator;
            _deleteHandler = deleteHandler;
        }

        [GET("{establishmentId}/names")]
        public IEnumerable<EstablishmentNameApiModel> GetAll(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // get names
            var entities = _queryProcessor.Execute(new EstablishmentNames(establishmentId)
            {
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
                OrderBy = new Dictionary<Expression<Func<EstablishmentName, object>>, OrderByDirection>
                {
                    { x => x.IsOfficialName, OrderByDirection.Descending },
                    { x => x.IsFormerName, OrderByDirection.Ascending },
                    { x => x.Text, OrderByDirection.Ascending },
                }
            });

            // map to models and return
            var models = Mapper.Map<EstablishmentNameApiModel[]>(entities);
            return models;
        }

        [GET("{establishmentId}/names/{establishmentNameId}")]
        public EstablishmentNameApiModel Get(int establishmentId, int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var entity = _queryProcessor.Execute(new EstablishmentNameById(establishmentNameId)
            {
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
            });

            var model = Mapper.Map<EstablishmentNameApiModel>(entity);
            return model;
        }

        [POST("{establishmentId}/names")]
        [Authorize(Roles = "Establishments Administrator")]
        public HttpResponseMessage Post(int establishmentId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;

            var command = new CreateEstablishmentName(User);
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

            var response = Request.CreateResponse(HttpStatusCode.Created, Get(establishmentId, command.Id));
            var uri = Url.Link(null, new
            {
                controller = "EstablishmentNames",
                action = "Get",
                establishmentId,
                establishmentNameId = command.Id,
            });
            response.Headers.Location = new Uri(uri);
            return response;
        }

        [PUT("{establishmentId}/names/{establishmentNameId}")]
        [Authorize(Roles = "Establishments Administrator")]
        public HttpResponseMessage Put(int establishmentId, int establishmentNameId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;
            model.Id = establishmentNameId;

            var command = new UpdateEstablishmentName(User);
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

            var response = Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }

        [DELETE("{establishmentId}/names/{establishmentNameId}")]
        [Authorize(Roles = "Establishments Administrator")]
        public HttpResponseMessage Delete(int establishmentId, int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var command = new DeleteEstablishmentName(User, establishmentNameId);

            try
            {
                _deleteHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            return new HttpResponseMessage(HttpStatusCode.NoContent);
        }

        [POST("{establishmentId}/names/{establishmentNameId}/validate-text")]
        public HttpResponseMessage Validate(int establishmentId, int establishmentNameId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentNameId > 0 ? establishmentNameId : (int?)null))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            model.OwnerId = establishmentId;
            model.Id = establishmentNameId;

            ValidationResult validationResult;
            string propertyName;
            if (model.Id < 1)
            {
                var command = new CreateEstablishmentName(User);
                Mapper.Map(model, command);
                validationResult = _createValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Text);
            }
            else
            {
                var command = new UpdateEstablishmentName(User);
                Mapper.Map(model, command);
                validationResult = _updateValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Text);
            }

            Func<ValidationFailure, bool> forText = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forText))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forText).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private bool FindResources(int establishmentId, int? establishmentNameId = null)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId));
            if (establishment == null)
                return false;

            if (establishmentNameId.HasValue &&
                establishment.Names.SingleOrDefault(x => x.RevisionId == establishmentNameId.Value) == null)
                return false;

            return true;
        }
    }
}
