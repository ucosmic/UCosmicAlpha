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
            //AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
            model = establishmentListRepository.EstablishmentList_All_By_establishment();


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (EstablishmentListAllApiReturn establishment in model) // Loop through List with foreach.
                {
                    var xx = new { establishment = establishment.official_name };
                    //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
                    try
                    {
                        //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
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

            //Action<CancellationToken> workItem = Run_Firebase_establishment_sync;
            //HostingEnvironment.QueueBackgroundWorkItem(workItem);
            new Thread(() =>
            {
                Run_Firebase_establishment_sync();
            }).Start();
            //HttpResponseMessage x2 = await Run_Firebase_establishment_sync().ConfigureAwait(false);
            //HttpResponseMessage x2 = await Run_Firebase_establishment_sync();
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
            //AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
            model = countryListRepository.Country_List_All();


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (CountryListAllApiReturn country in model) // Loop through List with foreach.
                {
                    var xx = new { country = country.official_name };
                    //client.PutAsJsonAsync("students/countries/" + country.country + ".json", xx);
                    try
                    {
                        //client.PutAsJsonAsync("students/countries/" + country.country + ".json", xx);
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

        public async void Run_Firebase_program_sync()//(CancellationToken cancellationToken)
        {

            IList<ProgramListAllApiReturn> model = new List<ProgramListAllApiReturn>();

            ProgramListAllRepository programListRepository = new ProgramListAllRepository();
            //AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
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
                    //client.PutAsJsonAsync("students/programs/" + program.program + ".json", xx);
                    try
                    {
                        //client.PutAsJsonAsync("students/programs/" + program.program + ".json", xx);
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
        //public async Task RunAsync()
        //{
        //    using (var client = new HttpClient())
        //    {
        //        // New code:
        //        client.BaseAddress = new Uri("https://ucosmic.firebaseio.com/.json");
        //        client.DefaultRequestHeaders.Accept.Clear();
        //        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        //        HttpResponseMessage response = await client.GetAsync("");
        //        if (response.IsSuccessStatusCode)
        //        {
        //            //var x = response.Content;
        //            //var product = await response.Content.ReadAsAsync<String>();
        //            //Console.WriteLine("{0}\t${1}\t{2}", product.Name, product.Price, product.Category);
        //            //var errorMessage = await response.Content.ReadAsStringAsync();
        //            firebase = response.Content.ReadAsStringAsync().Result;
        //            //return errorMessage;
        //            //var dataObjects = await response.Content.ReadAsAsync<IEnumerable<DataObject>>();
        //            //foreach (var d in dataObjects)
        //            //{
        //            //    Console.WriteLine("{0}", d.test);
        //            //}
        //        }
        //        else
        //        {
        //            //return "";
        //        }

        //    }
        //}
        //[GET("/students/new")]
        //public virtual ActionResult New()
        //{
        //    //RunAsync().Wait();
        //    ViewBag.firebase_token = Request.Cookies.Get("firebase_token") != null ? Request.Cookies.Get("firebase_token").Value : null;
        //    //var url = "https://ucosmic.firebaseio.com/.json";
        //    return View("new", "_Layout3");
        //}

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


        //[POST("/students/new")]
        //[Authorize(Roles = RoleName.AgreementManagers)]
        //public HttpResponseMessage Post(int agreementId, [FromBody] AgreementFileApiModel model)
        //{
        //    model.AgreementId = agreementId;
        //    var command = new CreateFile(User)
        //    {
        //        FileData = model.FileMedium == null ? null : new CreateFile.FileDataWrapper
        //        {
        //            FileName = model.FileMedium.FileName,
        //            MimeType = model.FileMedium.ContentType,
        //            Content = model.FileMedium.Content,
        //        },
        //    };
        //    Mapper.Map(model, command);

        //    try
        //    {
        //        _createHandler.Handle(command);
        //    }
        //    catch (ValidationException ex)
        //    {
        //        Func<ValidationFailure, bool> forName = x => x.PropertyName == command.PropertyName(y => y.FileData.FileName);
        //        Func<ValidationFailure, bool> forContent = x => x.PropertyName == command.PropertyName(y => y.FileData.Content);
        //        if (ex.Errors.Any(forName))
        //            return Request.CreateResponse(HttpStatusCode.UnsupportedMediaType,
        //                ex.Errors.First(forName).ErrorMessage, "text/plain");
        //        if (ex.Errors.Any(forContent))
        //            return Request.CreateResponse(HttpStatusCode.RequestEntityTooLarge,
        //                ex.Errors.First(forContent).ErrorMessage, "text/plain");
        //    }

        //    var url = Url.Link(null, new
        //    {
        //        controller = "AgreementFiles",
        //        action = "Get",
        //        agreementId,
        //        fileId = command.CreatedFileId,
        //    });
        //    Debug.Assert(url != null);
        //    var successPayload = new
        //    {
        //        message = string.Format("File '{0}' was successfully attached.", model.CustomName),
        //        location = url, // TODO: when IE8 dies, no need to do this (it is a workaround for kendo + IE only)
        //    };
        //    var successJson = JsonConvert.SerializeObject(successPayload);
        //    var response = Request.CreateResponse(HttpStatusCode.Created, successJson, "text/plain");
        //    response.Headers.Location = new Uri(url);
        //    return response;
        //}

        //[POST("files/validate")]
        //[Authorize(Roles = RoleName.AgreementManagers)]
        //public HttpResponseMessage ValidatePost([FromBody] FileUploadValidationModel model)
        //{
        //    var command = new CreateFile(User)
        //    {
        //        FileData = new CreateFile.FileDataWrapper
        //        {
        //            FileName = model.Name,
        //            Content = model.Length.HasValue ? new byte[model.Length.Value] : new byte[0],
        //        },
        //    };
        //    var validationResult = _createValidator.Validate(command);

        //    var forProperties = new List<Func<ValidationFailure, bool>>
        //    {
        //        x => x.PropertyName == command.PropertyName(y => y.FileData.FileName),
        //    };
        //    if (model.Length.HasValue)
        //        forProperties.Add(x => x.PropertyName == command.PropertyName(y => y.FileData.Content));
        //    foreach (var forProperty in forProperties)
        //        if (validationResult.Errors.Any(forProperty))
        //            return Request.CreateResponse(HttpStatusCode.BadRequest,
        //                validationResult.Errors.First(forProperty).ErrorMessage, "text/plain");

        //    return Request.CreateResponse(HttpStatusCode.OK);
        //}


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



        //[GET("/api/students/")]
        //public virtual JsonResult getTableJson(StudentQueryParameters param)
        //{
        //    Establishment establishment = null;

        //    var tenancy = Request.Tenancy() ?? new Tenancy();
        //    if (tenancy.TenantId.HasValue)
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
        //    }
        //    else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
        //    {
        //        establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
        //    }

        //    param.FInstitution = establishment.OfficialName;

        //    StudentActivityRepository students = new StudentActivityRepository();    
        //    IList<StudentActivity> content = students.getStudentActivities(param);
        //    bool tracksForeign=false;
        //    if (content.Count > 0)
        //    {
        //        //if either local or foreign establishment name is null, the institution does not track foreign universities
        //        tracksForeign = ((content.FirstOrDefault().localEstablishmentName == null) || 
        //                         (content.FirstOrDefault().foreignEstablishmentName == null)) ? false : true;
        //    }
        //    StudentPager s = new StudentPager(content,param.page,param.pageSize,students.getStudentActivityCount(param), param.orderBy,param.orderDirection, tracksForeign);
        //    return Json(s, JsonRequestBehavior.AllowGet);
        //}


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

