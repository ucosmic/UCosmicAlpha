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

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class StudentsController : Controller{

        private StudentQueryParameters param = new StudentQueryParameters();

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

        [GET("/students/new")]
        public virtual ActionResult New()
        {
            return View();
        }

        [POST("/students/new")]
        public virtual ActionResult New(HttpPostedFileBase file)
        {
            //Check if the file is null - we'll probably want to return an error in this case
            if (file != null && file.ContentLength > 0 && file.ContentLength < 10000000)
           {
                var fileName = Path.GetFileName(file.FileName);
                var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);
                file.SaveAs(path);

                var excel = new ExcelQueryFactory(path);
                IList<StudentImportApi> data = (from c in excel.Worksheet<StudentImportApi>("StudentActivity") select c).ToList<StudentImportApi>();

                StudentActivityRepository repository = new StudentActivityRepository();
                var rows_changed = repository.uploadStudents(data);
                ViewBag.Success = rows_changed.success;
                ViewBag.Failure = rows_changed.success;
                //int[] rows_changed = repository.uploadStudents(data);
                //ViewBag.Success = rows_changed[0];
                //ViewBag.Failure = rows_changed[1];
            }
            return View();
        }


        [GET("{domain}/students/table/")]
        public virtual ActionResult Table(string domain)
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
                ViewBag.campus = establishment.Children; // list of campuses
                ViewBag.continents = places_rep.getContinentList();
                ViewBag.countries = places_rep.getCountryList();
                ViewBag.programs = student_rep.getPrograms(establishment.OfficialName);
                ViewBag.terms = student_rep.getTerms(establishment.OfficialName);
                
                return View("Table", "_Layout2");
            }
            else
            {
                return HttpNotFound();
            }   
        }



        [GET("/api/students/")]
        public virtual JsonResult getTableJson(StudentQueryParameters param)
        {
            Establishment establishment = null;

            var tenancy = Request.Tenancy() ?? new Tenancy();
            if (tenancy.TenantId.HasValue)
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
            }
            else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            {
                establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
            }

            param.FInstitution = establishment.OfficialName;

            StudentActivityRepository students = new StudentActivityRepository();    
            IList<StudentActivity> content = students.getStudentActivities(param);
            bool tracksForeign=false;
            if (content.Count > 0)
            {
                //if either local or foreign establishment name is null, the institution does not track foreign universities
                tracksForeign = ((content.FirstOrDefault().localEstablishmentName == null) || 
                                 (content.FirstOrDefault().foreignEstablishmentName == null)) ? false : true;
            }
            StudentPager s = new StudentPager(content,param.page,param.pageSize,students.getStudentActivityCount(param), param.orderBy,param.orderDirection, tracksForeign);
            return Json(s, JsonRequestBehavior.AllowGet);
        }

        
        [GET("{domain}/students/map")]
        public virtual ActionResult Map(string domain, ActivitySearchInputModel input)
        {
           
            ViewBag.EmployeesDomain = domain;
            return View();
        }

        
        [GET("{domain}/students")]
        public virtual ActionResult TenantIndex(string domain)
        {
            return View();
        }
        
    }
}

