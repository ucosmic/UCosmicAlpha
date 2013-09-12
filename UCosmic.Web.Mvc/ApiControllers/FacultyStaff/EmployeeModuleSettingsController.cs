using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
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
        private readonly IStoreBinaryData _binaryStore;

        public EmployeeModuleSettingsController(IProcessQueries queryProcessor, IStoreBinaryData binaryStore)
        {
            _queryProcessor = queryProcessor;
            _binaryStore = binaryStore;
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

        [GET("icon/{name}")]
        public HttpResponseMessage GetIcon(string name)
        {
            if (string.IsNullOrEmpty(name) || string.IsNullOrWhiteSpace(name))
            {
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }

            Establishment establishment = null;
            EmployeeModuleSettings employeeModuleSettings = null;

            if (!String.IsNullOrEmpty(User.Identity.Name))
            {
                employeeModuleSettings =
                    _queryProcessor.Execute(new EmployeeModuleSettingsByUserName(User.Identity.Name));
            }
            else
            {
                var tenancy = Request.Tenancy();
                
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
                    employeeModuleSettings =
                        _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId));
                }
                else
                {
                    return new HttpResponseMessage(HttpStatusCode.Unauthorized);
                }
            }

            string path;
            string mimeType;

            if (String.Compare(name, employeeModuleSettings.GlobalViewIconName, false, CultureInfo.CurrentCulture) == 0)
            {
                path = employeeModuleSettings.GlobalViewIconPath;
                mimeType = employeeModuleSettings.GlobalViewIconMimeType;
            }
            else if ( String.Compare(name, employeeModuleSettings.FindAnExpertIconName, false, CultureInfo.CurrentCulture) == 0)
            {
                path = employeeModuleSettings.FindAnExpertIconPath;
                mimeType = employeeModuleSettings.FindAnExpertIconMimeType;
            }
            else
            {
                if ((employeeModuleSettings.ActivityTypes != null) &&
                    (employeeModuleSettings.ActivityTypes.Count >= 0))
                {
                    EmployeeActivityType activityType =
                        employeeModuleSettings.ActivityTypes.FirstOrDefault(a => a.IconName == name);

                    if (activityType != null)
                    {
                        path = activityType.IconPath;
                        mimeType = activityType.IconMimeType;
                    }
                    else
                    {
                        return new HttpResponseMessage(HttpStatusCode.NotImplemented);
                    }
                }
                else
                {
                    return new HttpResponseMessage(HttpStatusCode.NotImplemented);
                }
            }

            byte[] content = _binaryStore.Get(path);
            if (content == null)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }

            var stream = new MemoryStream(content);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream)
            };

            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            return response;
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
