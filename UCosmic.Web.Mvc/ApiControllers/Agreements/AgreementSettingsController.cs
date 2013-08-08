using System.Net;
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

        public AgreementSettingsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("", SitePrecedence = 1)]
        public AgreementSettingsApiModel Get()
        {
            var entity = _queryProcessor.Execute(new MyAgreementSettings(User));
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<AgreementSettingsApiModel>(entity);
            return model;
        }

    }
}
