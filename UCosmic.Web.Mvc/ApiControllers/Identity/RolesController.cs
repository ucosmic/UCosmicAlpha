using System.Net;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/roles")]
    public class RolesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public RolesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("")]
        [Authorize(Roles = RoleName.RoleGrantors)]
        public PageOfRoleApiModel Get([FromUri] RoleSearchInputModel input)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            var query = new RolesByKeyword(User);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<PageOfRoleApiModel>(entities);
            return models;
        }
    }
}
