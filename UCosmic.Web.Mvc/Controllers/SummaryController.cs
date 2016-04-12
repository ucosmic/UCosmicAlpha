using System;
using System.Linq.Expressions;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
//using UCosmic.Domain.Locations;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;
using System.Collections.Generic;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class SummaryController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public SummaryController(IProcessQueries queryProcessor
        )
        {
            _queryProcessor = queryProcessor;
        }
        
        [GET("Summary/Report")]
        public virtual ActionResult Report()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();
            
            
            return View("Report", "_Layout2");
        }

        [GET("Summary/Map")]
        public virtual ActionResult Map()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();
            return View("Map", "_Layout2");

        }

        [GET("/Summary/info/")]
        public virtual ActionResult Info(string domain)
        {

            //load filter parameter values
            //Establishment establishment = null;
            //StudentActivityRepository student_rep = new StudentActivityRepository();
            //PlacesRepository places_rep = new PlacesRepository();

            //var tenancy = Request.Tenancy() ?? new Tenancy();
            //if (tenancy.TenantId.HasValue)
            //{
            //    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
            //}
            //else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            //{
            //    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
            //}

            //if (establishment != null)
            //{
            //    //Load filter parameters
            //    ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
            //    ViewBag.campus = establishment.Children; // list of campuses
            //    ViewBag.continents = places_rep.getContinentList();
            //    ViewBag.countries = places_rep.getCountryList();
            //    ViewBag.programs = student_rep.getPrograms(establishment.OfficialName);
            //    ViewBag.terms = student_rep.getTerms(establishment.OfficialName);

            //}
            //else
            //{
            //    return HttpNotFound();
            //}
            return View("info", "_Layout_riot");
        }
        
    }
}
