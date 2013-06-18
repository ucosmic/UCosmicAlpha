using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api")]
    public class ProfileElementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public ProfileElementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("faculty-ranks")]
        public IEnumerable<FacultyRankApiModel> GetFacultyRanks()
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            var employeeModuleSettings = _queryProcessor.Execute(
                new EmployeeModuleSettingsByUserName(User.Identity.Name)
                {
                    EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                    {
                        x => x.FacultyRanks,
                    }
                });

            // do not throw exception, some tenants may not use settings or faculty ranks
            if (employeeModuleSettings == null || !employeeModuleSettings.FacultyRanks.Any())
                return Enumerable.Empty<FacultyRankApiModel>();

            var models = Mapper.Map<FacultyRankApiModel[]>(employeeModuleSettings.FacultyRanks);
            return models;
        }
    }
}
