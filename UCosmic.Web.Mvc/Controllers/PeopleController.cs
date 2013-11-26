using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Web.Mvc.Models;
using UCosmic.Domain.People;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class PeopleController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public PeopleController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("people/{personId:int}")]
        public virtual ActionResult Index(int personId)
        {
            ViewBag.personId = personId;
            return View();
        }

        [GET("people/{personId:int}/card")]
        [ChildActionOnly]
        public virtual ActionResult GetCard(int personId)
        {
            var entity = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations,
                    x => x.Emails,
                }

            });
            if (entity == null) return HttpNotFound();

            var model = Mapper.Map<PersonViewModel>(entity);

            return PartialView(MVC.People.Views._Card, model);
        }

        [GET("people/{personId:int}/activities")]
        public virtual ActionResult Activities(int personId, ActivityPublicInputModel input)
        {
            var query = new ActivitiesByPersonId(User, personId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfActivityPublicViewModel>(entities);
            ViewBag.keyword = input.Keyword;
            ViewBag.personId = personId;
            ViewBag.countryCode = input.CountryCode;
            ViewBag.orderBy = input.OrderBy;
            return View(model);
        }

        [GET("people/{personId:int}/degrees")]
        public virtual ActionResult Degrees(int personId, DegreeSearchInputModel input)
        {
            var query = new DegreesByPersonId(personId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfDegreePublicViewModel>(entities);
            return View(model);
        }
    }
}
