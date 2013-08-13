using System;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
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

        //[GET("summary")]
        //public FacultyStaffSummaryModel Get()
        //{
        //    var model = new FacultyStaffSummaryModel();

        //    var tenancy = Request.Tenancy();
        //    Establishment establishment = null;

        //    if (tenancy.TenantId.HasValue)
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
        //    }
        //    else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
        //    }

        //    if (establishment != null)
        //    {
        //        var settings =
        //            _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId));
        //        DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
        //        DateTime fromDateUtc = settings.ReportsDefaultYearRange.HasValue
        //                                   ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
        //                                   : new DateTime(DateTime.MinValue.Year, 1, 1);

        //        /* ----- Activity Counts ----- */
        //        {
        //            if ((settings != null) && (settings.ActivityTypes.Any()))
        //            {
        //                foreach (var type in settings.ActivityTypes)
        //                {
        //                    var typeCount = new FacultyStaffCountModel
        //                    {
        //                        TypeId = type.Id,
        //                        Type = type.Type,
        //                        Count = 0
        //                    };

        //                    model.WorldActivityCounts.Add(typeCount);
        //                }
        //            }

        //            int totalPlacesWithActivities = 0;

        //            var places = _entities.Query<Place>().Where(p => p.IsCountry || p.IsWater || p.IsRegion);
        //            foreach (var place in places)
        //            {
        //                var activityPlaceCount = new FacultyStaffPlaceCountModel();

        //                activityPlaceCount.PlaceId = place.RevisionId;
        //                activityPlaceCount.OfficialName = place.OfficialName;
        //                activityPlaceCount.Count =
        //                    _queryProcessor.Execute(new ActivityCountByPlaceIdEstablishmentId(place.RevisionId,
        //                                                                                      establishment.RevisionId,
        //                                                                                      fromDateUtc, toDateUtc));

        //                if (activityPlaceCount.Count > 0)
        //                {
        //                    totalPlacesWithActivities += 1;
        //                }

        //                var typeCounts = new Collection<FacultyStaffCountModel>();
        //                if ((settings != null) && (settings.ActivityTypes.Any()))
        //                {
        //                    foreach (var type in settings.ActivityTypes)
        //                    {
        //                        var typeCount = new FacultyStaffCountModel();

        //                        typeCount.TypeId = type.Id;
        //                        typeCount.Type = type.Type;
        //                        typeCount.Count =
        //                            _queryProcessor.Execute(new ActivityCountByTypeIdPlaceIdEstablishmentId(type.Id,
        //                                                                                                    place
        //                                                                                                        .RevisionId,
        //                                                                                                    establishment
        //                                                                                                        .RevisionId,
        //                                                                                                    fromDateUtc,
        //                                                                                                    toDateUtc));

        //                        typeCounts.Add(typeCount);

        //                        model.WorldActivityCounts.Single(a => a.TypeId == typeCount.TypeId).Count +=
        //                            typeCount.Count;
        //                    }
        //                }
        //                activityPlaceCount.TypeCounts = typeCounts;

        //                model.PlaceActivityCounts.Add(activityPlaceCount);
        //            }

        //            model.TotalActivities =
        //                _queryProcessor.Execute(new ActivityCountByEstablishmentId(establishment.RevisionId,
        //                                                                           fromDateUtc, toDateUtc));
        //            model.TotalPlacesWithActivities = totalPlacesWithActivities;
        //        }

        //        /* ----- People Counts ----- */
        //        {
        //            if ((settings != null) && (settings.ActivityTypes.Any()))
        //            {
        //                foreach (var type in settings.ActivityTypes)
        //                {
        //                    var typeCount = new FacultyStaffCountModel
        //                    {
        //                        TypeId = type.Id,
        //                        Type = type.Type,
        //                        Count = 0
        //                    };

        //                    model.WorldPeopleCounts.Add(typeCount);
        //                }
        //            }

        //            int totalPlacesWithPeople = 0;

        //            var places = _entities.Query<Place>().Where(p => p.IsCountry || p.IsWater);
        //            foreach (var place in places)
        //            {
        //                var peoplePlaceCount = new FacultyStaffPlaceCountModel();

        //                peoplePlaceCount.PlaceId = place.RevisionId;
        //                peoplePlaceCount.OfficialName = place.OfficialName;
        //                peoplePlaceCount.Count =
        //                    _queryProcessor.Execute(new PeopleCountByPlaceIdEstablishmentId(place.RevisionId,
        //                                                                                    establishment.RevisionId,
        //                                                                                    fromDateUtc, toDateUtc));

        //                if (peoplePlaceCount.Count > 0)
        //                {
        //                    totalPlacesWithPeople += 1;
        //                }

        //                var typeCounts = new Collection<FacultyStaffCountModel>();
        //                if ((settings != null) && (settings.ActivityTypes.Any()))
        //                {
        //                    foreach (var type in settings.ActivityTypes)
        //                    {
        //                        var typeCount = new FacultyStaffCountModel();

        //                        typeCount.TypeId = type.Id;
        //                        typeCount.Type = type.Type;
        //                        typeCount.Count =
        //                            _queryProcessor.Execute(new PeopleCountByTypeIdPlaceIdEstablishmentId(type.Id,
        //                                                                                                  place
        //                                                                                                      .RevisionId,
        //                                                                                                  establishment
        //                                                                                                      .RevisionId,
        //                                                                                                  fromDateUtc,
        //                                                                                                  toDateUtc));

        //                        typeCounts.Add(typeCount);

        //                        model.WorldPeopleCounts.Single(a => a.TypeId == typeCount.TypeId).Count +=
        //                            typeCount.Count;
        //                    }
        //                }
        //                peoplePlaceCount.TypeCounts = typeCounts;

        //                model.PlacePeopleCounts.Add(peoplePlaceCount);
        //            }

        //            model.TotalPeople =
        //                _queryProcessor.Execute(new PeopleCountByEstablishmentId(establishment.RevisionId));
        //            model.TotalPlacesWithPeople = totalPlacesWithPeople;
        //        }


        //        /* ----- Activity Trend ----- */
        //        {
        //            //var places = _entities.Query<Place>().Where(p => p.IsCountry || p.IsWater);
        //            //foreach (var place in places)
        //            //{
        //            //    var placeActivitiesCount = _queryProcessor.Execute(
        //            //        new ActivityCountPerYearByPlaceIdEstablishmentId(place.RevisionId,
        //            //                                                         establishment.RevisionId,
        //            //                                                         fromDateUtc, toDateUtc));
        //            //}
        //        }
        //    }

        //    return model;
        //}

        /* Returns activity type counts for given place.*/
        [GET("activity-count/{placeId?}")]
        public FacultyStaffSummaryModel GetActivityCount(int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

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
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceActivityCountView(_queryProcessor, _entities, 
                                                                   establishment.RevisionId,
                                                                   placeId.Value);

                    model.GlobalCount = view.Count;

                }
                else
                {
                    var view = new ActivityGlobalActivityCountView(_queryProcessor, _entities,
                                                                    establishment.RevisionId);

                    model.GlobalCount = view.Count;
                    model.PlaceCount = view.PlaceCount;
                    foreach (var type in view.TypeCounts)
                    {
                        model.GlobalTypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
            }


            return model;
        }

        /* Returns people counts for given place. */
        [GET("people-count/{placeId?}")]
        public FacultyStaffSummaryModel GetPeopleCount(int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

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
                if (placeId.HasValue)
                {
                    var view = new ActivityPlacePeopleCountView(_queryProcessor, _entities,
                                                                   establishment.RevisionId,
                                                                   placeId.Value);

                    model.GlobalCount = view.Count;

                }
                else
                {
                    var view = new ActivityGlobalPeopleCountView(_queryProcessor, _entities,
                                                                    establishment.RevisionId);

                    model.GlobalCount = view.Count;
                    foreach (var type in view.TypeCounts)
                    {
                        model.GlobalTypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
            }


            return model;
        }

        /* Returns activity trend count for place. */
        [GET("activity-trend/{placeId?}")]
        public FacultyStaffTrendModel GetActivityTrend(int? placeId)
        {
            var model = new FacultyStaffTrendModel();

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
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceTrendActivityView( _queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeId.Value);

                    var placeTrendActivityCount = new FacultyStaffPlaceTrendModel
                    {
                        PlaceId = placeId.Value,
                        OfficialName = view.OfficialName
                    };

                    foreach (var data in view.Data)
                    {
                        placeTrendActivityCount.Data.Add(new FacultyStaffTrendDataModel
                        {
                           Year = data.Year,
                           Count = data.Count
                        });
                    }
                    model.PlaceTrendActivityCounts.Add(placeTrendActivityCount);

                }
                else
                {
                    var view = new ActivityGlobalTrendActivityView( _queryProcessor, 
                                                                    establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.GlobalData.Add(new FacultyStaffTrendDataModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
            }

            return model;
        }

        /* Returns people trend count for place. */
        [GET("people-trend/{placeId?}")]
        public FacultyStaffTrendModel GetPeopleTrend(int? placeId)
        {
            var model = new FacultyStaffTrendModel();

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
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceTrendPeopleView(_queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeId.Value);

                    var placeTrendActivityCount = new FacultyStaffPlaceTrendModel
                    {
                        PlaceId = placeId.Value,
                        OfficialName = view.OfficialName
                    };

                    foreach (var data in view.Data)
                    {
                        placeTrendActivityCount.Data.Add(new FacultyStaffTrendDataModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                    model.PlaceTrendActivityCounts.Add(placeTrendActivityCount);

                }
                else
                {
                    var view = new ActivityGlobalTrendPeopleView( _queryProcessor,
                                                                  establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.GlobalData.Add(new FacultyStaffTrendDataModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
            }

            return model;
        }
    }
}
