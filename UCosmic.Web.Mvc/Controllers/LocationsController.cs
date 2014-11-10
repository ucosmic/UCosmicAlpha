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
    public partial class LocationsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public LocationsController(IProcessQueries queryProcessor
        )
        {
            _queryProcessor = queryProcessor;
        }
        
        [GET("Locations")]
        public virtual ActionResult Index()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();
            //Establishment establishment = null;
            //List<LocationsSectionApiModelReturn> homeSectionModelList = new List<LocationsSectionApiModelReturn>();
            //if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            //{
            //    if (tenancy.TenantId.HasValue)
            //    {
            //        establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
            //    }
            //    else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            //    {
            //        establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
            //    }
            //    if (establishment != null)
            //    {

            //        var establishmentId = establishment.RevisionId;
            //        var homeSections = _queryProcessor.Execute(new LocationsSectionByEstablishmentId(establishmentId));
            //        var homeAlert = _queryProcessor.Execute(new LocationsAlertByEstablishmentId(establishmentId));
            //        if (homeSections != null)
            //        {
            //            foreach (LocationsSection homeSection in homeSections)
            //            {

            //                List<LocationsLinksApiModel> homeLinks = new List<LocationsLinksApiModel>();
            //                LocationsSectionApiModelReturn homeSectionModel = new LocationsSectionApiModelReturn()
            //                {
            //                    Description = homeSection.Description,
            //                    Title = homeSection.Title,
            //                    EstablishmentId = 0,
            //                    Links = new List<LocationsLinksApiModel>(),
            //                    Id = homeSection.Id
            //                };
            //                if (homeSection.Photo == null)
            //                {
            //                    homeSectionModel.HasPhoto = false;
            //                }
            //                else
            //                {
            //                    homeSectionModel.HasPhoto = true;
            //                }
            //                foreach (LocationsLink homeLink in homeSection.Links)
            //                {
            //                    homeLinks.Add(new LocationsLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
            //                }
            //                homeSectionModel.Links = homeLinks;
            //                homeSectionModelList.Add(homeSectionModel);
            //            }
            //        }
            //        if (homeAlert != null)
            //        {
            //            ViewBag.alertIsDisabled = homeAlert.IsDisabled;
            //            ViewBag.alert = homeAlert.Text;
            //        }
            //        else
            //        {
            //            ViewBag.alertIsDisabled = true;
            //            ViewBag.alert = "You do not have any flasher text.";
            //        }
            //    }

            //}
            //else
            //{
            //    ViewBag.alertIsDisabled = true;
            //    ViewBag.alert = "You do not have any flasher text.";
            //}
            
            return View("index", "_Layout2");
        }
        
    }
}
