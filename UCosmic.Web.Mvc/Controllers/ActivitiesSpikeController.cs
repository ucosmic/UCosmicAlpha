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

        [GET("activitiesspike/{activityId:int}")]
        public virtual ActionResult ActivitiesSpike(int activityId)
        {
            var model = new ActivityPublicViewModel
            {
                Mode = new ActivityMode(),
                Title = "title",
                Content = "content",
                StartsOn = new DateTime(2010, 11, 18),
                EndsOn = new DateTime(2012, 04, 13),
                OnGoing = true,
                IsExternallyFunded = true,
                IsInternallyFunded = true,
                UpdatedByPrincipal = "yes",
                UpdatedOnUtc = new DateTime(1985, 12, 14),
                Types = new ActivityTypeViewModel[]
                {
                    new ActivityTypeViewModel{
                    ActivityId = 1,
                    TypeId = 1,
                    Text = "asdfas",
                    Rank = 1
                    }
                },
                Places = new ActivityPlaceViewModel[]
                {
                    new ActivityPlaceViewModel
                    {
                        ActivityId = 1,
                        PlaceId = 1,
                        PlaceName = "place 1"
                    }
                },
                Tags = new ActivityTagViewModel[]
                {
                    new ActivityTagViewModel
                    {
                        ActivityId = 1,
                        Text = "text",
                        DomainType = new ActivityTagDomainType(),
                        DomainKey = 2
                    }
                },
                Documents = new ActivityDocumentApiModel[]
                {
                    new ActivityDocumentApiModel
                    {
                        ActivityId = 1,
                        DocumentId = 1,
                        Title = "title",
                        FileName = "filename",
                        ByteCount = 23452345
                    }
                }
            };
            return View(model);
        }

    }
}
