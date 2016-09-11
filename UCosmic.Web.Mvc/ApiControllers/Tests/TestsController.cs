using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using MoreLinq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Web.Mvc.Models;
using UCosmic.Repositories;
using UCosmic.Domain.Establishments;
using System.Threading.Tasks;

namespace UCosmic.Web.Mvc.ApiControllers
{

        
    //[System.Web.Http.Authorize]
    [RoutePrefix("api/tests")]
    public class TestsApiController : ApiController
    {
    
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public TestsApiController(IProcessQueries queryProcessor
                                      , IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        /* Returns activity type counts for given place.*/
        [GET("Get_idb_test_by_limit/{establishmentId?}/{offset}/{limit}")]
        //[CacheHttpGet(Duration = 3600)]
        public async Task<List<Tests_idb_QueryResultModel>> Get_idb_test_by_limit(int? establishmentId, int offset, int limit)
        {
            IList<Tests_idb_QueryResultModel> returnModel = new List<Tests_idb_QueryResultModel>();
            //IList<Tests_idb_return_model> returnModel = new List<Tests_idb_return_model>();
            IList<Tests_idb_QueryResultModel> concatModel = new List<Tests_idb_QueryResultModel>();
            //IList<Tests_idb_return_model> dups = new List<Tests_idb_return_model>();
            //IList<Tests_idb_return_model> non_dups = new List<Tests_idb_return_model>();
            //IList<Tests_idb_QueryResultModel> to_remove_model = new List<Tests_idb_QueryResultModel>();
            //IList<Tests_idb_QueryResultModel> model = new List<Tests_idb_QueryResultModel>();
            //IList<ActivityMapTestsApiQueryResultModel> model = new List<ActivityMapTestsApiQueryResultModel>();

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
               
                    TestsRepository TestsRepository = new TestsRepository();
                    //EmployeeActivityTypesRepository employeeActivityTypesRepository = new EmployeeActivityTypesRepository();
                //int count = 1;

                //while (count > 0)
                //{
                    returnModel = await TestsRepository.test_idb_ByEstablishment_limit(establishmentId, offset, limit);
                    //if (model.Count() > 0)
                    //{
                    //    concatModel = concatModel.Concat(model).ToList();
                    //    count += 1;
                    //}
                    //else
                    //{
                    //    count = 0;
                    //}
                //}

                //int last_id = 0;
                //var dups;
                //dups.Each(y => {
                //    concatModel.Remove(y);
                //});
                //List<int> place_ids = new List<int>();
                //List<int> type_ids = new List<int>();
                //Tests_idb_return_model returnItem = new Tests_idb_return_model();
                //dups = concatModel.GroupBy(x => x.id)
                //  .Where(g => g.Count() > 1)
                //  .Select(z =>
                //  {
                //    place_ids = new List<int>();
                //    type_ids = new List<int>();

                //    z.Each(y =>
                //    {
                //        List<int> place_id = new List<int>();
                //        place_id.Add(y.place_id);
                //        List<int> type_id = new List<int>();
                //        type_id.Add(y.typeId);

                //        place_ids = place_ids.Union(place_id).ToList();
                //        type_ids = type_ids.Union(type_id).ToList();


                //        returnItem.id = y.id;
                //        returnItem.personId = y.personId;
                //        returnItem.place_ids = place_ids.ToArray();
                //        returnItem.firstName = y.firstName;
                //        returnItem.lastName = y.lastName;
                //        returnItem.displayName = y.displayName;
                //        returnItem.typeIds = type_ids.ToArray();
                //        returnItem.StartsOn = y.StartsOn;
                //        returnItem.EndsOn = y.EndsOn;
                //        returnItem.StartsOnCalc = y.StartsOnCalc;
                //        returnItem.EndsOnCalc = y.EndsOnCalc;
                //        returnItem.StartsOnFormat = y.StartsOnFormat;
                //        returnItem.EndsOnFormat = y.EndsOnFormat;
                //        returnItem.title = y.title;
                //        returnItem.onGoing = y.onGoing;
                //        returnItem.id_name = y.id_name;
                //        returnItem.tag_text = y.tag_text;
                //        returnItem.contentsearchable = y.contentsearchable;


                //    });
                //    return returnItem;
                //  })
                //  .ToList();
                //non_dups = concatModel.GroupBy(x => x.id)
                //  .Where(g => g.Count() == 1)
                //  .Select(z =>
                //  {
                //      place_ids = new List<int>();
                //      type_ids = new List<int>();
                //      z.Each(y =>
                //      {

                //          place_ids.Add(y.place_id);
                //          type_ids.Add(y.typeId);
                //          returnItem.id = y.id;
                //          returnItem.personId = y.personId;
                //          returnItem.place_ids = place_ids.ToArray();
                //          returnItem.firstName = y.firstName;
                //          returnItem.lastName = y.lastName;
                //          returnItem.displayName = y.displayName;
                //          returnItem.typeIds = type_ids.ToArray();
                //          returnItem.StartsOn = y.StartsOn;
                //          returnItem.EndsOn = y.EndsOn;
                //          returnItem.StartsOnCalc = y.StartsOnCalc;
                //          returnItem.EndsOnCalc = y.EndsOnCalc;
                //          returnItem.StartsOnFormat = y.StartsOnFormat;
                //          returnItem.EndsOnFormat = y.EndsOnFormat;
                //          returnItem.title = y.title;
                //          returnItem.onGoing = y.onGoing;
                //          returnItem.id_name = y.id_name;
                //          returnItem.tag_text = y.tag_text;
                //          returnItem.contentsearchable = y.contentsearchable;


                //      });
                //      return returnItem;
                //  })
                //  .ToList();

                    //returnModel = model.ToList();// dups.Concat(non_dups).ToList();

                //concatModel.Each(x =>
                //{
                //    if (last_id != x.id)
                //    {
                //        last_id = x.id;
                //        dups = concatModel.Where(y => y.id == last_id).ToList();

                //        //dups.Each(y => {
                //        //    concatModel.Remove(y);
                //        //});
                //        place_ids = new List<int>();
                //        type_ids = new List<int>();

                //        dups.Each(y =>
                //        {
                //            place_ids = place_ids.Union(new int[y.place_id]).ToList();
                //            type_ids = type_ids.Union(new int[y.typeId]).ToList();


                //            returnItem.id = y.id;
                //            returnItem.personId = y.personId;
                //            returnItem.place_ids = place_ids.ToArray();
                //            returnItem.firstName = y.firstName;
                //            returnItem.lastName = y.lastName;
                //            returnItem.displayName = y.displayName;
                //            returnItem.typeIds = type_ids.ToArray();
                //            returnItem.StartsOn = y.StartsOn;
                //            returnItem.EndsOn = y.EndsOn;
                //            returnItem.StartsOnCalc = y.StartsOnCalc;
                //            returnItem.EndsOnCalc = y.EndsOnCalc;
                //            returnItem.StartsOnFormat = y.StartsOnFormat;
                //            returnItem.EndsOnFormat = y.EndsOnFormat;
                //            returnItem.title = y.title;
                //            returnItem.onGoing = y.onGoing;
                //            returnItem.id_name = y.id_name;
                //            returnItem.tag_text = y.tag_text;
                //            returnItem.contentsearchable = y.contentsearchable;


                //        });
                //        returnModel.Add(returnItem);
                //    }


                //});
                    //var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                    //var locations = modelDistinct.DistinctBy(x => x.countryCode);
                    //foreach (var location in locations)
                    //{
                    //    var locationCount = model.Where(x => x.officialName == location.officialName).Count();
                    //    returnModel.Add(new ActivityMapTestsApiModel { LocationCount = locationCount, CountryCode = location.countryCode });
                    //}
               
            }


            return returnModel.ToList();
        }


        /* Returns activity type counts for given place.*/
        [GET("idb_test/{establishmentId?}")]
        //[CacheHttpGet(Duration = 3600)]
        public async Task<List<Tests_idb_return_model>> Get_idb_test(int? establishmentId)
        {
            //IList<Tests_idb_QueryResultModel> returnModel = new List<Tests_idb_QueryResultModel>();
            IList<Tests_idb_return_model> returnModel = new List<Tests_idb_return_model>();
            IList<Tests_idb_QueryResultModel> concatModel = new List<Tests_idb_QueryResultModel>();
            IList<Tests_idb_return_model> dups = new List<Tests_idb_return_model>();
            IList<Tests_idb_return_model> non_dups = new List<Tests_idb_return_model>();
            IList<Tests_idb_QueryResultModel> to_remove_model = new List<Tests_idb_QueryResultModel>();
            IList<Tests_idb_QueryResultModel> model = new List<Tests_idb_QueryResultModel>();
            IList<Tests_idb_person_affiliation_QueryResultModel> person_affiliations = new List<Tests_idb_person_affiliation_QueryResultModel>();
            //IList<ActivityMapTestsApiQueryResultModel> model = new List<ActivityMapTestsApiQueryResultModel>();

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

                TestsRepository TestsRepository = new TestsRepository();
                //EmployeeActivityTypesRepository employeeActivityTypesRepository = new EmployeeActivityTypesRepository();

                model = await TestsRepository.test_idb_ByEstablishment(establishmentId);
                person_affiliations = await TestsRepository.test_idb_person_affiliations_ByEstablishment(establishmentId);

                //var dups;
                //dups.Each(y =>
                //{
                //    concatModel.Remove(y);
                //});
                List<int> place_ids = new List<int>();
                List<int> type_ids = new List<int>();
                dups = model.GroupBy(x => x.id)
                  .Where(g => g.Count() > 1)
                  .Select(z =>
                  {
                      place_ids = new List<int>();
                      type_ids = new List<int>();
                      Tests_idb_return_model returnItem = new Tests_idb_return_model();
                      z.Each(y =>
                      {
                          List<int> place_id = new List<int>();
                          place_id.Add(y.place_id);
                          List<int> type_id = new List<int>();
                          type_id.Add(y.typeId);

                          place_ids = place_ids.Union(place_id).ToList();
                          type_ids = type_ids.Union(type_id).ToList();


                          returnItem.id = y.id;
                          returnItem.personId = y.personId;
                          returnItem.person_affiliations = person_affiliations.Where(x => x.personId == y.personId).Select(x => x.establishmentId).ToArray();
                          returnItem.place_ids = place_ids.ToArray();
                          //returnItem.firstName = y.firstName;
                          //returnItem.lastName = y.lastName;
                          returnItem.displayName = y.displayName;
                          returnItem.typeIds = type_ids.ToArray();
                          //returnItem.StartsOn = y.StartsOn;
                          //returnItem.EndsOn = y.EndsOn;
                          returnItem.StartsOnCalc = y.StartsOnCalc;
                          returnItem.EndsOnCalc = y.EndsOnCalc;
                          returnItem.StartsOnFormat = y.StartsOnFormat;
                          returnItem.EndsOnFormat = y.EndsOnFormat;
                          returnItem.title = y.title;
                          returnItem.onGoing = y.onGoing;
                          returnItem.id_name = y.id_name;
                          returnItem.tag_text = y.tag_text;
                          returnItem.contentsearchable = y.contentsearchable;


                      });
                      return returnItem;
                  })
                  .ToList();
                non_dups = model.GroupBy(x => x.id)
                  .Where(g => g.Count() == 1)
                  .Select(z =>
                  {
                      place_ids = new List<int>();
                      type_ids = new List<int>();
                      Tests_idb_return_model returnItem = new Tests_idb_return_model();
                      z.Each(y =>
                      {

                          place_ids.Add(y.place_id);
                          type_ids.Add(y.typeId);
                          returnItem.id = y.id;
                          returnItem.personId = y.personId;
                          returnItem.person_affiliations = person_affiliations.Where(x => x.personId == y.personId).Select(x => x.establishmentId).ToArray();
                          returnItem.place_ids = place_ids.ToArray();
                          //returnItem.firstName = y.firstName;
                          //returnItem.lastName = y.lastName;
                          returnItem.displayName = y.displayName;
                          returnItem.typeIds = type_ids.ToArray();
                          //returnItem.StartsOn = y.StartsOn;
                          //returnItem.EndsOn = y.EndsOn;
                          returnItem.StartsOnCalc = y.StartsOnCalc;
                          returnItem.EndsOnCalc = y.EndsOnCalc;
                          returnItem.StartsOnFormat = y.StartsOnFormat;
                          returnItem.EndsOnFormat = y.EndsOnFormat;
                          returnItem.title = y.title;
                          returnItem.onGoing = y.onGoing;
                          returnItem.id_name = y.id_name;
                          returnItem.tag_text = y.tag_text;
                          returnItem.contentsearchable = y.contentsearchable;


                      });
                      return returnItem;
                  })
                  .ToList();

                returnModel = dups.Concat(non_dups).ToList();

                //concatModel.Each(x =>
                //{
                //    if (last_id != x.id)
                //    {
                //        last_id = x.id;
                //        dups = concatModel.Where(y => y.id == last_id).ToList();

                //        //dups.Each(y => {
                //        //    concatModel.Remove(y);
                //        //});
                //        place_ids = new List<int>();
                //        type_ids = new List<int>();

                //        dups.Each(y =>
                //        {
                //            place_ids = place_ids.Union(new int[y.place_id]).ToList();
                //            type_ids = type_ids.Union(new int[y.typeId]).ToList();


                //            returnItem.id = y.id;
                //            returnItem.personId = y.personId;
                //            returnItem.place_ids = place_ids.ToArray();
                //            returnItem.firstName = y.firstName;
                //            returnItem.lastName = y.lastName;
                //            returnItem.displayName = y.displayName;
                //            returnItem.typeIds = type_ids.ToArray();
                //            returnItem.StartsOn = y.StartsOn;
                //            returnItem.EndsOn = y.EndsOn;
                //            returnItem.StartsOnCalc = y.StartsOnCalc;
                //            returnItem.EndsOnCalc = y.EndsOnCalc;
                //            returnItem.StartsOnFormat = y.StartsOnFormat;
                //            returnItem.EndsOnFormat = y.EndsOnFormat;
                //            returnItem.title = y.title;
                //            returnItem.onGoing = y.onGoing;
                //            returnItem.id_name = y.id_name;
                //            returnItem.tag_text = y.tag_text;
                //            returnItem.contentsearchable = y.contentsearchable;


                //        });
                //        returnModel.Add(returnItem);
                //    }


                //});
                //var modelDistinct = model.DistinctBy(x => new { x.id, x.countryCode });
                //var locations = modelDistinct.DistinctBy(x => x.countryCode);
                //foreach (var location in locations)
                //{
                //    var locationCount = model.Where(x => x.officialName == location.officialName).Count();
                //    returnModel.Add(new ActivityMapTestsApiModel { LocationCount = locationCount, CountryCode = location.countryCode });
                //}

            }
            var test = returnModel.Where(x => x.id == 50224);

            return returnModel.ToList();
        }
    }
}
