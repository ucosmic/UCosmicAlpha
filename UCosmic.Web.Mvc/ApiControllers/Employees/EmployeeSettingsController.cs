using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class EmployeeSettingsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EmployeeSettingsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("user/settings/employees")]
        [GET("people/{personId:int}/settings/employees", ActionPrecedence = 1)]
        public HttpResponseMessage GetByPerson(int? personId = null)
        {
            //System.Threading.Thread.Sleep(30000);

            var entity = _queryProcessor.Execute(new EmployeeSettingsByPerson(User, personId)
            {
                EagerLoad = EmployeeSettingsApiModel.EagerLoad,
            });
            if (entity == null)
                return Request.CreateResponse(HttpStatusCode.NotFound);

            var model = Mapper.Map<EmployeeSettingsApiModel>(entity);
            return Request.CreateResponse(HttpStatusCode.OK, model);
        }
    }
}
