using System;
using System.Linq.Expressions;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Home;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;
using System.Collections.Generic;
using UCosmic.Domain.Establishments;

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
            var tenancy = Request.Tenancy() ?? new Tenancy();
            Establishment establishment = null;
            List<HomeSectionApiModelReturn> homeSectionModelList = new List<HomeSectionApiModelReturn>();
            if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            {
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

                    var establishmentId = establishment.RevisionId;
                    var homeSections = _queryProcessor.Execute(new HomeSectionByEstablishmentId(establishmentId));
                    var homeAlert = _queryProcessor.Execute(new HomeAlertByEstablishmentId(establishmentId));
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
                    if (homeAlert != null)
                    {
                        ViewBag.alertIsDisabled = homeAlert.IsDisabled;
                        ViewBag.alert = homeAlert.Text;
                    }
                    else
                    {
                        ViewBag.alertIsDisabled = true;
                        ViewBag.alert = "You do not have any flasher text.";
                    }
                }

            }
            else
            {
                ViewBag.alertIsDisabled = true;
                ViewBag.alert = "You do not have any flasher text.";
            }
            
            return View("index", "_Layout2", homeSectionModelList);
        }
        [GET("editHomePage")]
        public virtual ActionResult EditHomePage()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();
            Establishment establishment = null;
            List<HomeSectionApiModelReturn> homeSectionModelList = new List<HomeSectionApiModelReturn>();
            if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            {
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

                    var establishmentId = establishment.RevisionId;
                    var homeSections = _queryProcessor.Execute(new HomeSectionByEstablishmentId(establishmentId));
                    var homeAlert = _queryProcessor.Execute(new HomeAlertByEstablishmentId(establishmentId));
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
                    if (homeAlert != null)
                    {
                        ViewBag.alertIsDisabled = homeAlert.IsDisabled;
                        ViewBag.alert = homeAlert.Text;
                    }
                    else
                    {
                        ViewBag.alertIsDisabled = true;
                        ViewBag.alert = "You do not have any flasher text.";
                    }
                }

            }
            else
            {
                ViewBag.alertIsDisabled = true;
                ViewBag.alert = "You do not have any flasher text.";
            }
            
            
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
            return View();
        }
    }
}
