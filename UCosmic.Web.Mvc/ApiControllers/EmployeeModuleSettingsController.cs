using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/my/employee-module-settings")]
    public class EmployeeModuleSettingsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EmployeeModuleSettingsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("faculty-ranks")]
        public IEnumerable<FacultyRankApiModel> Get()
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
            if (employeeModuleSettings == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var models = Mapper.Map<FacultyRankApiModel[]>(employeeModuleSettings.FacultyRanks);
            return models;
        }
    }
}
