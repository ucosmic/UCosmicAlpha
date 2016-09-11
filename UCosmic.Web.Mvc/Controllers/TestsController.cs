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

    //public class DataObject
    //{
    //    public string test { get; set; }
    //}
    public partial class TestsController : Controller
    {

        private StudentQueryParameters param = new StudentQueryParameters();

        //private String firebase = "";

        private readonly IProcessQueries _queryProcessor;

        public TestsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }



        [GET("/tests/idb_test/")]
        public virtual ActionResult Idb_test(string domain)
        {

            return View("idb_test", "_Layout_riot");
        }


        //[GET("/students/map/")]
        //public virtual ActionResult Map(string domain)
        //{

        //    //load filter parameter values
        //    Establishment establishment = null;
        //    StudentActivityRepository student_rep = new StudentActivityRepository();
        //    PlacesRepository places_rep = new PlacesRepository();

        //    var tenancy = Request.Tenancy() ?? new Tenancy();
        //    if (tenancy.TenantId.HasValue)
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
        //    }
        //    else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
        //    }

        //    if (establishment != null)
        //    {
        //        //Load filter parameters
        //        ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
        //        ViewBag.campus = establishment.Children; // list of campuses
        //        ViewBag.continents = places_rep.getContinentList();
        //        ViewBag.countries = places_rep.getCountryList();
        //        ViewBag.programs = student_rep.getPrograms(establishment.OfficialName);
        //        ViewBag.terms = student_rep.getTerms(establishment.OfficialName);

        //        return View("Map_riot", "_Layout_riot");
        //    }
        //    else
        //    {
        //        return HttpNotFound();
        //    }
        //}

    }
}

