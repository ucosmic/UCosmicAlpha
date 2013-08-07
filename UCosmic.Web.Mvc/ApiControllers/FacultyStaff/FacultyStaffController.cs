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
                DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year+1, 1, 1);
                DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
                                           ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value+1))
                                           : new DateTime(DateTime.MinValue.Year, 1, 1);

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

                    int totalPlacesWithActivities = 0;

                    var places = _entities.Query<Place>().Where(p => p.IsCountry || p.IsWater);
                    foreach (var place in places)
                    {
                        var activityPlaceCount = new FacultyStaffActivitiesInPlaceModel();

                        activityPlaceCount.PlaceId = place.RevisionId;
                        activityPlaceCount.OfficialName = place.OfficialName;
                        activityPlaceCount.Count =
                            _queryProcessor.Execute(new ActivityCountByPlaceIdEstablishmentId(place.RevisionId,
                                                                                              establishment.RevisionId,
                                                                                              fromDateUtc, toDateUtc));

                        if (activityPlaceCount.Count > 0)
                        {
                            totalPlacesWithActivities += 1;
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
                                    _queryProcessor.Execute(new ActivityCountByTypeIdPlaceIdEstablishmentId(type.Id,
                                                                                                              place.RevisionId,
                                                                                                              establishment.RevisionId,
                                                                                                              fromDateUtc, toDateUtc));

                                typeCounts.Add(typeCount);

                                model.WorldActivityCounts.Single(a => a.TypeId == typeCount.TypeId).Count += typeCount.Count;
                            }
                        }
                        activityPlaceCount.TypeCounts = typeCounts;

                        model.PlaceActivityCounts.Add(activityPlaceCount);
                    }

                    model.TotalActivities = _queryProcessor.Execute(new ActivityCountByEstablishmentId(establishment.RevisionId,
                                                                                                       fromDateUtc, toDateUtc));
                    model.TotalPlacesWithActivities = totalPlacesWithActivities;
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

                    int totalPlacesWithPeople = 0;

                    var places = _entities.Query<Place>().Where(p => p.IsCountry || p.IsWater);
                    foreach (var place in places)
                    {
                        var peoplePlaceCount = new FacultyStaffActivitiesInPlaceModel();

                        peoplePlaceCount.PlaceId = place.RevisionId;
                        peoplePlaceCount.OfficialName = place.OfficialName;
                        peoplePlaceCount.Count =
                            _queryProcessor.Execute(new PeopleCountByPlaceIdEstablishmentId(place.RevisionId,
                                                                                              establishment.RevisionId,
                                                                                              fromDateUtc, toDateUtc));

                        if (peoplePlaceCount.Count > 0)
                        {
                            totalPlacesWithPeople += 1;
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
                                    _queryProcessor.Execute(new PeopleCountByTypeIdPlaceIdEstablishmentId(type.Id,
                                                                                                          place.RevisionId,
                                                                                                          establishment.RevisionId,
                                                                                                          fromDateUtc, toDateUtc));

                                typeCounts.Add(typeCount);

                                model.WorldPeopleCounts.Single(a => a.TypeId == typeCount.TypeId).Count += typeCount.Count;
                            }
                        }
                        peoplePlaceCount.TypeCounts = typeCounts;

                        model.PlacePeopleCounts.Add(peoplePlaceCount);
                    }

                    model.TotalPeople = _queryProcessor.Execute(new PeopleCountByEstablishmentId(establishment.RevisionId));
                    model.TotalPlacesWithPeople = totalPlacesWithPeople;
                }
            }

            return model;
        }
    }
}
