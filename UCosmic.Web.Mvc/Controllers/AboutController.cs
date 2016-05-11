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

    public partial class AboutController : Controller
    {

        private StudentQueryParameters param = new StudentQueryParameters();

        [GET("/about/about/")]
        public virtual ActionResult about(string domain)
        {

            return View("about", "_Layout_riot");
        }

        [GET("/about/current_modules/")]
        public virtual ActionResult current_modules(string domain)
        {

            return View("current_modules", "_Layout_riot");
        }

        [GET("/about/future_modules/")]
        public virtual ActionResult future_modules(string domain)
        {

            return View("future_modules", "_Layout_riot");
        }

        [GET("/about/news/")]
        public virtual ActionResult news(string domain)
        {

            return View("news", "_Layout_riot");
        }

        [GET("/about/benefits_fees/")]
        public virtual ActionResult benefits(string domain)
        {

            return View("benefits_fees", "_Layout_riot");
        }

        [GET("/about/join/")]
        public virtual ActionResult join(string domain)
        {

            return View("join", "_Layout_riot");
        }

        [GET("/about/members/")]
        public virtual ActionResult members(string domain)
        {

            return View("members", "_Layout_riot");
        }

        [GET("/about/blog/")]
        public virtual ActionResult blog(string domain)
        {

            return View("blog", "_Layout_riot");
        }
    }
}

