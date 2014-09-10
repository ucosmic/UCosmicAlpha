using System;
using System.Linq.Expressions;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Home;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;
using System.Collections.Generic;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class HomeController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public HomeController(IProcessQueries queryProcessor
        )
        {
            _queryProcessor = queryProcessor;
        }

        [GET("")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("indexSpike")]
        public virtual ActionResult IndexSpike()
        {
            //HomeSectionModel[] home = [new HomeSectionModel{
            //    Title:"test title",
            //    Description: "test desc",
            //    Photo: "url"
            //    Links: [new HomeLink{ }]
            //}]
            var person = _queryProcessor.Execute(new MyPerson(User));
            var establishmentId = person.Affiliations.First(x => x.IsDefault).EstablishmentId;
            //var estblishmentId = 3306;
            var homeSections = _queryProcessor.Execute(new HomeSectionByEstablishmentId(establishmentId));
            List<HomeSectionApiModelReturn> homeSectionModelList = new List<HomeSectionApiModelReturn>();
            if (homeSections != null)
            {
                foreach (HomeSection homeSection in homeSections)
                {

                    List<HomeLinksApiModel> homeLinks = new List<HomeLinksApiModel>();
                    HomeSectionApiModelReturn homeSectionModel = new HomeSectionApiModelReturn()
                    {
                        Description = homeSection.Description,
                        Title = homeSection.Title,
                        EstablishmentId = 0,
                        Links = new List<HomeLinksApiModel>(), 
                        Id = homeSection.Id
                    };
                    if (homeSection.Photo == null)
                    {
                        homeSectionModel.HasPhoto = false;
                    }
                    else
                    {
                        homeSectionModel.HasPhoto = true;
                    }
                    foreach (HomeLink homeLink in homeSection.Links)
                    {
                        homeLinks.Add(new HomeLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
                        //homeSectionModel.Links.ToList().Add(new HomeLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
                    }
                    homeSectionModel.Links = homeLinks;
                    homeSectionModelList.Add(homeSectionModel);
                    //homeSectionModelList.Add(new HomeSectionApiModelReturn()
                    //    {
                    //        Description = homeSection.Description,
                    //        Title = homeSection.Title,
                    //        EstablishmentId = 0,
                    //        Links = new List<HomeLinksApiModel>()
                    //    });
                }
            }

            //if (homeSection != null)
            //{
            //    HomeSectionApiModelReturn homeSectionModel = new HomeSectionApiModelReturn()
            //    {
            //        Description = homeSection.Description,
            //        Title = homeSection.Title,
            //        EstablishmentId = 0,
            //        Links = new List<HomeLinksApiModel>()
            //    };
            //    //homeSectionModel.Links.ToList().ForEach(x => Array.Clear x.HomeSection)
            //    List<HomeLinksApiModel> homeLinks = new List<HomeLinksApiModel>();
            //    foreach (HomeLink homeLink in homeSection.Links)
            //    {
            //        homeLinks.Add(new HomeLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
            //        //homeSectionModel.Links.ToList().Add(new HomeLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
            //    }
            //    homeSectionModel.Links = homeLinks;
            //}
            //homeSectionModel = [];
            //if (homeSection == null || homeSection.Person.User == null ||
            //    !User.Identity.Name.Equals(activity.Person.User.Name, StringComparison.OrdinalIgnoreCase))
            //    return HttpNotFound();
            ViewBag.notification = "test";
            return View("indexSpike", "_Layout2", homeSectionModelList);
        }
        [GET("editHomePage")]
        public virtual ActionResult EditHomePage()
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            var establishmentId = person.Affiliations.First(x => x.IsDefault).EstablishmentId;
            var homeSections = _queryProcessor.Execute(new HomeSectionByEstablishmentId(establishmentId));
            List<HomeSectionApiModelReturn> homeSectionModelList = new List<HomeSectionApiModelReturn>();
            if (homeSections != null)
            {
                foreach (HomeSection homeSection in homeSections)
                {

                    List<HomeLinksApiModel> homeLinks = new List<HomeLinksApiModel>();
                    HomeSectionApiModelReturn homeSectionModel = new HomeSectionApiModelReturn()
                    {
                        Description = homeSection.Description,
                        Title = homeSection.Title,
                        EstablishmentId = 0,
                        Links = new List<HomeLinksApiModel>(),
                        Id = homeSection.Id
                    };
                    if (homeSection.Photo == null)
                    {
                        homeSectionModel.HasPhoto = false;
                    }
                    else
                    {
                        homeSectionModel.HasPhoto = true;
                    }
                    foreach (HomeLink homeLink in homeSection.Links)
                    {
                        homeLinks.Add(new HomeLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
                    }
                    homeSectionModel.Links = homeLinks;
                    homeSectionModelList.Add(homeSectionModel);
                }
            }


            ViewBag.notification = "test";
            return View("editHomePage", "_Layout2", homeSectionModelList);
        }

        [GET("employees")]
        [UserVoiceForum(UserVoiceForum.Employees)]
        public virtual ActionResult Employees()
        {
            return View();
        }

        [GET("alumni")]
        [UserVoiceForum(UserVoiceForum.Alumni)]
        public virtual ActionResult Alumni()
        {
            return View();
        }

        [GET("students")]
        [UserVoiceForum(UserVoiceForum.Students)]
        public virtual ActionResult Students()
        {
            return View();
        }

        [GET("representatives")]
        [UserVoiceForum(UserVoiceForum.Representatives)]
        public virtual ActionResult Representatives()
        {
            return View();
        }

        [GET("travel")]
        [UserVoiceForum(UserVoiceForum.Travel)]
        public virtual ActionResult Travel()
        {
            return View();
        }

        [GET("corporate-engagement")]
        [UserVoiceForum(UserVoiceForum.CorporateEngagement)]
        public virtual ActionResult CorporateEngagement()
        {
            return View();
        }

        [GET("global-press")]
        [UserVoiceForum(UserVoiceForum.GlobalPress)]
        public virtual ActionResult GlobalPress()
        {
            //TempData.Flash("This is the global press page.");
            return View();
        }
    }
}
