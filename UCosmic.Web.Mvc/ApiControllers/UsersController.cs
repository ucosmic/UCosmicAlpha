using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AutoMapper;
using UCosmic.Domain.Identity;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    [Authorize(Roles = RoleName.SecurityAdministrators)]
    public class UsersController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public UsersController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public IEnumerable<UserApiModel> GetAll()
        {
            var entities = _queryProcessor.Execute(new MyUsers(User)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person,
                    x => x.Grants.Select(y => y.Role),
                }
            });
            var models = Mapper.Map<UserApiModel[]>(entities);
            return models;
        }
    }
}
