using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class RolesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<GrantRoleToUser> _grantRole;
        private readonly IHandleCommands<RevokeRoleFromUser> _revokeRole;

        public RolesController(IProcessQueries queryProcessor
            , IHandleCommands<GrantRoleToUser> grantRole
            , IHandleCommands<RevokeRoleFromUser> revokeRole
        )
        {
            _queryProcessor = queryProcessor;
            _grantRole = grantRole;
            _revokeRole = revokeRole;
        }

        [Authorize(Roles = RoleName.RoleGrantors)]
        public PageOfRoleApiModel GetAll([FromUri] RoleSearchInputModel input)
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

        [PUT("{roleId}/users/{userId}")]
        [Authorize(Roles = RoleName.RoleGrantors)]
        public HttpResponseMessage PutRoleGrant(int roleId, int userId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new GrantRoleToUser(User, roleId, userId);

            try
            {
                _grantRole.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, "Access was granted successfully.");
            return response;
        }

        [DELETE("{roleId}/users/{userId}")]
        [Authorize(Roles = RoleName.RoleGrantors)]
        public HttpResponseMessage DeleteRoleGrant(int roleId, int userId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new RevokeRoleFromUser(User, roleId, userId);

            try
            {
                _revokeRole.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, "Access was revoked successfully.");
            return response;
        }
    }
}
