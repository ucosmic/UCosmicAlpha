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
using System.Web;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/summary")]
    public class SummaryController : ApiController
    {
         private readonly string[] _atlanticPlaceGroup = { "North Atlantic Ocean", "South Atlantic Ocean" };
        private readonly string[] _pacificPlaceGroup = { "North Pacific Ocean", "Pacific Ocean", "South Pacific Ocean" };

        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public SummaryController(IProcessQueries queryProcessor
                                      , IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }
        
        /* Returns activity type counts for given place.*/
        [GET("activity-count/{selectedEstablishment}/{establishmentId?}/{placeId?}/{selectedEstablishmentId?}")]
        [CacheHttpGet(Duration = 3600)]
        public ActivitySummaryApiModel GetActivityCount(string selectedEstablishment, int? establishmentId, int? placeId, int? selectedEstablishmentId)
        {
            ActivitySummaryApiModel returnModel = new ActivitySummaryApiModel();
            IList<ActivitySummaryTypesApiModel> typesModel = new List<ActivitySummaryTypesApiModel>();
            //IList<ActivitySummaryApiQueryResultModel> model = new List<ActivitySummaryApiQueryResultModel>();
            IList<ActivitySummaryApiQueryResultModel> model = HttpContext.Current.Session["session_activities_summary" + establishmentId + selectedEstablishment + selectedEstablishmentId] as IList<ActivitySummaryApiQueryResultModel>;
            IList<SummaryPlacesApiQueryResultModel> places = HttpContext.Current.Session["session_places_summary" + placeId] as IList<SummaryPlacesApiQueryResultModel>;
            //IList<SummaryPlacesApiQueryResultModel> places = new List<SummaryPlacesApiQueryResultModel>();
            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    EmployeeActivityTypesRepository employeeActivityTypesRepository = new EmployeeActivityTypesRepository();
                    if (model == null)
                    {
                        model = summaryRepository.ActivitySummaryByEstablishment(establishmentId, selectedEstablishmentId, selectedEstablishment);
                        HttpContext.Current.Session.Add("session_activities_summary" + establishmentId + selectedEstablishment + selectedEstablishmentId, model);
                    }

                    if (places == null && placeId != 0)
                    {
                        places = summaryRepository.SummaryByPlace(placeId);
                        SummaryPlacesApiQueryResultModel place = new SummaryPlacesApiQueryResultModel();
                        place.place_id = (int)placeId;
                        places.Add(place);
                        if (places.Count() != 0)
                        {
                            model = model.Where(t2 => places.Any(t1 => t2.place_id == t1.place_id)).ToList();
                        }
                    }
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                    var establishmentTypes = modelDistinct.DistinctBy(x => x.type);
                    var locationDistinct = model.DistinctBy(x => x.officialName);
                    var personDistinct = model.DistinctBy(x => x.person_id);
                    returnModel.TotalActivities = model.DistinctBy(x => x.id).Count();
                    returnModel.TotalLocations = locationDistinct.Count();
                    returnModel.TotalPeople = personDistinct.Count();
                    foreach (var type in establishmentTypes)
                    {
                        var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
                        var locationCount = modelDistinct.Where(x => x.type == type.type).DistinctBy(x => x.officialName).Count();
                        var personCount = modelDistinct.Where(x => x.type == type.type).DistinctBy(x => x.person_id).Count();
                        typesModel.Add(new ActivitySummaryTypesApiModel { LocationCount = locationCount, TypeCount = typeCount, Type = type.type, TypeId = type.type_id, PersonCount = personCount });
                    }
                    returnModel.ActivitySummaryTypes = typesModel.ToList();
                }
            }


            return returnModel;
        }

        /* Returns activity type counts for given place.*/
        [GET("activity-map-count/{establishmentId?}/{placeId?}")]
        [CacheHttpGet(Duration = 3600)]
        public List<ActivityMapSummaryApiModel> GetActivityMapCount(int? establishmentId, int? placeId)
        {
            IList<ActivityMapSummaryApiModel> returnModel = new List<ActivityMapSummaryApiModel>();
            IList<ActivityMapSummaryApiQueryResultModel> model = new List<ActivityMapSummaryApiQueryResultModel>();

            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    EmployeeActivityTypesRepository employeeActivityTypesRepository = new EmployeeActivityTypesRepository();
                    model = summaryRepository.ActivityMapSummaryByEstablishment_Place(establishmentId, placeId);
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                    var locations = modelDistinct.DistinctBy(x => x.countryCode);
                    foreach (var location in locations)
                    {
                        var locationCount = model.Where(x => x.officialName == location.officialName).Count();
                        returnModel.Add(new ActivityMapSummaryApiModel { LocationCount = locationCount, CountryCode = location.countryCode});
                    }
                }
            }


            return returnModel.ToList();
        }

        /* Returns degree type counts for given place.*/
        [GET("degree-count/{establishmentId?}/{placeId?}/{selectedEstablishmentId?}")]
        [CacheHttpGet(Duration = 3600)]
        public List<DegreeSummaryApiModel> GetDegreeCount(int? establishmentId, int? placeId, int? selectedEstablishmentId)
        {
            IList<DegreeSummaryApiModel> returnModel = new List<DegreeSummaryApiModel>();
            IList<DegreeSummaryApiQueryResultModel> model = new List<DegreeSummaryApiQueryResultModel>();
            IList<SummaryPlacesApiQueryResultModel> places = HttpContext.Current.Session["session_places_summary" + placeId] as IList<SummaryPlacesApiQueryResultModel>;

            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    model = summaryRepository.DegreeSummaryByEstablishment(establishmentId, selectedEstablishmentId);
                    if (places == null && placeId != 0)
                    {
                        places = summaryRepository.SummaryByPlace(placeId);
                        SummaryPlacesApiQueryResultModel place = new SummaryPlacesApiQueryResultModel();
                        place.place_id = (int)placeId;
                        places.Add(place);
                        if (places.Count() != 0)
                        {
                            model = model.Where(t2 => places.Any(t1 => t2.place_id == t1.place_id)).ToList();
                        }
                    }




                    var modelDistinct = model.DistinctBy(x => new { x.degreeId });
                    var modelDistinct2 = model.DistinctBy(x => x.degreeId);

                    var degreeCount = modelDistinct.ToList().Count();
                    var establishmentCount = model.DistinctBy(x => x.establishmentId).ToList().Count();
                    var personCount = model.DistinctBy(x => x.personId).ToList().Count();
                    var countryCount = model.Where(x => x.countryCode != null).DistinctBy(x => x.countryCode).ToList().Count();
                    returnModel.Add(new DegreeSummaryApiModel { DegreeCount = degreeCount, EstablishmentCount = establishmentCount, PersonCount = personCount, CountryCount = countryCount });
                }
            }
            return returnModel.ToList();
        }
        /* Returns degree type counts for given place.*/
        [GET("degree-map-count/{establishmentId?}/{placeId?}")]
        [CacheHttpGet(Duration = 3600)]
        public List<DegreeMapSummaryApiModel> GetDegreeMapCount(int? establishmentId, int? placeId)
        {
            IList<DegreeMapSummaryApiModel> returnModel = new List<DegreeMapSummaryApiModel>();
            IList<DegreeMapSummaryApiQueryResultModel> model = new List<DegreeMapSummaryApiQueryResultModel>();

            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    model = summaryRepository.DegreeMapSummaryByEstablishment_Place(establishmentId, placeId);
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                    var locations = modelDistinct.DistinctBy(x => x.countryCode);
                    foreach (var location in locations)
                    {
                        var locationCount = modelDistinct.Where(x => x.countryCode == location.countryCode).Count();
                        returnModel.Add(new DegreeMapSummaryApiModel { LocationCount = locationCount, CountryCode = location.countryCode });
                    }
                }
            }
            return returnModel.ToList();
        }

        /* Returns agreement type counts for given place.*/
        [GET("agreement-count/{establishmentId?}/{placeId?}/{selectedEstablishmentId?}")]
        [CacheHttpGet(Duration = 3600)]
        public AgreementSummaryApiModel GetAgreementCount(int? establishmentId, int? placeId, int? selectedEstablishmentId)
        {
            List<AgreementSummaryItemsApiModel> returnItems = new List<AgreementSummaryItemsApiModel>();
            AgreementSummaryApiModel returnModel = new AgreementSummaryApiModel();
            IList<AgreementSummaryApiQueryResultModel> model = new List<AgreementSummaryApiQueryResultModel>();
            IList<SummaryPlacesApiQueryResultModel> places = HttpContext.Current.Session["session_places_summary" + placeId] as IList<SummaryPlacesApiQueryResultModel>;
            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
                    model = summaryRepository.AgreementSummaryByEstablishment(establishmentId, selectedEstablishmentId);
                    if (places == null && placeId != 0)
                    {
                        places = summaryRepository.SummaryByPlace(placeId);
                        SummaryPlacesApiQueryResultModel place = new SummaryPlacesApiQueryResultModel();
                        place.place_id = (int)placeId;
                        places.Add(place);
                        if (places.Count() != 0)
                        {
                            model = model.Where(t2 => places.Any(t1 => t2.place_id == t1.place_id)).ToList();
                        }
                    }
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                    var locationDistinct = model.Where(x => x.officialName != null).DistinctBy(x => x.officialName);
                    returnModel.TypeCount = modelDistinct.Count();
                    returnModel.LocationCount = locationDistinct.Count();

                    var agreementTypes = modelDistinct.DistinctBy(x => x.type);
                    foreach (var type in agreementTypes)
                    {
                        var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
                        var locationCount = model.Where(x => x.officialName != null).Where(x => x.type == type.type).DistinctBy(x => x.officialName).Count();
                        returnItems.Add(new AgreementSummaryItemsApiModel { LocationCount = locationCount, TypeCount = typeCount, Type = type.type, TypeId = type.id });
                    }
                }
            }
            returnModel.items = returnItems;
            return returnModel;
        }

        [GET("agreement-map-count/{establishmentId?}/{placeId?}")]
        [CacheHttpGet(Duration = 3600)]
        public List<AgreementMapSummaryApiModel> GetAgreementMapCount(int? establishmentId, int? placeId)
        {
            IList<AgreementMapSummaryApiModel> returnModel = new List<AgreementMapSummaryApiModel>();
            IList<AgreementMapSummaryApiQueryResultModel> model = new List<AgreementMapSummaryApiQueryResultModel>();

            var tenancy = Request.Tenancy();

            if (!(establishmentId.HasValue && (establishmentId.Value != 0)))
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value)).RevisionId;
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishmentId = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain)).RevisionId;
                }
            }

            if (establishmentId != null)
            {
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    AgreementTypesRepository employeeAgreementTypesRepository = new AgreementTypesRepository();
                    model = summaryRepository.AgreementMapSummaryByEstablishment_Place(establishmentId, placeId);

                    var modelDistinct = model.DistinctBy(x => new { x.id, x.officialName });
                    var locations = modelDistinct.DistinctBy(x => x.officialName);
                    foreach (var location in locations)
                    {
                        var locationCount = model.Where(x => x.officialName == location.officialName).Count();
                        returnModel.Add(new AgreementMapSummaryApiModel { LocationCount = locationCount, CountryCode = location.countryCode });
                    }
                }
            }
            return returnModel.ToList();
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

    }
}
