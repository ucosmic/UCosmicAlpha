using System.Web.Http;
using AttributeRouting.Web.Http;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class EmployeeModuleSettingsApiController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EmployeeModuleSettingsApiController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("{id}")]
        public object Get(int id)
        {
            return null;
        }
    }
}
