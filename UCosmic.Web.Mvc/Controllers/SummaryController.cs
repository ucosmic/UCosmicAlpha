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

            return View("info", "_Layout_riot");
        }
        
    }
}
