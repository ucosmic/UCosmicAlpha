using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;
using System.Web;

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
            var model = new ActivityPublicViewModel();

            var entity = _queryProcessor.Execute(new PublicActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Types.Select(y => y.Type),
                    x => x.Locations.Select(y => y.Place),
                    x => x.Tags,
                    x => x.Documents,
                    x => x.Activity.Person.Emails,
                }

            });
            if (entity == null) return HttpNotFound();

            model = Mapper.Map<ActivityPublicViewModel>(entity);

            //model.Content = new HtmlString("<p>Permian/Triassic (P/Tr) Boundary Global Even....<p>");

            return View(model);
        }

    }
}
