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

            var model = new PersonViewModel();

            //var entity = _queryProcessor.Execute(new PersonViewModelById(User, personId)
            //{
            //    EagerLoad = new Expression<Func<Person, object>>[]
            //    {
            //        //x => x.Types.Select(y => y.Type),
            //        //x => x.Locations.Select(y => y.Place),
            //        //x => x.Tags,
            //        //x => x.Documents,
            //        //x => x.Activity.Person.Emails,
            //    }

            //});
            //if (entity == null) return HttpNotFound();

            //model = Mapper.Map<PersonViewModel>(entity);

            //model.Content = new HtmlString("<p>Permian/Triassic (P/Tr) Boundary Global Even....<p>");
            //model.Person.EmailAddress = "aReallyLongEmail@aReallyLongDomain.usf.edu";
            //model.Person.DisplayName = "aReally Long DISPLAY name";
            return View(model);
        }

    }
}
