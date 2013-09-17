using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
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
        private readonly string[] _atlanticPlaceGroup = { "North Atlantic Ocean", "South Atlantic Ocean" };
        private readonly string[] _pacificPlaceGroup = { "North Pacific Ocean", "Pacific Ocean", "South Pacific Ocean" };

        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        //private readonly IManageViews _viewManager;
        private readonly ActivityViewProjector _activityProjector;

        public FacultyStaffController(IProcessQueries queryProcessor
                                      ,IQueryEntities entities
                                      //,IManageViews viewManager
                                      ,ActivityViewProjector activityProjector
            )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            //_viewManager = viewManager;
            _activityProjector = activityProjector;
        }

        private int[] GetPlaceIds(int placeId)
        {
            ICollection<int> ids = new Collection<int>();

            Place place = _entities.Query<Place>().SingleOrDefault(p => p.RevisionId == placeId);
            if (place != null)
            {
                var atlanticList = _atlanticPlaceGroup.AsQueryable();
                var pacificList = _pacificPlaceGroup.AsQueryable();

                if (atlanticList.Any(p => p == place.OfficialName))
                {
                    foreach (var officialName in _atlanticPlaceGroup)
                    {
                        Place subPlace = _entities.Query<Place>().SingleOrDefault(p => p.OfficialName == officialName);
                        if (subPlace != null)
                        {
                            ids.Add(subPlace.RevisionId);
                        }
                    }
                }
                else if (pacificList.Any(p => p == place.OfficialName))
                {
                    foreach (var officialName in _pacificPlaceGroup)
                    {
                        Place subPlace = _entities.Query<Place>().SingleOrDefault(p => p.OfficialName == officialName);
                        if (subPlace != null)
                        {
                            ids.Add(subPlace.RevisionId);
                        }
                    }                    
                }
                else
                {
                    ids.Add(placeId);
                }
            }

            return ids.ToArray();
        }

        /* Returns activity type counts for given place.*/
        [GET("activity-count/{establishmentId?}/{placeId?}")]
        //[CacheHttpGet(Duration = 3600)]
        public FacultyStaffSummaryModel GetActivityCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value)); 
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);

                    var view = new ActivityPlaceActivityCountView(_queryProcessor, _entities, 
                                                                   establishment.RevisionId,
                                                                   placeIds);

                    model.PlaceId = view.PlaceIds[0];
                    model.Count = view.Count;
                    model.CountOfPlaces = 1;

                    model.PlaceCounts = null;

                    if ((view.TypeCounts != null) && (view.TypeCounts.Count > 0))
                    {
                        foreach (var type in view.TypeCounts)
                        {
                            model.TypeCounts.Add(new FacultyStaffTypeCountModel
                            {
                                TypeId = type.TypeId,
                                Type = type.Type,
                                Count = type.Count
                            });
                        }
                    }
                }
                else
                {
                    try
                    {
                        GlobalActivityCountView view =
                            _activityProjector.BeginReadActivityCountsView(establishment.RevisionId);

                        if (view != null)
                        {
                            model.Count = view.Count;
                            model.CountOfPlaces = view.CountOfPlaces;

                            foreach (var placeCount in view.PlaceCounts)
                            {
                                model.PlaceCounts.Add(new FacultyStaffPlaceCountModel
                                {
                                    PlaceId = placeCount.PlaceId,
                                    CountryCode = placeCount.CountryCode,
                                    OfficialName = placeCount.OfficialName,
                                    Count = placeCount.Count
                                });
                            }

                            foreach (var type in view.TypeCounts)
                            {
                                model.TypeCounts.Add(new FacultyStaffTypeCountModel
                                {
                                    TypeId = type.TypeId,
                                    Type = type.Type,
                                    Count = type.Count
                                });
                            }
                        }
                    }
                    finally
                    {
                        _activityProjector.EndReadActivityCountsView();
                    }
                }
            }


            return model;
        }

        /* Returns people counts for given place. */
        [GET("people-count/{establishmentId?}/{placeId?}")]
        //[CacheHttpGet(Duration = 3600)]
        public FacultyStaffSummaryModel GetPeopleCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);

                    var view = new ActivityPlacePeopleCountView(_queryProcessor, _entities,
                                                                   establishment.RevisionId,
                                                                   placeIds);

                    model.PlaceId = placeIds[0];
                    model.Count = view.Count;
                    model.CountOfPlaces = 1;

                    model.PlaceCounts = null;

                    foreach (var type in view.TypeCounts)
                    {
                        model.TypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
                else
                {
                    //var view = new ActivityGlobalPeopleCountView(_queryProcessor, _entities,
                    //                                                establishment.RevisionId);

                    //try
                    //{
                    //    ActivityGlobalPeopleCountView view =
                    //        _activityProjector.BeginReadPeopleCountsView(establishment.RevisionId);

                    try
                    {
                        GlobalPeopleCountView view =
                            _activityProjector.BeginReadPeopleCountsView(establishment.RevisionId);

                        if (view != null)
                        {
                            model.Count = view.Count;
                            model.CountOfPlaces = view.CountOfPlaces;

                            foreach (var placeCount in view.PlaceCounts)
                            {
                                model.PlaceCounts.Add(new FacultyStaffPlaceCountModel
                                {
                                    PlaceId = placeCount.PlaceId,
                                    CountryCode = placeCount.CountryCode,
                                    OfficialName = placeCount.OfficialName,
                                    Count = placeCount.Count
                                });
                            }

                            foreach (var type in view.TypeCounts)
                            {
                                model.TypeCounts.Add(new FacultyStaffTypeCountModel
                                {
                                    TypeId = type.TypeId,
                                    Type = type.Type,
                                    Count = type.Count
                                });
                            }
                        }
                    }
                    finally
                    {
                        _activityProjector.EndReadPeopleCountsView();
                    }
                }
            }

            return model;
        }

        /* Returns activity trend count for place. */
        [GET("activity-trend/{establishmentId?}/{placeId?}")]
        public FacultyStaffTrendModel GetActivityTrend(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffTrendModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);

                    var view = new ActivityPlaceTrendActivityView( _queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeIds);

                    model.PlaceId = placeId.Value;

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
                else
                {
                    var view = new ActivityGlobalTrendActivityView( _queryProcessor, 
                                                                    establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
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
        [GET("people-trend/{establishmentId?}/{placeId?}")]
        public FacultyStaffTrendModel GetPeopleTrend(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffTrendModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);

                    var view = new ActivityPlaceTrendPeopleView(_queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeIds);

                    model.PlaceId = placeId.Value;

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
                else
                {
                    var view = new ActivityGlobalTrendPeopleView( _queryProcessor,
                                                                  establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
            }

            return model;
        }

        /* Returns degree counts for given place.*/
        [GET("degree-count/{establishmentId?}/{placeId?}")]
        public FacultyStaffSummaryModel GetDegreeCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId));

                DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
                                           ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                           : new DateTime(DateTime.MinValue.Year, 1, 1);

                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);
                    model.PlaceId = placeIds[0];
                    model.Count =
                        _queryProcessor.Execute(new DegreeCountByPlaceIdsEstablishmentId(placeIds,
                                                                                         establishment.RevisionId,
                                                                                         fromDateUtc,
                                                                                         toDateUtc,
                                                                                         false /* (noUndated) included undated */));
                    model.CountOfPlaces = 1;
                    model.PlaceCounts = null;
                }
                else
                {
                    model.Count =
                        _queryProcessor.Execute(new DegreeCountByEstablishmentId(establishment.RevisionId,
                                                                                 fromDateUtc,
                                                                                 toDateUtc,
                                                                                 false /* (noUndated) included undated */));
                    model.CountOfPlaces = 1;
                    model.PlaceCounts = null;
                }
            }

            return model;
        }

        /* Returns degree people counts for given place. */
        [GET("degree-people-count/{establishmentId?}/{placeId?}")]
        public FacultyStaffSummaryModel GetDegreePeopleCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishment.RevisionId));

                DateTime toDateUtc = new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                DateTime fromDateUtc = (settings != null) && (settings.ReportsDefaultYearRange.HasValue)
                                           ? toDateUtc.AddYears(-(settings.ReportsDefaultYearRange.Value + 1))
                                           : new DateTime(DateTime.MinValue.Year, 1, 1);

                if (placeId.HasValue)
                {
                    int[] placeIds = GetPlaceIds(placeId.Value);
                    model.PlaceId = placeIds[0];
                    model.Count =
                        _queryProcessor.Execute(new PeopleWithDegreesCountByPlaceIdsEstablishmentId(placeIds,
                                                                                                    establishment.RevisionId,
                                                                                                    fromDateUtc,
                                                                                                    toDateUtc,
                                                                                                    false /* (noUndated) included undated */));
                    model.CountOfPlaces = 1;
                    model.PlaceCounts = null;
                }
                else
                {
                    model.PlaceId = null;
                    model.Count =
                        _queryProcessor.Execute(new PeopleWithDegreesCountByEstablishmentId(establishment.RevisionId,
                                                                                            fromDateUtc,
                                                                                            toDateUtc,
                                                                                            false /* (noUndated) included undated */));
                    model.CountOfPlaces = 0;
                    model.PlaceCounts = null;
                }
            }

            return model;
        }
    }
}
