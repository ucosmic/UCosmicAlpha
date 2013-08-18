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
    [RoutePrefix("api/my/employee-module-settings")]
    public class EmployeeModuleSettingsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public EmployeeModuleSettingsController(IProcessQueries queryProcessor)
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
            var facultyRanks = employeeModuleSettings.FacultyRanks.OrderBy(r => r.Number).ToList();
            var models = Mapper.Map<FacultyRankApiModel[]>(facultyRanks);
            return models;
        }

        [GET("activity-types")]
        public IEnumerable<EmployeeActivityTypeApiModel> GetActivityTypes()
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            EmployeeModuleSettings employeeModuleSettings = null;

            if (!String.IsNullOrEmpty(User.Identity.Name))
            {
                employeeModuleSettings = _queryProcessor.Execute(
                    new EmployeeModuleSettingsByUserName(User.Identity.Name)
                    {
                        EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                        {
                            x => x.ActivityTypes
                        }
                    });
            }
            else
            {
                var tenancy = Request.Tenancy();
                Establishment establishment = null;

                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)); 
                }

                if (establishment != null)
                {
                    employeeModuleSettings = _queryProcessor.Execute(
                        new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId)
                        {
                            EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                    {
                        x => x.ActivityTypes
                    }
                    });                      
                }
            }

            // do not throw exception, some tenants may not use settings or faculty ranks
            if (employeeModuleSettings == null || !employeeModuleSettings.ActivityTypes.Any())
                return Enumerable.Empty<EmployeeActivityTypeApiModel>();

            var models = Mapper.Map<EmployeeActivityTypeApiModel[]>(employeeModuleSettings.ActivityTypes);
            return models;
        }

#if false
        [POST("activity-types")]
        public IEnumerable<EmployeeActivityTypeApiModel> PostActivityTypes(int[] activityIds)
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            EmployeeModuleSettings employeeModuleSettings = null;

            if (!String.IsNullOrEmpty(User.Identity.Name))
            {
                employeeModuleSettings = _queryProcessor.Execute(
                    new EmployeeModuleSettingsByUserName(User.Identity.Name)
                    {
                        EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                    {
                        x => x.ActivityTypes
                    }
                    });
            }
            else
            {
                var tenancy = Request.Tenancy();
                Establishment establishment = null;

                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }

                if (establishment != null)
                {
                    employeeModuleSettings = _queryProcessor.Execute(
                        new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId)
                        {
                            EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                    {
                        x => x.ActivityTypes
                    }
                        });
                }
            }

            // do not throw exception, some tenants may not use settings or faculty ranks
            if (employeeModuleSettings == null || !employeeModuleSettings.ActivityTypes.Any())
                return Enumerable.Empty<EmployeeActivityTypeApiModel>();

            var models = Mapper.Map<EmployeeActivityTypeApiModel[]>(employeeModuleSettings.ActivityTypes);
            return models;
        }
#endif

    }
}
