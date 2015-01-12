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
            //Establishment establishment = null;
            //List<SummarySectionApiModelReturn> homeSectionModelList = new List<SummarySectionApiModelReturn>();
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
            //        var homeSections = _queryProcessor.Execute(new SummarySectionByEstablishmentId(establishmentId));
            //        var homeAlert = _queryProcessor.Execute(new SummaryAlertByEstablishmentId(establishmentId));
            //        if (homeSections != null)
            //        {
            //            foreach (SummarySection homeSection in homeSections)
            //            {

            //                List<SummaryLinksApiModel> homeLinks = new List<SummaryLinksApiModel>();
            //                SummarySectionApiModelReturn homeSectionModel = new SummarySectionApiModelReturn()
            //                {
            //                    Description = homeSection.Description,
            //                    Title = homeSection.Title,
            //                    EstablishmentId = 0,
            //                    Links = new List<SummaryLinksApiModel>(),
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
            //                foreach (SummaryLink homeLink in homeSection.Links)
            //                {
            //                    homeLinks.Add(new SummaryLinksApiModel() { Text = homeLink.Text, Url = homeLink.Url });
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
            
            return View("Report", "_Layout2");
        }

        [GET("Summary/Map")]
        public virtual ActionResult Map()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();
            return View("Map", "_Layout2");

        }
        
    }
}
