using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class ActivitiesSpikeController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public ActivitiesSpikeController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("activitiesspike/{activityId:int}")]
        public virtual ActionResult ActivitiesSpike(int activityId)
        {
            var model = new ActivityPublicViewModel
            {
                //Mode = new ActivityMode(),
                Title = "Understanding Causation of the Permian/Triassic Boundary, Largest Mass Extinction in Earth History",
                Content = "Permian/Triassic (P/Tr) Boundary Global Events—The P/Tr boundary represents the largest mass extinction in Earth history, yet its causes remain uncertain. I am investigating critical questions related to the extent and intensity of Permo-Triassic deep-ocean anoxia, patterns of upwelling of toxic sulfidic waters onto shallow-marine shelves and platforms, and the relationship of such events to global C-isotopic excursions and the delayed recovery of marine biotas during the Early Triassic. I am working on the P/Tr boundary globally.",
                StartsOn = new DateTime(2010, 11, 18),
                StartsFormat = "M/yyyy",
                OnGoing = true,
                IsExternallyFunded = true,
                IsInternallyFunded = true,
                UpdatedByPrincipal = "yes",
                //UpdatedOnUtc = new DateTime(1985, 12, 14),
                Types = new ActivityTypeViewModel[]
                {
                    new ActivityTypeViewModel{
                    TypeId = 1,
                    Text = "Research or Creative Endeavor",
                    },
                    new ActivityTypeViewModel{
                    TypeId = 2,
                    Text = "Teaching or Mentoring",
                    },
                    new ActivityTypeViewModel{
                    TypeId = 5,
                    Text = "Professional Development, Service or Consulting",
                    }
                },
                Places = new ActivityPlaceViewModel[]
                {
                    new ActivityPlaceViewModel
                    {
                        //PlaceId = 1,
                        PlaceName = "Canada"
                    },
                    new ActivityPlaceViewModel
                    {
                        //PlaceId = 2,
                        PlaceName = "Columbia"
                    }
                },
                Tags = new ActivityTagViewModel[]
                {
                    new ActivityTagViewModel
                    {
                        Text = "Vietnam",
                        //DomainType = new ActivityTagDomainType(),
                        //DomainKey = 2
                    },
                    new ActivityTagViewModel
                    {
                        Text = "India",
                        //DomainType = new ActivityTagDomainType(),
                        //DomainKey = 2
                    }
                },
                Documents = new ActivityDocumentApiModel[]
                {
                    new ActivityDocumentApiModel
                    {
                        //ActivityId = 1,
                        DocumentId = 1,
                        Title = "Dissertation Excerpt",
                        FileName = "02E6D488-B3FA-4D79-848F-303779A53ABE.docx",
                        //ByteCount = 23452345
                    },
                    new ActivityDocumentApiModel
                    {
                        //ActivityId = 1,
                        DocumentId = 2,
                        Title = "Research Funding Breakdown",
                        FileName = "10EC87BD-3A95-439D-807A-0F57C3F89C8A.xls",
                        //ByteCount = 23452345
                    }
                }
            };
            return View(model);
        }

    }
}
