using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Establishments;
using UCosmic.Www.Mvc.Models;

namespace UCosmic.Www.Mvc.ApiControllers
{
    [RoutePrefix("api/establishments")]
    public class EstablishmentNamesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateEstablishmentName> _updateHandler;
        private readonly IHandleCommands<DeleteEstablishmentName> _deleteHandler;
        private readonly IHandleCommands<CreateEstablishmentName> _createHandler;

        public EstablishmentNamesController(
             IProcessQueries queryProcessor
            , IHandleCommands<UpdateEstablishmentName> updateHandler
            , IHandleCommands<DeleteEstablishmentName> deleteHandler
            , IHandleCommands<CreateEstablishmentName> createHandler
        )
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
            _deleteHandler = deleteHandler;
            _createHandler = createHandler;
        }

        [GET("{establishmentId}/names")]
        public IEnumerable<EstablishmentNameApiModel> GetAll(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000);
            var entities = _queryProcessor.Execute(new EstablishmentNames(establishmentId)
            {
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
                OrderBy = new Dictionary<Expression<Func<EstablishmentName, object>>, OrderByDirection>
                {
                    { x => x.IsOfficialName, OrderByDirection.Descending },
                    { x => x.IsFormerName, OrderByDirection.Ascending },
                }
            });

            var models = Mapper.Map<EstablishmentNameApiModel[]>(entities);

            return models;
        }

        [POST("{establishmentId}/names")]
        public void Post(int establishmentId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            var command = new CreateEstablishmentName(User)
            {
                OwnerId = establishmentId,
            };
            Mapper.Map(model, command);
            _createHandler.Handle(command);
        }

        [PUT("names/{establishmentNameId}")]
        public void Put(int establishmentNameId, [FromBody] EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000);
            if (establishmentNameId != model.Id)
                throw new InvalidOperationException("URL does not match primary key of data item.");

            var command = new UpdateEstablishmentName(User);
            Mapper.Map(model, command);
            _updateHandler.Handle(command);
        }

        [DELETE("names/{establishmentNameId}")]
        public void Delete(int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000);
            var command = new DeleteEstablishmentName(User, establishmentNameId);
            _deleteHandler.Handle(command);
        }
    }
}
