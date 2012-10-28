using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
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

            var models = Mapper.Map<EstablishmentNameApiModel[]>(entities);

            return models;
        }

        [POST("{establishmentId}/names")]
        public void Post(int establishmentId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            var command = new CreateEstablishmentName(User);
            Mapper.Map(model, command);
            _createHandler.Handle(command);
        }

        [PUT("{establishmentId}/names/{establishmentNameId}")]
        public void Put(int establishmentId, int establishmentNameId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (establishmentNameId != model.Id)
                throw new InvalidOperationException("URL does not match primary key of data item.");

            var command = new UpdateEstablishmentName(User);
            Mapper.Map(model, command);
            _updateHandler.Handle(command);
        }

        [DELETE("{establishmentId}/names/{establishmentNameId}")]
        public void Delete(int establishmentId, int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000);
            var command = new DeleteEstablishmentName(User, establishmentNameId);
            _deleteHandler.Handle(command);
        }


        [POST("{establishmentId}/names/{establishmentNameId}/validate")]
        public void Validate(int establishmentId, int establishmentNameId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            model.OwnerId = establishmentId;
            model.Id = establishmentNameId;
            if (model.Id < 1)
            {
                var command = new CreateEstablishmentName(User);
                Mapper.Map(model, command);
                _createValidator.ValidateAndThrow(command);
            }
            else
            {
                var command = new UpdateEstablishmentName(User);
                Mapper.Map(model, command);
                _updateValidator.ValidateAndThrow(command);
            }
        }
    }
}
