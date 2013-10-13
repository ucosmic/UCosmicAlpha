using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
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

                        model.TypeCounts = model.TypeCounts.OrderBy(t => t.Rank).ToList();
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
                                    Count = placeCount.Count,
                                    Lat = placeCount.Lat,
                                    Lng = placeCount.Lng
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

                            model.TypeCounts = model.TypeCounts.OrderBy(t => t.Rank).ToList();
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

                    model.TypeCounts = model.TypeCounts.OrderBy(t => t.Rank).ToList();
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
                                    Count = placeCount.Count,
                                    Lat = placeCount.Lat,
                                    Lng = placeCount.Lng
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

                            model.TypeCounts = model.TypeCounts.OrderBy(t => t.Rank).ToList();
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

        /* Advanced Search */

        [POST("search")]
        public FacultyStaffSearchResults PostSearch(FacultyStaffFilterModel filter)
        {
            var results = new FacultyStaffSearchResults();
            DateTime? fromDate = null;
            DateTime? toDate = null;


            if (!String.IsNullOrEmpty(filter.FromDate))
            {
                DateTime date;
                if (DateTime.TryParseExact(filter.FromDate, "yyyy", CultureInfo.CurrentCulture,
                                           DateTimeStyles.AllowWhiteSpaces, out date))
                {
                    fromDate = date;
                }
                else if (DateTime.TryParse(filter.FromDate, out date))
                {
                    fromDate = date;
                }
            }

            if (!String.IsNullOrEmpty(filter.ToDate))
            {
                DateTime date;
                if (DateTime.TryParseExact(filter.ToDate, "yyyy", CultureInfo.CurrentCulture,
                                           DateTimeStyles.AllowWhiteSpaces, out date))
                {
                    toDate = date;

                    if (!String.IsNullOrEmpty(filter.FromDate)
                        && (filter.FromDate.Length == 4)
                        && (filter.FromDate == filter.ToDate))
                    {
                        toDate = toDate.Value.AddYears(1);
                    }
                }
                else if (DateTime.TryParse(filter.FromDate, out date))
                {
                    toDate = date;
                }
            }

            if (filter.FilterType == "activities")
            {
                var activities = _queryProcessor.Execute(new ActivitySearch(filter.EstablishmentId)
                {
                    EstablishmentId = filter.EstablishmentId,
                    PlaceIds = filter.LocationIds,
                    ActivityTypes = filter.ActivityTypes,
                    Tags = filter.Tags,
                    FromDate = fromDate,
                    ToDate = toDate,
                    NoUndated = filter.NoUndated,
                    CampusId = filter.CampusId,
                    CollegeId = filter.CollegeId,
                    DepartmentId = filter.DepartmentId
                });

                AddActivitiesToResults(filter, activities, ref results);

                foreach (var placeResult in results.PlaceResults)
                {
                    placeResult.Results = placeResult.Results.OrderByDescending(r => r.SortDate)
                                                        .ThenBy(r => r.PersonName)
                                                        .ThenBy(r => r.ActivityTitle)
                                                        .ToList();
                }

                results.PlaceResults = results.PlaceResults.OrderBy(r => r.OfficialName).ToList();
            }
            else if (filter.FilterType == "people")
            {
                var peopleSearchResult = _queryProcessor.Execute(new PeopleSearch(filter.EstablishmentId)
                {
                    EstablishmentId = filter.EstablishmentId,
                    PlaceIds = filter.LocationIds,
                    ActivityTypes = filter.ActivityTypes,
                    Tags = filter.Tags,
                    IncludeDegrees = filter.IncludeDegrees,
                    FromDate = fromDate,
                    ToDate = toDate,
                    NoUndated = filter.NoUndated,
                    CampusId = filter.CampusId,
                    CollegeId = filter.CollegeId,
                    DepartmentId = filter.DepartmentId
                });

                /* Add people found by Activities */
                AddActivitiesToResults(filter, peopleSearchResult.Activities, ref results);

                /* Compute PeopleCounts for places */
                if (results.PlaceResults != null)
                {
                    foreach (var placeResult in results.PlaceResults)
                    {
                        var groupedResults = placeResult.Results.GroupBy(r => r.PersonId);
                        placeResult.PeopleCount = groupedResults.Count();
                    }
                }

                /* Add people found by Geographic Expertise criteria */
                if (peopleSearchResult.GeographicExpertise != null)
                {
                    foreach (var geographicExpertise in peopleSearchResult.GeographicExpertise)
                    {
                        foreach (var location in geographicExpertise.Locations)
                        {
                            if ((filter.LocationIds == null)
                                || (filter.LocationIds.Length == 0)
                                || filter.LocationIds.Contains(location.PlaceId))
                            {
                                var placeResult =
                                    results.PlaceResults.SingleOrDefault(cr => cr.PlaceId == location.PlaceId);
                                if (placeResult == null)
                                {
                                    placeResult = new FacultyStaffPlaceResult
                                    {
                                        PlaceId = location.PlaceId,
                                        OfficialName = location.Place.OfficialName,
                                        Lat =
                                            location.Place.Center.Latitude.HasValue
                                                ? location.Place.Center.Latitude.Value
                                                : 0,
                                        Lng =
                                            location.Place.Center.Longitude.HasValue
                                                ? location.Place.Center.Longitude.Value
                                                : 0
                                    };

                                    results.PlaceResults.Add(placeResult);
                                }

                                var result = new FacultyStaffResult
                                {
                                    PersonId = geographicExpertise.PersonId,
                                    PersonName =
                                        String.Format("{0}, {1}", geographicExpertise.Person.LastName,
                                                      geographicExpertise.Person.FirstName),
                                    PersonEmail =
                                        (geographicExpertise.Person.DefaultEmail != null)
                                            ? geographicExpertise.Person.DefaultEmail.Value
                                            : "",
                                    PersonDepartment = geographicExpertise.Person.GetDepartment(),
                                    ActivityId = null,
                                    ActivityTitle = "Geographic Expertise",
                                    ActivityTypeIds = null,
                                    ActivityDate = null,
                                    ActivityDescription = null,
                                    SortDate = DateTime.MaxValue // local use only
                                };

                                placeResult.Results.Add(result);
                            }
                        }
                    }
                }

                /* Add people found by Language Expertise criteria */
                if (peopleSearchResult.LanguageExpertise != null)
                {
                    foreach (var languageExpertise in peopleSearchResult.LanguageExpertise)
                    {
                        var global = _entities.Query<Place>().SingleOrDefault(p => p.IsEarth);
                        if (global == null)
                        {
                            throw new Exception("Can't find earth");
                        }

                        var placeResult = new FacultyStaffPlaceResult
                        {
                            PlaceId = global.RevisionId,
                            OfficialName = global.OfficialName,
                            Lat =
                                global.Center.Latitude.HasValue
                                    ? global.Center.Latitude.Value
                                    : 0,
                            Lng =
                                global.Center.Longitude.HasValue
                                    ? global.Center.Longitude.Value
                                    : 0
                        };

                        var result = new FacultyStaffResult
                        {
                            PersonId = languageExpertise.PersonId,
                            PersonName =
                                String.Format("{0}, {1}", languageExpertise.Person.LastName,
                                              languageExpertise.Person.FirstName),
                            PersonEmail =
                                (languageExpertise.Person.DefaultEmail != null)
                                    ? languageExpertise.Person.DefaultEmail.Value
                                    : "",
                            PersonDepartment = languageExpertise.Person.GetDepartment(),
                            ActivityId = null,
                            ActivityTitle =
                                String.Format("Language Expertise: {0}", languageExpertise.Language.NativeName.Text),
                            ActivityTypeIds = null,
                            ActivityDate = null,
                            ActivityDescription = null,
                            SortDate = DateTime.MaxValue // local use only
                        };

                        placeResult.Results.Add(result);

                        results.PlaceResults.Add(placeResult);
                    }
                }

                /* Add people found by Degree criteria */
                if (peopleSearchResult.Degrees != null)
                {
                    foreach (var degree in peopleSearchResult.Degrees)
                    {
                        FacultyStaffPlaceResult placeResult;

                        if (degree.Institution != null)
                        {
                            var country = degree.Institution.Location.Places.FirstOrDefault(x => x.IsCountry);
                            if (country == null)
                            {
                                throw new Exception("Can't find location for establishment " +
                                                    degree.Institution.OfficialName);
                            }

                            placeResult = new FacultyStaffPlaceResult
                            {
                                PlaceId = country.RevisionId,
                                OfficialName = country.OfficialName,
                                Lat =
                                    country.Center.Latitude.HasValue
                                        ? country.Center.Latitude.Value
                                        : 0,
                                Lng =
                                    country.Center.Longitude.HasValue
                                        ? country.Center.Longitude.Value
                                        : 0
                            };
                        }
                        else
                        {
                            var global = _entities.Query<Place>().SingleOrDefault(p => p.IsEarth);
                            placeResult = new FacultyStaffPlaceResult
                            {
                                PlaceId = global.RevisionId,
                                OfficialName = global.OfficialName,
                                Lat = global.Center.Latitude.Value,
                                Lng = global.Center.Longitude.Value
                            };                            
                        }

                        var result = new FacultyStaffResult
                        {
                            PersonId = degree.PersonId,
                            PersonName = String.Format("{0}, {1}", degree.Person.LastName, degree.Person.FirstName),
                            PersonEmail = (degree.Person.DefaultEmail != null) ? degree.Person.DefaultEmail.Value : "",
                            PersonDepartment = degree.Person.GetDepartment(),
                            ActivityId = null,
                            ActivityTitle =
                                String.Format("Degree: {0}, {1}", degree.Title,
                                    (degree.Institution != null) ? degree.Institution.OfficialName : ""),
                            ActivityTypeIds = null,
                            ActivityDate = null,
                            ActivityDescription = null,
                            SortDate = DateTime.MaxValue // local use only
                        };

                        placeResult.Results.Add(result);

                        results.PlaceResults.Add(placeResult);
                    }
                }

                /* Add people found by Display Name */
                if (peopleSearchResult.Names != null)
                {
                    foreach (var person in peopleSearchResult.Names)
                    {
                        var global = _entities.Query<Place>().SingleOrDefault(p => p.IsEarth);
                        if (global == null)
                        {
                            throw new Exception("Can't find earth");
                        }

                        var placeResult = new FacultyStaffPlaceResult
                        {
                            PlaceId = global.RevisionId,
                            OfficialName = global.OfficialName,
                            Lat =
                                global.Center.Latitude.HasValue
                                    ? global.Center.Latitude.Value
                                    : 0,
                            Lng =
                                global.Center.Longitude.HasValue
                                    ? global.Center.Longitude.Value
                                    : 0
                        };

                        var result = new FacultyStaffResult
                        {
                            PersonId = person.RevisionId,
                            PersonName = String.Format("{0}, {1}", person.LastName, person.FirstName),
                            PersonEmail = (person.DefaultEmail != null) ? person.DefaultEmail.Value : "",
                            PersonDepartment = person.GetDepartment(),
                            ActivityId = null,
                            ActivityTitle = null,
                            ActivityTypeIds = null,
                            ActivityDate = null,
                            ActivityDescription = null,
                            SortDate = DateTime.MaxValue // local use only
                        };

                        placeResult.Results.Add(result);

                        results.PlaceResults.Add(placeResult);
                    }
                }

                foreach (var placeResult in results.PlaceResults)
                {
                    placeResult.Results = placeResult.Results.OrderBy(r => r.PersonName)
                                                        .ThenBy(r => r.ActivityTitle)
                                                        .ToList();
                }

                results.PlaceResults = results.PlaceResults.OrderBy(r => r.OfficialName).ToList();
            }
            else
            {
                throw new HttpResponseException(HttpStatusCode.NotImplemented);
            }

            return results;
        }

        private void AddActivitiesToResults(FacultyStaffFilterModel filter,
                                            IEnumerable<Activity> activities,
                                            ref FacultyStaffSearchResults results)
        {
            /* Flatten activity search results with respect to location. */
            foreach (var activity in activities)
            {
                var activityValues =
                    activity.Values.Single(v => (v.ModeText == ActivityMode.Public.AsSentenceFragment()));

                foreach (var location in activityValues.Locations)
                {
                    if ((filter.LocationIds == null)
                        || (filter.LocationIds.Length == 0)
                        || filter.LocationIds.Contains(location.PlaceId))
                    {
                        var placeResult = results.PlaceResults.SingleOrDefault(cr => cr.PlaceId == location.PlaceId);
                        if (placeResult == null)
                        {
                            placeResult = new FacultyStaffPlaceResult
                            {
                                PlaceId = location.PlaceId,
                                OfficialName = location.Place.OfficialName,
                                Lat =
                                    location.Place.Center.Latitude.HasValue
                                        ? location.Place.Center.Latitude.Value
                                        : 0,
                                Lng =
                                    location.Place.Center.Longitude.HasValue
                                        ? location.Place.Center.Longitude.Value
                                        : 0
                            };

                            results.PlaceResults.Add(placeResult);
                        }

                        var result = new FacultyStaffResult
                        {
                            PersonId = activity.PersonId,
                            PersonName =
                                String.Format("{0}, {1}", activity.Person.LastName, activity.Person.FirstName),
                            PersonEmail = (activity.Person.DefaultEmail != null) ? activity.Person.DefaultEmail.Value : "",
                            PersonDepartment = activity.Person.GetDepartment(),
                            ActivityId = activity.RevisionId,
                            ActivityTitle = activityValues.Title,
                            ActivityTypeIds = MakeActivityTypeIds(activityValues.Types),
                            ActivityDate =
                                MakeDateString(activityValues.StartsOn, activityValues.EndsOn,
                                               activityValues.OnGoing),
                            ActivityDescription =
                                (activityValues.Content == null)
                                    ? null
                                    : Regex.Replace(activityValues.Content, @"<[^>]*>|&nbsp;", string.Empty),
                            SortDate =
                                GetSortDate(activityValues.StartsOn, activityValues.EndsOn, activityValues.OnGoing)
                            // local use only
                        };

                        placeResult.Results.Add(result);
                    }
                }
            }
        }

        private static int[] MakeActivityTypeIds(IEnumerable<ActivityType> activityTypes)
        {
            ICollection<int> ids = new Collection<int>();

            foreach (var activityType in activityTypes)
            {
                ids.Add(activityType.TypeId);
            }

            return ids.ToArray();
        }

        private static string MakeDateString(DateTime? startsOn, DateTime? endsOn, bool? onGoing)
        {
            string formattedDateRange = "";

            if (!startsOn.HasValue)
            {
                if (endsOn.HasValue)
                {
                    formattedDateRange = endsOn.Value.Year.ToString();
                }
                else if (onGoing.HasValue)
                {
                    formattedDateRange = "(Ongoing)";
                }
            }
            else
            {
                formattedDateRange = startsOn.Value.Year.ToString();
                if (onGoing.HasValue)
                {
                    formattedDateRange += "-Present";
                }
                else if (endsOn.HasValue)
                {
                    formattedDateRange += "-" + endsOn.Value.Year.ToString();
                }
            }

            return formattedDateRange;
        }

        private static DateTime GetSortDate(DateTime? startsOn, DateTime? endsOn, bool? onGoing)
        {
            DateTime sortDate = DateTime.MaxValue;

            if (startsOn.HasValue)
            {
                sortDate = startsOn.Value;
            }
            else if (endsOn.HasValue)
            {
                sortDate = endsOn.Value;
            }

            return sortDate;
        }
    }
}
