using System;
using System.IO;
using System.Linq.Expressions;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Home;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;
using System.Collections.Generic;
using UCosmic.Domain.Establishments;
using UCosmic.Repositories;
using System.Web;
using LinqToExcel;
using System.Net.Http;
using System.Web.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Dynamic;
using System.Threading;
using System.Web.Hosting;
//using UCosmic.WebApi;

namespace UCosmic.Web.Mvc.Controllers
{

    public class DataObject
    {
        public string test { get; set; }
    }
    public partial class StudentsController : Controller
    {

        private StudentQueryParameters param = new StudentQueryParameters();

        //private String firebase = "";

        private readonly IProcessQueries _queryProcessor;

        public StudentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("/students/")]
        public virtual ActionResult Index()
        {
            StudentActivityRepository students = new StudentActivityRepository();
            param.orderBy = "TermStart";
            param.orderDirection = "ASC";
            IList<StudentActivity> content = students.getStudentActivities(param);

            return View(content);
        }
        public async void Run_Firebase_establishment_sync()//(CancellationToken cancellationToken)
        {

            IList<EstablishmentListAllApiReturn> model = new List<EstablishmentListAllApiReturn>();

            EstablishmentListAllRepository establishmentListRepository = new EstablishmentListAllRepository();
            model = establishmentListRepository.EstablishmentList_All_By_establishment();


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (EstablishmentListAllApiReturn establishment in model) // Loop through List with foreach.
                {
                    var xx = new { establishment = establishment.official_name, parent_id = establishment.parent_id };
                    try
                    {
                        HttpResponseMessage response = await client.PutAsJsonAsync("Establishments/Establishments/" + establishment.establishment + ".json", xx);
                    }
                    catch (Exception e)
                    {
                        var x = e;
                    }
                }
            }
        }
        [GET("/students/update_establishments")]
        public virtual async Task<ActionResult> update_establishments()
        {

            new Thread(() =>
            {
                Run_Firebase_establishment_sync();
            }).Start();
            using (var client = new HttpClient())
            {

                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com/Students/Terms/.json");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage response = await client.GetAsync("");
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                if (response.IsSuccessStatusCode)
                {
                    ViewBag.test = response.Content.ReadAsStringAsync().Result;

                    return View("new", "_Layout3");
                }
                else
                {
                    //return "";
                    return View("new", "_Layout3");
                }

            }
        }


        public async void Run_Firebase_country_sync()//(CancellationToken cancellationToken)
        {

            IList<CountryListAllApiReturn> model = new List<CountryListAllApiReturn>();

            CountryListAllRepository countryListRepository = new CountryListAllRepository();
            model = countryListRepository.Country_List_All();
            var countries = model.DistinctBy2(d => new { d.official_name }).ToList();

            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (CountryListAllApiReturn country in countries) // Loop through List with foreach.
                {
                    var xx = new
                    {
                        country = country.official_name,
                        associations = model.Where(x => x.country == country.country && x.place_type != "").ToArray()
                    };
                    try
                    {
                        HttpResponseMessage response = await client.PutAsJsonAsync("Places/Countries/" + country.country + ".json", xx);
                    }
                    catch (Exception e)
                    {
                        var x = e;
                    }
                }
            }
        }
        [GET("/students/update_countries")]
        public virtual async Task<ActionResult> update_countries()
        {
            new Thread(() =>
            {
                Run_Firebase_country_sync();
            }).Start();
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage response = await client.GetAsync("");
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                return View("new", "_Layout3");

            }
        }
        [GET("/students/test")]
        public virtual async Task<ActionResult> test()
        {
            //new Thread(() =>
            //{
            //    Run_Firebase_country_sync();
            //}).Start();
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage response = await client.GetAsync("Places/Countries.json");
                if (response.IsSuccessStatusCode)
                {
                    var countries = response.Content.ReadAsStringAsync().Result;
                }
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                return View("new", "_Layout3");

            }
        }

        public async void Run_Firebase_program_sync()//(CancellationToken cancellationToken)
        {

            IList<ProgramListAllApiReturn> model = new List<ProgramListAllApiReturn>();

            ProgramListAllRepository programListRepository = new ProgramListAllRepository();
            model = programListRepository.Program_List_All();


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (ProgramListAllApiReturn program in model) // Loop through List with foreach.
                {
                    var xx = new { name = program.name, is_standard = program.is_standard, establishment_id = program.establishment_id };
                    try
                    {
                        HttpResponseMessage response = await client.PutAsJsonAsync("Students/Programs/" + program.program.Replace(".", "_") + ".json", xx);
                    }
                    catch (Exception e)
                    {
                        var x = e;
                    }
                }
            }
        }
        [GET("/students/update_programs")]
        public virtual async Task<ActionResult> update_programs()
        {
            new Thread(() =>
            {
                Run_Firebase_program_sync();
            }).Start();
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage response = await client.GetAsync("");
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                return View("new", "_Layout3");

            }
        }
        [GET("/students/new")]
        public virtual ActionResult New()
        {
            //RunAsync().Wait();
            ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
            //var url = "https://ucosmic.firebaseio.com/.json";
            return View("new", "_Layout3");
        }




        [GET("/students/table/")]
        public virtual ActionResult Table()
        {

            //load filter parameter values
            Establishment establishment = null;
            StudentActivityRepository student_rep = new StudentActivityRepository();
            PlacesRepository places_rep = new PlacesRepository();

            var tenancy = Request.Tenancy() ?? new Tenancy();
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
                //Load filter parameters
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                ViewBag.campus = establishment.Children; // list of campuses
                ViewBag.continents = places_rep.getContinentList();
                ViewBag.countries = places_rep.getCountryList();
                ViewBag.programs = student_rep.getPrograms(establishment.OfficialName);
                ViewBag.terms = student_rep.getTerms(establishment.OfficialName);

                return View("Table", "_Layout3");
            }
            else
            {
                return HttpNotFound();
            }
        }
        [GET("/students/map/")]
        public virtual ActionResult Map(string domain)
        {

            //load filter parameter values
            Establishment establishment = null;
            StudentActivityRepository student_rep = new StudentActivityRepository();
            PlacesRepository places_rep = new PlacesRepository();

            var tenancy = Request.Tenancy() ?? new Tenancy();
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
                //Load filter parameters
                ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
                ViewBag.campus = establishment.Children; // list of campuses
                ViewBag.continents = places_rep.getContinentList();
                ViewBag.countries = places_rep.getCountryList();
                ViewBag.programs = student_rep.getPrograms(establishment.OfficialName);
                ViewBag.terms = student_rep.getTerms(establishment.OfficialName);

                return View("Map_riot", "_Layout_riot");
            }
            else
            {
                return HttpNotFound();
            }
        }

        [GET("/Students/info/")]
        public virtual ActionResult Info(string domain)
        {

            return View("info", "_Layout_riot");
        }

    }
}

