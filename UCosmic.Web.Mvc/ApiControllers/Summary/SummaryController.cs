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
        //[CacheHttpGet(Duration = 3600)]
        public ActivitySummaryApiModel GetActivityCount(string selectedEstablishment, int? establishmentId, int? placeId, int? selectedEstablishmentId)
        {
            ActivitySummaryApiModel returnModel = new ActivitySummaryApiModel();
            IList<ActivitySummaryTypesApiModel> typesModel = new List<ActivitySummaryTypesApiModel>();
            IList<ActivitySummaryApiQueryResultModel> model = new List<ActivitySummaryApiQueryResultModel>();
            //IList<ActivityTypesApiReturn> establishmentTypes = new List<ActivityTypesApiReturn>();

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
                    model = summaryRepository.ActivitySummaryByEstablishment_Place(establishmentId, placeId, selectedEstablishmentId, selectedEstablishment);
                    //var modelDistinct = model.DistinctBy(x => x.id);
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                    //establishmentTypes = employeeActivityTypesRepository.EmployeeActivityTypes_By_establishmentId(establishmentId);
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
            //IList<ActivityTypesApiReturn> establishmentTypes = new List<ActivityTypesApiReturn>();

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
                    //var modelDistinct = model.DistinctBy(x => x.id);

                    var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                    //establishmentTypes = employeeActivityTypesRepository.EmployeeActivityTypes_By_establishmentId(establishmentId);
                    var locations = modelDistinct.DistinctBy(x => x.countryCode);
                    foreach (var location in locations)
                    {
                        //var locationCount = modelDistinct.Where(x => x.type == type.type).Count();
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

                    model = summaryRepository.DegreeSummaryByEstablishment_Place(establishmentId, placeId, selectedEstablishmentId);
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
                //if (placeId.HasValue)
                //{
                //    SummaryRepository summaryRepository = new SummaryRepository();

                //    model = summaryRepository.DegreeSummaryByEstablishment_Place(establishmentId, placeId);
                //    var modelDistinct = model.DistinctBy(x => new { x.degreeId });

                //    var degreeCount = modelDistinct.ToList().Count();
                //    var establishmentCount = modelDistinct.DistinctBy(x => x.establishmentId).ToList().Count();
                //    var personCount = modelDistinct.DistinctBy(x => x.personId).ToList().Count();
                //    returnModel.Add(new DegreeSummaryApiModel { DegreeCount = degreeCount, EstablishmentCount = establishmentCount, PersonCount = personCount });
                //}
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    //DegreeTypesRepository employeeDegreeTypesRepository = new DegreeTypesRepository();
                    model = summaryRepository.DegreeMapSummaryByEstablishment_Place(establishmentId, placeId);
                    //var modelDistinct = model.DistinctBy(x => x.id);

                    //var modelDistinct = model.DistinctBy(x => new { x.id });
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                    //establishmentTypes = employeeDegreeTypesRepository.EmployeeDegreeTypes_By_establishmentId(establishmentId);
                    var locations = modelDistinct.DistinctBy(x => x.countryCode);
                    foreach (var location in locations)
                    {
                        //var locationCount = modelDistinct.Where(x => x.type == type.type).Count();
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
            //IList<AgreementTypesApiReturn> agreementTypes = new List<AgreementTypesApiReturn>();
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
                    model = summaryRepository.AgreementSummaryByEstablishment_Place(establishmentId, placeId, selectedEstablishmentId);
                    var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                    var locationDistinct = model.DistinctBy(x => x.officialName);
                    returnModel.TypeCount = modelDistinct.Count();
                    returnModel.LocationCount = locationDistinct.Count();

                    //agreementTypes = AgreementTypesRepository.AgreementTypes_By_establishmentId(establishmentId);
                    var agreementTypes = modelDistinct.DistinctBy(x => x.type);
                    foreach (var type in agreementTypes)
                    {
                        var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
                        //var locationCount = locationDistinct.Where(x => x.type == type.type).Count();
                        var locationCount = modelDistinct.Where(x => x.type == type.type).DistinctBy(x => x.officialName).Count();
                        returnItems.Add(new AgreementSummaryItemsApiModel { LocationCount = locationCount, TypeCount = typeCount, Type = type.type, TypeId = type.id });
                    }
                }
            }
            returnModel.items = returnItems;
            return returnModel;
        }

        /* Returns agreement type counts for given place.*/
        [GET("agreement-map-count/{establishmentId?}/{placeId?}")]
        [CacheHttpGet(Duration = 3600)]
        public List<AgreementMapSummaryApiModel> GetAgreementMapCount(int? establishmentId, int? placeId)
        {
            IList<AgreementMapSummaryApiModel> returnModel = new List<AgreementMapSummaryApiModel>();
            IList<AgreementMapSummaryApiQueryResultModel> model = new List<AgreementMapSummaryApiQueryResultModel>();
            //IList<AgreementMapTypesApiReturn> agreementTypes = new List<AgreementMapTypesApiReturn>();

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
                //if (placeId.HasValue)
                //{
                //    SummaryRepository summaryRepository = new SummaryRepository();
                //    AgreementMapTypesRepository AgreementMapTypesRepository = new AgreementMapTypesRepository();
                //    model = summaryRepository.AgreementMapSummaryByEstablishment_Place(establishmentId, placeId, selectedEstablishmentId);
                //    var modelDistinct = model.DistinctBy(x => new { x.id, x.type });
                //    //agreementTypes = AgreementMapTypesRepository.AgreementMapTypes_By_establishmentId(establishmentId);
                //    var agreementTypes = modelDistinct.DistinctBy(x => x.type);
                //    foreach (var type in agreementTypes)
                //    {
                //        var typeCount = modelDistinct.Where(x => x.type == type.type).Count();
                //        var locationCount = model.Where(x => x.type == type.type).Count();
                //        returnModel.Add(new AgreementMapSummaryApiModel { LocationCount = locationCount, CountryCode = location.countryCode, officialName = location.officialName });
                //    }
                //}
                if (placeId.HasValue)
                {
                    SummaryRepository summaryRepository = new SummaryRepository();
                    AgreementTypesRepository employeeAgreementTypesRepository = new AgreementTypesRepository();
                    model = summaryRepository.AgreementMapSummaryByEstablishment_Place(establishmentId, placeId);
                    //var modelDistinct = model.DistinctBy(x => x.id);

                    var modelDistinct = model.DistinctBy(x => new { x.id, x.officialName });
                    //establishmentTypes = employeeAgreementTypesRepository.EmployeeAgreementTypes_By_establishmentId(establishmentId);
                    var locations = modelDistinct.DistinctBy(x => x.officialName);
                    foreach (var location in locations)
                    {
                        //var locationCount = modelDistinct.Where(x => x.type == type.type).Count();
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
