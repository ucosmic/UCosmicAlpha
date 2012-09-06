using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace UCosmicLayout3.Controllers
{
    public partial class AdminController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
