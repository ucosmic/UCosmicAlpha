using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
    [Authorize(Roles = RoleName.UserManagers)]
    public class UsersController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<GrantRoleToUser> _grantRole;
        private readonly IHandleCommands<RevokeRoleFromUser> _revokeRole;

        public UsersController(IProcessQueries queryProcessor
            , IHandleCommands<GrantRoleToUser> grantRole
            , IHandleCommands<RevokeRoleFromUser> revokeRole
        )
        {
            _queryProcessor = queryProcessor;
            _grantRole = grantRole;
            _revokeRole = revokeRole;
        }

        public PageOfUserApiModel GetAll([FromUri] UserSearchInputModel input)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new MyUsersByKeyword(User)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person,
                    x => x.Grants.Select(y => y.Role),
                },
            };
            Mapper.Map(input, query);

            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<PageOfUserApiModel>(entities);
            foreach (var model in models.Items)
                model.Roles = model.Roles.OrderBy(x => x.Name).ToArray();
            return models;
        }

        [GET("{userId}/roles")]
        public IEnumerable<RoleApiModel> GetRoles(int userId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var query = new RolesGrantedToUserId(User, userId)
            {
                OrderBy = new Dictionary<Expression<Func<Role, object>>, OrderByDirection>
                {
                    { x => x.Name, OrderByDirection.Ascending },
                },
            };
            var entities = _queryProcessor.Execute(query);
            var models = Mapper.Map<RoleApiModel[]>(entities);

            return models;
        }

        [PUT("{userId}/roles/{roleId}")]
        [Authorize(Roles = RoleName.RoleGrantors)]
        public HttpResponseMessage PutInRole(int userId, int roleId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new GrantRoleToUser(User, roleId, userId);

            try
            {
                _grantRole.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest,
                    ex.Errors.First().ErrorMessage, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, "Access was granted successfully.");
            return response;
        }

        [DELETE("{userId}/roles/{roleId}")]
        [Authorize(Roles = RoleName.RoleGrantors)]
        public HttpResponseMessage DeleteFromRole(int userId, int roleId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new RevokeRoleFromUser(User, roleId, userId);

            try
            {
                _revokeRole.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest,
                    ex.Errors.First().ErrorMessage, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, "Access was revoked successfully.");
            return response;
        }
    }
}
