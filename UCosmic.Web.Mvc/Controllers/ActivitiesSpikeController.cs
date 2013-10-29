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
                Content = "Lorem ipsum dolor sit amet, te quo nonumy putent eruditi, eam in iriure feugiat meliore. In est agam alterum assueverit. Sit cu error pertinacia, est illud nemore constituto id. Qui eu ridens legendos indoctum, qui ad elitr vituperata. Est sumo everti disputando cu, ea decore posidonium mei, eu duo mundi definitiones.In inani virtute mea, cu suavitate accusamus usu. Per altera graeci in, nam eu nonumy detraxit gloriatur. Te pro zril nostro. Qui at dicant dignissim moderatius, iudico exerci qui in. Quis augue dissentiunt vis ut, qui ad cibo illud deserunt.Assum nominati ne has. Has regione moderatius in, sea id consul invenire eleifend. Omnes facete ius ea. Tollit copiosae menandri has ei, id usu sanctus lucilius, quando propriae id vis. Dictas quaeque euripidis his et, pri id inani veniam, vim et alii voluptatum. Mea an timeam deseruisse, no mandamus honestatis complectitur ius.",
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
                    Text = "type text",
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
                        Text = "tag text",
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
                        Title = "doc title",
                        FileName = "filename",
                        ByteCount = 23452345
                    },
                    new ActivityDocumentApiModel
                    {
                        ActivityId = 1,
                        DocumentId = 2,
                        Title = "doc title2",
                        FileName = "filename",
                        ByteCount = 23452345
                    }
                }
            };
            return View(model);
        }

    }
}
