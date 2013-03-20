using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class RolesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public RolesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [Authorize(Roles = RoleName.RoleGrantors)]
        public PageOfRoleApiModel GetAll()
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entities = _queryProcessor.Execute(new RolesByKeyword(User)
            {
                PageSize = int.MaxValue,
            });

            var models = Mapper.Map<PageOfRoleApiModel>(entities);
            
            return models;
        }
    }
}
