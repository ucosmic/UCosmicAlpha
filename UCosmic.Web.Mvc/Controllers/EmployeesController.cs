using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class EmployeesController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        [UsedImplicitly]
        public EmployeesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("employees")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees")]
        public virtual ActionResult TenantIndex(string domain)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesDomain = domain;
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            Session.LastEmployeeLens(Request);
            Session.LastActivityLens(Request);
            return View();
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/table")]
        public virtual ActionResult Table(string domain, ActivitySearchInputModel input)
        {
            var query = new ActivityValuesPageBy
            {
            };
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);

            var model = new ActivitySearchModel
            {
                Domain = domain,
                Input = input,
                Output = Mapper.Map<PageOfActivitySearchResultModel>(results),
                ActivityTypes = Enumerable.Empty<ActivityTypeModel>(),
            };
            var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(domain)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.ActivityTypes,
                }
            });
            if (settings != null && settings.ActivityTypes.Any())
                model.ActivityTypes = Mapper.Map<ActivityTypeModel[]>(settings.ActivityTypes.OrderBy(x => x.Rank));

            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            Session.LastEmployeeLens(Request);
            Session.LastActivityLens(Request);
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/map")]
        public virtual ActionResult Map(string domain, ActivitySearchInputModel input)
        {
            var query = new ActivityValuesPageBy
            {
                //EagerLoad = ActivitySearchResultProfiler.EntitiyToModel.EagerLoad,
            };
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);

            var model = new ActivitySearchModel
            {
                Domain = domain,
                Input = input,
                Output = Mapper.Map<PageOfActivitySearchResultModel>(results),
                ActivityTypes = Enumerable.Empty<ActivityTypeModel>(),
            };
            var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(domain)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.ActivityTypes,
                }
            });
            if (settings != null && settings.ActivityTypes.Any())
                model.ActivityTypes = Mapper.Map<ActivityTypeModel[]>(settings.ActivityTypes.OrderBy(x => x.Rank));

            Session.LastEmployeeLens(Request);
            Session.LastActivityLens(Request);
            return View(model);
        }
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/maptest")]
        public virtual ActionResult MapTest(string domain, ActivitySearchInputModel input)
        {
            var query = new ActivityValuesBy();
            input.PageSize = 10;
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);
            //var Output = Mapper.Map<ActivitySearchResultMapModel[]>(results);
            //var Output = Mapper.Map<ActivitySearchResultMapModel[]>(results); 
            //var query = new ActivityValuesPageBy
            //{
            //};
            //input.PageSize = 10;
            //Mapper.Map(input, query);
            //var results = _queryProcessor.Execute(query);
            //var Output = Mapper.Map<PageOfActivitySearchResultMapModel>(results);
            
            var model = new ActivitySearchMapModel
            {
                Domain = domain,
                Input = input,
                // = Output,//results as IQueryable<ActivitySearchResultMapModel>,
                //Continents =  from continents in Output
                //       group continents by continents.ContinentCode into continent
                //             select new ActivitySearchMapPlaceModel
                //             {
                //                 ContinentId = continent.Select(y => y.ContinentId).FirstOrDefault(),
                //                Count = continent.Count(),
                //                 BoundingBox = continent.Select(y => y.BoundingBox).FirstOrDefault(),
                //                 Center = continent.Select(y => y.Center).FirstOrDefault(),
                //                ContinentCode = continent.Select(y => y.ContinentCode).FirstOrDefault(),
                //                CountryCode = null as string,
                //                IsContinent = true,
                //                IsCountry  = false,
                //                IsEarth = false,
                //                Name = continent.Select(y => y.ContinentName).FirstOrDefault(),
                //                Type = "Continent"
                //             },
                ActivityTypes = Enumerable.Empty<ActivityTypeModel>(),
            };
            var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(domain)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.ActivityTypes,
                }
            });
            if (settings != null && settings.ActivityTypes.Any())
                model.ActivityTypes = Mapper.Map<ActivityTypeModel[]>(settings.ActivityTypes.OrderBy(x => x.Rank));

            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            Session.LastEmployeeLens(Request);
            Session.LastActivityLens(Request);
            //send down continents and countries
            //var xxx = model.Output.Items.GroupBy(x => x.ContinentCode).Select(y => y.);
            //var xxxy = from continents in Output.Items
            //           group continents by continents.ContinentCode into continent
            //           select new { Continent = continent.Key,
            //                        Count = continent.Count(),
            //                        boundingBox = continent.Select(y => y.BoundingBox),
            //                        Center = continent.Select(y => y.Center),
            //                        continentCode = continent.Select(y => y.ContinentCode),
            //                        countryCode = null as object,
            //                        countryId = null as object,
            //                        isContinent = true,
            //                        isCountry  = false,
            //                        isEarth = false,
            //                        name = continent.Select(y => y.ContinentName.FirstOrDefault()),
            //                        type = "Continent"
            //           };

            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/degrees/table")]
        public virtual ActionResult DegreesTable(string domain, DegreesSearchInputModel input)
        {
            var query = new DegreesPageByTerms
            {
                EstablishmentDomain = domain,
                EagerLoad = DegreeSearchResultProfiler.EntitiyToModel.EagerLoad,
            };
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);

            var model = new DegreeSearchModel
            {
                Domain = domain,
                Input = input,
                Output = Mapper.Map<PageOfDegreeSearchResultModel>(results),
            };

            using (var http = new HttpClient())
            {
                Debug.Assert(Request.Url != null);
                var url = Url.RouteUrl(null, new { controller = "Countries", httproute = "", }, Request.Url.Scheme);
                var countries = http.GetAsync(url).Result.Content.ReadAsAsync<IEnumerable<CountryApiModel>>().Result;
                model.CountryOptions = countries.Select(x => new SelectListItem
                {
                    Text = x.Name,
                    Value = x.Code,
                    Selected = x.Code == input.CountryCode,
                });
            }

            Session.LastEmployeeLens(Request);
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/experts")]
        public virtual ActionResult Experts(string domain)
        {
            Session.LastEmployeeLens(Request);
            return View();
        }
    }
}
