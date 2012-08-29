using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace UCosmicLayout3.Controllers
{
    public partial class HomeController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult Agreements()
        {
            return View();
        }

        public virtual ActionResult Employees()
        {
            return View();
        }

        public virtual ActionResult Alumni()
        {
            TempData.Add("Flasher", "This is the alumni page.");
            return View();
        }

        public virtual ActionResult Students()
        {
            return View();
        }

        public virtual ActionResult Representatives()
        {
            return View();
        }

        public virtual ActionResult Travel()
        {
            return View();
        }

        public virtual ActionResult CorporateEngagement()
        {
            return View();
        }

        public virtual ActionResult GlobalPress()
        {
            return View();
        }
    }
}
