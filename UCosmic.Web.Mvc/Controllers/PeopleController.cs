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

            //var model = new PersonViewModel();

            //var entity = _queryProcessor.Execute(new PersonViewModelById(User, personId)
            //{
            //    EagerLoad = new Expression<Func<Person, object>>[]
            //    {
            //        x => x.Affiliations,
            //        x => x.Emails,
            //    }

            //});
            //if (entity == null) return HttpNotFound();

            //model = Mapper.Map<PersonViewModel>(entity);

            //model.Content = new HtmlString("<p>Permian/Triassic (P/Tr) Boundary Global Even....<p>");
            //model.Person.EmailAddress = "aReallyLongEmail@aReallyLongDomain.usf.edu";
            //model.Person.DisplayName = "aReally Long DISPLAY name";
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

            //model.Content = new HtmlString("<p>Permian/Triassic (P/Tr) Boundary Global Even....<p>");
            //model.Person.EmailAddress = "aReallyLongEmail@aReallyLongDomain.usf.edu";
            //model.Person.DisplayName = "aReally Long DISPLAY name";
            return PartialView(MVC.People.Views._Card, model);
        }

        [GET("people/{personId:int}/activities")]
        public virtual ActionResult Activities(int personId)
        {
            //I may want to make a personactivitiesviewmodel that contains a list of activities

            var model = new PersonViewModel();

            var entity = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.DefaultAffiliation.JobTitles,
                    x => x.Emails,
                }

            });
            if (entity == null) return HttpNotFound();

            model = Mapper.Map<PersonViewModel>(entity);

            //model.Content = new HtmlString("<p>Permian/Triassic (P/Tr) Boundary Global Even....<p>");
            //model.Person.EmailAddress = "aReallyLongEmail@aReallyLongDomain.usf.edu";
            //model.Person.DisplayName = "aReally Long DISPLAY name";
            return View(model);
        }
    }
}
