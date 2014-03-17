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
    [RoutePrefix("api/agreements/settings")]
    [Authorize(Roles = RoleName.AgreementManagers)]
    public class AgreementSettingsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateOrUpdateSettings> _updateHandler;

        public AgreementSettingsController(IProcessQueries queryProcessor
            , IHandleCommands<CreateOrUpdateSettings> updateHandler)
        {
            _queryProcessor = queryProcessor;
            _updateHandler = updateHandler;
        }

        [GET("", SitePrecedence = 1)]
        public AgreementSettingsApiModel Get()
        {
            var entity = _queryProcessor.Execute(new MyAgreementSettings(User));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementSettingsApiModel>(entity);
            return model;
        }

        [PUT("{id:int}")]
        [Authorize(Roles = RoleName.AgreementManagers)]
        public HttpResponseMessage Put(int id, AgreementSettingsApiModel model)
        {
           // model.Id = id;
            var command = new CreateOrUpdateSettings(User, id);
            Mapper.Map(model, command);

            _updateHandler.Handle(command);

            var response = Request.CreateResponse(HttpStatusCode.OK, "Agreement settings was successfully updated.");
            return response;
        }

    }
}
