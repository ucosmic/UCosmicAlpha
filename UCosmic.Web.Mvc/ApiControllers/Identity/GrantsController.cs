using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    [Authorize(Roles = RoleName.RoleGrantors)]
    public class GrantsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<GrantRoleToUser> _grantRole;
        private readonly IHandleCommands<RevokeRoleFromUser> _revokeRole;
        private readonly IValidator<GrantRoleToUser> _grantValidator;
        private readonly IValidator<RevokeRoleFromUser> _revokeValidator;

        public GrantsController(IProcessQueries queryProcessor
            , IHandleCommands<GrantRoleToUser> grantRole
            , IHandleCommands<RevokeRoleFromUser> revokeRole
            , IValidator<GrantRoleToUser> grantValidator
            , IValidator<RevokeRoleFromUser> revokeValidator
        )
        {
            _queryProcessor = queryProcessor;
            _grantRole = grantRole;
            _revokeRole = revokeRole;
            _grantValidator = grantValidator;
            _revokeValidator = revokeValidator;
        }

        [GET("users/{userId}/roles")]
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

        [PUT("users/{userId}/roles/{roleId}", ActionPrecedence = 1)]
        [PUT("roles/{roleId}/users/{userId}", ActionPrecedence = 2)]
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

        [DELETE("users/{userId}/roles/{roleId}", ActionPrecedence = 1)]
        [DELETE("roles/{roleId}/users/{userId}", ActionPrecedence = 2)]
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

        [POST("users/{userId}/roles/{roleId}/validate-grant", ActionPrecedence = 1)]
        [POST("roles/{roleId}/users/{userId}/validate-grant", ActionPrecedence = 2)]
        public HttpResponseMessage ValidateGrant(int userId, int roleId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new GrantRoleToUser(User, roleId, userId);
            var validationResult = _grantValidator.Validate(command);

            if (validationResult.Errors.Any())
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First().ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [POST("users/{userId}/roles/{roleId}/validate-revoke", ActionPrecedence = 1)]
        [POST("roles/{roleId}/users/{userId}/validate-revoke", ActionPrecedence = 2)]
        public HttpResponseMessage ValidateRevoke(int userId, int roleId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new RevokeRoleFromUser(User, roleId, userId);
            var validationResult = _revokeValidator.Validate(command);

            if (validationResult.Errors.Any())
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First().ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
