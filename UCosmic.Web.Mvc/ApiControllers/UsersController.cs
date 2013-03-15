using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
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
                model.RoleGrants = model.RoleGrants.OrderBy(x => x.RoleName).ToArray();
            return models;
        }
    }
}
