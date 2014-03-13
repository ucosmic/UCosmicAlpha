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
        private readonly IHandleCommands<UpdateAgreementSettings> _updateHandler;

        public AgreementSettingsController(IProcessQueries queryProcessor
            , IHandleCommands<UpdateAgreementSettings> updateHandler)
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

    }
}
