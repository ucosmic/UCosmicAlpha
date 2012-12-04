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
    public class EstablishmentUrlsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateEstablishmentUrl> _createValidator;
        private readonly IHandleCommands<CreateEstablishmentUrl> _createHandler;
        private readonly IValidator<UpdateEstablishmentUrl> _updateValidator;
        private readonly IHandleCommands<UpdateEstablishmentUrl> _updateHandler;
        private readonly IHandleCommands<DeleteEstablishmentUrl> _deleteHandler;

        public EstablishmentUrlsController(
            IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishmentUrl> createHandler
            , IValidator<CreateEstablishmentUrl> createValidator
            , IHandleCommands<UpdateEstablishmentUrl> updateHandler
            , IValidator<UpdateEstablishmentUrl> updateValidator
            , IHandleCommands<DeleteEstablishmentUrl> deleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _createValidator = createValidator;
            _updateHandler = updateHandler;
            _updateValidator = updateValidator;
            _deleteHandler = deleteHandler;
        }

        [GET("{establishmentId}/urls")]
        public IEnumerable<EstablishmentUrlApiModel> GetAll(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // get urls
            var entities = _queryProcessor.Execute(new EstablishmentUrls(establishmentId)
            {
                EagerLoad = new Expression<Func<EstablishmentUrl, object>>[]
                {
                    x => x.ForEstablishment,
                },
                OrderBy = new Dictionary<Expression<Func<EstablishmentUrl, object>>, OrderByDirection>
                {
                    { x => x.IsOfficialUrl, OrderByDirection.Descending },
                    { x => x.IsFormerUrl, OrderByDirection.Ascending },
                    { x => x.Value, OrderByDirection.Ascending },
                }
            });

            // map to models and return
            var models = Mapper.Map<EstablishmentUrlApiModel[]>(entities);
            return models;
        }

        [GET("{establishmentId}/urls/{establishmentUrlId}")]
        public EstablishmentUrlApiModel Get(int establishmentId, int establishmentUrlId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentUrlId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var entity = _queryProcessor.Execute(new EstablishmentUrlById(establishmentUrlId)
            {
                EagerLoad = new Expression<Func<EstablishmentUrl, object>>[]
                {
                    x => x.ForEstablishment,
                },
            });

            var model = Mapper.Map<EstablishmentUrlApiModel>(entity);
            return model;
        }

        [POST("{establishmentId}/urls")]
        [Authorize(Roles = "Establishment Administrator")]
        public HttpResponseMessage Post(int establishmentId, EstablishmentUrlApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;

            var command = new CreateEstablishmentUrl(User);
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

            var response = Request.CreateResponse(HttpStatusCode.Created,
                string.Format("Establishment URL '{0}' was successfully created.", model.Value));
            var url = Url.Link(null, new
            {
                controller = "EstablishmentUrls",
                action = "Get",
                establishmentId,
                establishmentUrlId = command.Id,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            return response;
        }

        [PUT("{establishmentId}/urls/{establishmentUrlId}")]
        [Authorize(Roles = "Establishment Administrator")]
        public HttpResponseMessage Put(int establishmentId, int establishmentUrlId, EstablishmentUrlApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentUrlId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;
            model.Id = establishmentUrlId;

            var command = new UpdateEstablishmentUrl(User);
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

            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment URL was successfully updated.");
            return response;
        }

        [DELETE("{establishmentId}/urls/{establishmentUrlId}")]
        [Authorize(Roles = "Establishment Administrator")]
        public HttpResponseMessage Delete(int establishmentId, int establishmentUrlId)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentUrlId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var entity = Get(establishmentId, establishmentUrlId);
            var command = new DeleteEstablishmentUrl(User, establishmentUrlId);

            try
            {
                _deleteHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK,
                string.Format("Establishment URL '{0}' was successfully deleted.", entity.Value));
            return response;
        }

        [POST("{establishmentId}/urls/{establishmentUrlId}/validate-value")]
        public HttpResponseMessage Validate(int establishmentId, int establishmentUrlId, EstablishmentUrlApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (!FindResources(establishmentId, establishmentUrlId > 0 ? establishmentUrlId : (int?)null))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            model.OwnerId = establishmentId;
            model.Id = establishmentUrlId;

            ValidationResult validationResult;
            string propertyName;
            if (model.Id < 1)
            {
                var command = new CreateEstablishmentUrl(User);
                Mapper.Map(model, command);
                validationResult = _createValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Value);
            }
            else
            {
                var command = new UpdateEstablishmentUrl(User);
                Mapper.Map(model, command);
                validationResult = _updateValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Value);
            }

            Func<ValidationFailure, bool> forValue = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forValue))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forValue).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private bool FindResources(int establishmentId, int? establishmentUrlId = null)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId));
            if (establishment == null)
                return false;

            if (establishmentUrlId.HasValue &&
                establishment.Urls.SingleOrDefault(x => x.RevisionId == establishmentUrlId.Value) == null)
                return false;

            return true;
        }
    }
}
