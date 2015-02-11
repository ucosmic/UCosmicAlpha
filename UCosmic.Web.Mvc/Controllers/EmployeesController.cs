using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using Omu.ValueInjecter;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.LanguageExpertises;
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
            //input.AncestorId = null;
            var query = new ActivityValuesPageBy
            {
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Activity.Person,
                    x => x.Activity.Person.Affiliations,
                    x => x.Activity.Person.Affiliations.Select(y => y.Establishment),
                    x => x.Activity.Person.Affiliations.Select(y => y.Establishment.Ancestors),//.Select(z => z.Ancestor)),
                    //x => x.Activity.Person.Affiliations.All().,//.Select(z => z.Ancestor)),
                    //x => x.Locations,                    
                    //x => x.Tags,
                    //x => x.Types,
                    //x => x.Activity,
                    //x => x.Activity.Values,
                    //x => x.Locations.Select(z => z.Place),
                    //x => x.Locations.Select(z => z.Place.GeoNamesToponym),
                    //x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
                    //x => x.Locations.Select(z => z.Place.Ancestors),
                    //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor)),
                    //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
                    //x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),
                }
                //EagerLoad = new Expression<Func<ActivityValues, object>>[]
                //{
                //    x => x.Activity.Values,
                //    x => x.Locations.Select(z => z.Place),
                //    x => x.Locations.Select(z => z.Place.GeoNamesToponym),
                //    x => x.Locations.Select(z => z.Place.GeoPlanetPlace),
                //    x => x.Locations.Select(z => z.Place.Ancestors),
                //    x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor)),
                //    x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoNamesToponym)),
                //    x => x.Locations.Select(z => z.Place.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace)),

                //}
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

        //[CurrentModuleTab(ModuleTab.Employees)]
        //[GET("{domain}/employees/map")]
        //public virtual ActionResult Map(string domain, ActivitySearchInputModel input)
        //{
        //    var query = new ActivityValuesPageBy
        //    {
        //        //EagerLoad = ActivitySearchResultProfiler.EntitiyToModel.EagerLoad,
        //    };
        //    Mapper.Map(input, query);
        //    var results = _queryProcessor.Execute(query);

        //    var model = new ActivitySearchModel
        //    {
        //        Domain = domain,
        //        Input = input,
        //        Output = Mapper.Map<PageOfActivitySearchResultModel>(results),
        //        ActivityTypes = Enumerable.Empty<ActivityTypeModel>(),
        //    };
        //    var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(domain)
        //    {
        //        EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
        //        {
        //            x => x.ActivityTypes,
        //        }
        //    });
        //    if (settings != null && settings.ActivityTypes.Any())
        //        model.ActivityTypes = Mapper.Map<ActivityTypeModel[]>(settings.ActivityTypes.OrderBy(x => x.Rank));

        //    Session.LastEmployeeLens(Request);
        //    Session.LastActivityLens(Request);
        //    return View(model);
        //}
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/map")]
        public virtual ActionResult Map(string domain, ActivitySearchInputModel input)
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

            ViewBag.EmployeesDomain = domain;
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/degrees/table")]
        public virtual ActionResult DegreesTable(string domain, DegreesSearchInputModel input)
        {
            var query = new DegreesPageByTerms
            {
                EstablishmentDomain = domain,
                //EstablishmentId = 25,
                //AncestorId = 25,
                EagerLoad = DegreeSearchResultProfiler.EntitiyToModel.EagerLoad,
            };
            //if (input.AncestorId)
            //{
            //    query.AncestorId = input.AncestorId
            //}
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);
            var model = new DegreeSearchModel
            {
                Domain = domain,
                Input = input,
                //Output = myOutput.InjectFrom(results),
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

            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;

            Session.LastEmployeeLens(Request);
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/languages/table")]
        public virtual ActionResult LanguagesTable(string domain, LanguageExpertisesSearchInputModel input)
        {
            var query = new LanguageExpertisesPageByTerms
            {
                EstablishmentDomain = domain,
                //EstablishmentId = 25,
                //AncestorId = 25,
                //EagerLoad = LanguageExpertiseSearchResultProfiler.EntitiyToModel.EagerLoad,
            };
            //if (input.AncestorId)
            //{
            //    query.AncestorId = input.AncestorId
            //}
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);
            //var test = new List<LanguageExpertiseSearchResultModel>()
            //test = 
            var myOutput = new PageOfLanguageExpertiseSearchResultModel()
            {
                PageNumber = results.PageNumber,
                PageSize = results.PageSize,
                Items = results.Items.Select( x => new LanguageExpertiseSearchResultModel(){
                    Dialect = x.Dialect,
                    LanguageExpertiseId = x.RevisionId,
                    ListeningProficiency = x.ListeningProficiency == 1 ? "elementary listening" : x.ListeningProficiency == 2 ? "limited listening" : x.ListeningProficiency == 3 ? "general listening" : x.ListeningProficiency == 4 ? "advanced listening" : x.ListeningProficiency == 5 ? "fluent listening" : "no known listening",
                    Name = x.Language != null ? x.Language.Names.FirstOrDefault().Text : x.Other,
                    Other = x.Other,
                    Owner = new LanguageExpertiseSearchResultModel.LanguageExpertiseSearchResultOwnerModel(){
                        PersonId = x.Person.RevisionId,
                        DisplayName = x.Person.DisplayName,
                        LastCommaFirst = !string.IsNullOrWhiteSpace(x.Person.LastName) && !string.IsNullOrWhiteSpace(x.Person.FirstName) ? x.Person.LastName + ", " + x.Person.FirstName : !string.IsNullOrWhiteSpace(x.Person.LastName) ? x.Person.LastName : x.Person.DisplayName,
                    },
                    ReadingProficiency = x.ReadingProficiency == 1 ? "and elementary reading." : x.ReadingProficiency == 2 ? "and limited reading." : x.ReadingProficiency == 3 ? "and general reading." : x.ReadingProficiency == 4 ? "and advanced reading." : x.ReadingProficiency == 5 ? "and fluent reading." : "and no known reading.",
                    SpeakingProficiency = x.SpeakingProficiency == 1 ? "Elementary speaking" : x.SpeakingProficiency == 2 ? "Limited speaking" : x.SpeakingProficiency == 3 ? "General speaking" : x.SpeakingProficiency == 4 ? "Advanced speaking" : x.SpeakingProficiency == 5 ? "Fluent speaking" : "No known speaking",
                    WritingProficiency = x.WritingProficiency == 1 ? "elementary writing" : x.WritingProficiency == 2 ? "limited writing" : x.WritingProficiency == 3 ? "general writing" : x.WritingProficiency == 4 ? "advanced writing" : x.WritingProficiency == 5 ? "fluent writing" : "no known writing",
                }),
                ItemTotal = results.ItemTotal,
            };
            //var test = myOutput.InjectFrom(results);
            //test
            //results.ToList;
            //results.Items = results.Items.ToArray();
            //results.AsQueryable();
            myOutput.Items = myOutput.Items.OrderBy(x => x.Name);

            var model = new LanguageExpertiseSearchModel
            {
                Domain = domain,
                Input = input,
                //Output = results,
                ////Output2 = results.Items.ToList(),
                Output = myOutput,
            };

            using (var http = new HttpClient())
            {
                Debug.Assert(Request.Url != null);

                var url = Url.RouteUrl(null, new { controller = "Languages", httproute = "", }, Request.Url.Scheme);
                //var url = Url.RouteUrl(null, new { controller = "Countries", httproute = "", }, Request.Url.Scheme);

                var languages = http.GetAsync(url).Result.Content.ReadAsAsync<IEnumerable<LanguageApiModel>>().Result;
                model.LanguageOptions = languages.Select(x => new SelectListItem
                {
                    Text = x.Name,
                    Value = x.Code,
                    Selected = x.Code == input.LanguageCode,
                });
            }

            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;

            Session.LastEmployeeLens(Request);
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("{domain}/employees/experts2")]
        public virtual ActionResult Experts2(string domain)
        {
            Session.LastEmployeeLens(Request);
            return View();
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
