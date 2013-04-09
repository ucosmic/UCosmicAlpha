using System;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    [Authorize(Roles = RoleName.UserManagers)]
    public class UsersController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateUser> _createUser;
        private readonly IValidator<CreateUser> _createValidator;

        public UsersController(IProcessQueries queryProcessor
            , IHandleCommands<CreateUser> createUser
            , IValidator<CreateUser> createValidator
        )
        {
            _queryProcessor = queryProcessor;
            _createUser = createUser;
            _createValidator = createValidator;
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
            if (User.IsInAnyRole(RoleName.RoleGrantors))
                foreach (var model in models.Items)
                    model.Roles = model.Roles.OrderBy(x => x.Name).ToArray();
            else
                foreach (var model in models.Items)
                    model.Roles = Enumerable.Empty<RoleApiModel>();
            return models;
        }

        [GET("{userId}")]
        public UserApiModel GetOne(int userId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var entity = _queryProcessor.Execute(new UserById(userId)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person,
                    x => x.Grants.Select(y => y.Role),
                }
            });
            if (entity == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var model = Mapper.Map<UserApiModel>(entity);
            if (!User.IsInAnyRole(RoleName.RoleGrantors))
                model.Roles = Enumerable.Empty<RoleApiModel>();
            return model;
        }

        [POST("")]
        public HttpResponseMessage Create(UserApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new CreateUser(User, model.Name)
            {
                PersonDisplayName = model.PersonDisplayName,
            };

            try
            {
                _createUser.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest,
                    ex.Errors.First().ErrorMessage, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.Created, "User was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Users",
                action = "GetOne",
                userId = command.CreatedUserId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);

            return response;
        }

        [POST("{userId}/validate-name")]
        public HttpResponseMessage ValidateName(int userId, UserApiModel model)
        {
            //System.Threading.Thread.Sleep(10000); // test api latency

            model.Id = userId;

            var command = new CreateUser(User, model.Name);
            var validationResult = _createValidator.Validate(command);
            var propertyName = command.PropertyName(y => y.Name);

            Func<ValidationFailure, bool> forName = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forName))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forName).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
