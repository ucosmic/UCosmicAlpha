using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class EmployeePersonalInfoController : Controller
    {
        [GET("my/info")]
        public virtual ActionResult Index()
        {
            return View();
        }

        //
        // GET: /EmployeePersonalInfo/Details/5

        public virtual ActionResult Details(int id)
        {
            return View();
        }

        //
        // GET: /EmployeePersonalInfo/Create

        public virtual ActionResult Create()
        {
            return View();
        }

        //
        // POST: /EmployeePersonalInfo/Create

        [HttpPost]
        public virtual ActionResult Create(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /EmployeePersonalInfo/Edit/5

        public virtual ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /EmployeePersonalInfo/Edit/5

        [HttpPost]
        public virtual ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /EmployeePersonalInfo/Delete/5

        public virtual ActionResult Delete(int id)
        {
            return View();
        }

        //
        // POST: /EmployeePersonalInfo/Delete/5

        [HttpPost]
        public virtual ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
