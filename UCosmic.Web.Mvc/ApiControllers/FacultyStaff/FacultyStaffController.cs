using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using MoreLinq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;
using UCosmic.Repositories;
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

        public FacultyStaffController(IProcessQueries queryProcessor
                                      , IQueryEntities entities
            //,IManageViews viewManager
                                      //, ActivityViewProjector activityProjector
            )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("tenants-with-activities")]
        public HttpResponseMessage GetTenantsWithActivities()
        {
            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var activities = _entities.Query<Activity>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault))
                .Where(x => x.ModeText == publishedText && x.Original == null)
                .Select(x => x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment)
                .Distinct()
            ;
            var degrees = _entities.Query<Degree>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault))
                .Select(x => x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment)
                .Distinct()
            ;
            var queryable = activities.Union(degrees).ToArray();
            var models = queryable.Select(x => new
            {
                Id = x.RevisionId,
                x.OfficialName,
                OfficialUrl = x.WebsiteUrl,
                StyleDomain = x.WebsiteUrl.StartsWith("www.", StringComparison.OrdinalIgnoreCase)
                    ? x.WebsiteUrl.Substring(4) : x.WebsiteUrl,
            });
            var model = new
            {
                Items = models,
            };

            var response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
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

        ///* Returns activity type counts for given place.*/
        //[GET("activity-count/{establishmentId?}/{placeId?}")]
        ////[CacheHttpGet(Duration = 3600)]
        //public List<ActivitySummaryApiModel> GetActivityCount(int? establishmentId, int? placeId)
        //{
        //    IList<ActivitySummaryApiModel> returnModel = new List<ActivitySummaryApiModel>();
        //    IList<ActivitySummaryApiQueryResultModel> model = new List<ActivitySummaryApiQueryResultModel>();
        //    //IList<ActivityTypesApiReturn> establishmentTypes = new List<ActivityTypesApiReturn>();

        //    var tenancy = Request.Tenancy();

        //    if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
        //    {
        //        if (tenancy.TenantId.HasValue)
        //        {
        //            establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
        //        }
        //        else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
        //        {
        //            establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
        //        }
        //    }

        //    if (establishmentId != null)
        //    {
        //        if (placeId.HasValue)
        //        {
        //            SummaryRepository summaryRepository = new SummaryRepository();
        //            EmployeeActivityTypesRepository employeeActivityTypesRepository = new EmployeeActivityTypesRepository();
        //            model = summaryRepository.ActivitySummaryByEstablishment_Place(establishmentId, placeId);
        //            //var modelDistinct = model.DistinctBy(x => x.id);
        //            var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
        //            //establishmentTypes = employeeActivityTypesRepository.EmployeeActivityTypes_By_establishmentId(establishmentId);
        //            var establishmentTypes = modelDistinct.DistinctBy(x => x.type);
        //            foreach (var type in establishmentTypes)
        //            {
        //                var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
        //                var locationCount = model.Where(x => x.type == type.type).Count();
        //                returnModel.Add(new ActivitySummaryApiModel{LocationCount = locationCount, TypeCount = typeCount, Type = type.type, TypeId = type.id});
        //            }
        //        }
        //    }


        //    return returnModel.ToList();
        //}

        /* Returns people counts for given place. */
        [GET("people-count/{establishmentId?}/{placeId?}")]
        [CacheHttpGet(Duration = 3600)]
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
                    model.CountOfPlaces = 1;
                    model.PlaceCounts = null;
                }
                else
                {
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
                    model.CountOfPlaces = 1;
                    model.PlaceCounts = null;
                }
                else
                {
                    model.PlaceId = null;
                    model.CountOfPlaces = 0;
                    model.PlaceCounts = null;
                }
            }

            return model;
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
                            //PersonDepartment = activity.Person.GetDepartment(),
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
