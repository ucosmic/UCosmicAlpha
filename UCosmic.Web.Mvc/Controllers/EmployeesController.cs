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
                EagerLoad = ActivitySearchResultProfiler.EntitiyToModel.EagerLoad,
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
        [GET("{domain}/employees/map")]
        public virtual ActionResult Map(string domain, ActivitySearchInputModel input)
        {
            var query = new ActivityValuesPageBy
            {
                EagerLoad = ActivitySearchResultProfiler.EntitiyToModel.EagerLoad,
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
