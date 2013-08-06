using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
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

                /* ----- Activity Counts ----- */                
                {
                    if ((settings != null) && (settings.ActivityTypes.Any()))
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            var typeCount = new FacultyStaffActivityCountModel
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = 0
                            };

                            model.WorldActivityCounts.Add(typeCount);
                        }
                    }

                    int totalCountriesWithActivities = 0;

                    var countries = _entities.Query<Place>().Where(p => p.IsCountry);
                    foreach (var country in countries)
                    {
                        var activityCountryCount = new FacultyStaffActivitiesInCountryModel();

                        activityCountryCount.PlaceId = country.RevisionId;
                        activityCountryCount.OfficialName = country.OfficialName;
                        activityCountryCount.Count =
                            _queryProcessor.Execute(new ActivityCountByCountryIdEstablishmentId(country.RevisionId,
                                                                                                establishment.RevisionId));

                        if (activityCountryCount.Count > 0)
                        {
                            totalCountriesWithActivities += 1;
                        }

                        var typeCounts = new Collection<FacultyStaffActivityCountModel>();
                        if ((settings != null) && (settings.ActivityTypes.Any()))
                        {
                            foreach (var type in settings.ActivityTypes)
                            {
                                var typeCount = new FacultyStaffActivityCountModel();

                                typeCount.TypeId = type.Id;
                                typeCount.Type = type.Type;
                                typeCount.Count =
                                    _queryProcessor.Execute(new ActivityCountByTypeIdCountryIdEstablishmentId(type.Id,
                                                                                                              country.RevisionId,
                                                                                                              establishment.RevisionId));

                                typeCounts.Add(typeCount);

                                model.WorldActivityCounts.Single(a => a.TypeId == typeCount.TypeId).Count += typeCount.Count;
                            }
                        }
                        activityCountryCount.TypeCounts = typeCounts;

                        model.CountryActivityCounts.Add(activityCountryCount);
                    }

                    model.TotalActivities = _queryProcessor.Execute(new ActivityCountByEstablishmentId(establishment.RevisionId));
                    model.TotalCountriesWithActivities = totalCountriesWithActivities;
                }

                /* ----- People Counts ----- */
                {
                    if ((settings != null) && (settings.ActivityTypes.Any()))
                    {
                        foreach (var type in settings.ActivityTypes)
                        {
                            var typeCount = new FacultyStaffActivityCountModel
                            {
                                TypeId = type.Id,
                                Type = type.Type,
                                Count = 0
                            };

                            model.WorldPeopleCounts.Add(typeCount);
                        }
                    }

                    int totalCountriesWithPeople = 0;

                    var countries = _entities.Query<Place>().Where(p => p.IsCountry);
                    foreach (var country in countries)
                    {
                        var peopleCountryCount = new FacultyStaffActivitiesInCountryModel();

                        peopleCountryCount.PlaceId = country.RevisionId;
                        peopleCountryCount.OfficialName = country.OfficialName;
                        peopleCountryCount.Count =
                            _queryProcessor.Execute(new PeopleCountByCountryIdEstablishmentId(country.RevisionId,
                                                                                              establishment.RevisionId));

                        if (peopleCountryCount.Count > 0)
                        {
                            totalCountriesWithPeople += 1;
                        }

                        var typeCounts = new Collection<FacultyStaffActivityCountModel>();
                        if ((settings != null) && (settings.ActivityTypes.Any()))
                        {
                            foreach (var type in settings.ActivityTypes)
                            {
                                var typeCount = new FacultyStaffActivityCountModel();

                                typeCount.TypeId = type.Id;
                                typeCount.Type = type.Type;
                                typeCount.Count =
                                    _queryProcessor.Execute(new PeopleCountByTypeIdCountryIdEstablishmentId(type.Id,
                                                                                                              country.RevisionId,
                                                                                                              establishment.RevisionId));

                                typeCounts.Add(typeCount);

                                model.WorldPeopleCounts.Single(a => a.TypeId == typeCount.TypeId).Count += typeCount.Count;
                            }
                        }
                        peopleCountryCount.TypeCounts = typeCounts;

                        model.CountryPeopleCounts.Add(peopleCountryCount);
                    }

                    model.TotalPeople = _queryProcessor.Execute(new PeopleCountByEstablishmentId(establishment.RevisionId));
                    model.TotalCountriesWithPeople = totalCountriesWithPeople;
                }
            }

            return model;
        }
    }
}
