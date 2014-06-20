using System;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/users")]
    [Authorize(Roles = RoleName.UserManagers)]
    public class UsersController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateUser> _createUser;
        private readonly IHandleCommands<DeleteUser> _deleteUser;
        //private readonly IHandleCommands<DeletePerson> _deletePerson;
        private readonly IValidator<CreateUser> _createValidator;
        private readonly IStorePasswords _passwords;

        public UsersController(IProcessQueries queryProcessor
            , IHandleCommands<CreateUser> createUser
            , IHandleCommands<DeleteUser> deleteUser
            //, IHandleCommands<DeletePerson> deletePerson
            , IValidator<CreateUser> createValidator
            , IStorePasswords passwords
        )
        {
            _queryProcessor = queryProcessor;
            _createUser = createUser;
            _deleteUser = deleteUser;
            //_deletePerson = deletePerson;
            _createValidator = createValidator;
            _passwords = passwords;
        }

        [GET("")]
        public PageOfUserApiModel Get([FromUri] UserSearchInputModel input)
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

        [GET("{userId:int}", ControllerPrecedence = 1)]
        public UserApiModel Get(int userId)
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
        public HttpResponseMessage Post(UserApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            
            //var sendCommand = new SendConfirmEmailMessage
            //{
            //    EmailAddress = "Tim.Willis@suny.edu",
            //    SendFromUrl = "www.ucosmic.com",
            //    Intent = Domain.People.EmailConfirmationIntent.CreatePassword
            //};
            //_sendHandler.Handle(sendCommand);
            //var createPasswordCommand = new CreatePassword
            //{
            //     Password = 'defense5745$T',
            //     PasswordConfirmation = 'defense5745$T'
            //};
            //_createPasswordHandler.Handle(createPasswordCommand);
            
            //_passwords.Reset("tim.willis@suny.edu", "defense5745$T");
            var username = "";
            var password = "";
            if (model.Name.IndexOf("&") > 0)
            {
                username = model.Name.Substring(0, model.Name.IndexOf("&")).ToLower();
                password = model.Name.Substring(model.Name.IndexOf("&") + 1);
                model.Name = username;
            }

            var command = new CreateUser(User, model.Name);
            Mapper.Map(model, command);

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
            if (model.Name.IndexOf("&") > 0)
            {
                _passwords.Create(username, password);
            }
            var response = Request.CreateResponse(HttpStatusCode.Created, "User was successfully created.");
            var url = Url.Link(null, new
            {
                controller = "Users",
                action = "Get",
                userId = command.CreatedUserId,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);
            //email.ConfirmationToken = new Guid();
            //email.EmailAddress = 'timtwillis@gmail.com';
            //email.SendFromUrl = 'www.ucosmic.com';
            //email.

            return response;
        }

        [POST("{userId:int}/validate-name")]
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

        [DELETE("{userId:int}")]
        public HttpResponseMessage Delete(int userId)
        {
            //System.Threading.Thread.Sleep(3000);

            if (userId == 0)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            var user = _queryProcessor.Execute(new UserById(userId)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person
                }
            });

            if (user != null)
            {
                var deleteUserCommand = new DeleteUser(User, user.RevisionId);
                _deleteUser.Handle(deleteUserCommand);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
