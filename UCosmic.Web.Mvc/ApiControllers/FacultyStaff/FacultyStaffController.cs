using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/faculty-staff")]
    public class FacultyStaffController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public FacultyStaffController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("summary")]
        public FacultyStaffActivitiesSummaryModel Get()
        {
            var model = new FacultyStaffActivitiesSummaryModel();

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
                var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId));

                int totalActivities = 0;
                int totalCountriesWithActivities = 0;

                var countries = _entities.Query<Place>().Where(p => p.IsCountry);
                foreach (var country in countries)
                {
                    var activityCountryCount = new FacultyStaffActivitiesInCountryModel();

                    activityCountryCount.PlaceId = country.RevisionId;
                    activityCountryCount.OfficialName = country.OfficialName;
                    activityCountryCount.Count = _queryProcessor.Execute(new ActivityCountByCountryIdEstablishmentId(country.RevisionId, establishment.RevisionId));
                    
                    totalActivities += activityCountryCount.Count;

                    if (activityCountryCount.Count > 0)
                    {
                        totalCountriesWithActivities += 1;
                    }

                    var typeCounts = new Collection<FacultyStaffActivityCountModel>();
                    if (settings.ActivityTypes.Any())
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            var typeCount = new FacultyStaffActivityCountModel();

                            typeCount.TypeId = type.Id;
                            typeCount.Type = type.Type;
                            typeCount.Count = _queryProcessor.Execute(new ActivityCountByTypeIdCountryIdEstablishmentId(type.Id, country.RevisionId, establishment.RevisionId));

                            typeCounts.Add(typeCount);
                        }
                    }
                    activityCountryCount.TypeCounts = typeCounts;

                    model.CountryCounts.Add(activityCountryCount);
                }

                model.TotalActivities = totalActivities;
                model.TotalCountriesWithActivities = totalCountriesWithActivities;
            }

            return model;
        }
    }
}
