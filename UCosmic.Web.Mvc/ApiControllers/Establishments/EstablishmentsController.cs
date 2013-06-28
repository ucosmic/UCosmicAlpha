using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
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

        public PageOfEstablishmentApiFlatModel GetAll([FromUri] EstablishmentSearchInputModel input)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            var query = Mapper.Map<EstablishmentViewsByKeyword>(input);
            var views = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfEstablishmentApiFlatModel>(views);
            return model;
        }

        [GET("{establishmentId}")]
        public EstablishmentApiScalarModel GetOne(int establishmentId)
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

        [GET("{establishmentId}/children/")]
        public IEnumerable<EstablishmentApiScalarModel> GetChildren(int establishmentId, string sort)
        {
            var entity = _queryProcessor.Execute(new EstablishmentById(establishmentId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Type,
                }
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var children = (!String.IsNullOrEmpty(sort) && (String.Compare(sort,"true",true) == 0)) ?
                            entity.Children.OrderBy(x => x.OfficialName).ToArray() :
                            entity.Children.ToArray();
            var model = Mapper.Map<ICollection<EstablishmentApiScalarModel>>(children);

            return model;
        }

        [GET("{establishmentId}/children/")]
        public IEnumerable<EstablishmentApiScalarModel> GetChildren(int establishmentId)
        {
            return GetChildren(establishmentId, null);
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
                action = "GetOne",
                establishmentId = command.CreatedEstablishmentId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);

            return response;
        }

        [PUT("{id}")]
        public HttpResponseMessage Put(int id, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entity = _queryProcessor.Execute(new EstablishmentById(id));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            model.Id = id;
            var command = new UpdateEstablishment(id, User);
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

        [POST("{establishmentId}/validate-ceeb-code")]
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
                var command = new UpdateEstablishment(model.Id, User);
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

        [POST("{establishmentId}/validate-ucosmic-code")]
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
                var command = new UpdateEstablishment(model.Id, User);
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

        [POST("{establishmentId}/validate-parent-id")]
        public HttpResponseMessage ValidateParentId(int establishmentId, EstablishmentApiScalarModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            model.Id = establishmentId;

            var command = new UpdateEstablishment(model.Id, User);
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
