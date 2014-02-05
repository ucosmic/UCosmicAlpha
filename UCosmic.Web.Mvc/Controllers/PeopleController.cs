using System;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.GeographicExpertise;
using UCosmic.Web.Mvc.Models;
using UCosmic.Domain.People;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.LanguageExpertise;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class PeopleController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEmailAddress> _createEmailAddress;
        private readonly IHandleCommands<DeleteEmailAddress> _deleteEmailAddress;

        public PeopleController(IProcessQueries queryProcessor, IHandleCommands<CreateEmailAddress> createEmailAddress, IHandleCommands<DeleteEmailAddress> deleteEmailAddress)
        {
            _queryProcessor = queryProcessor;
            _createEmailAddress = createEmailAddress;
            _deleteEmailAddress = deleteEmailAddress;
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}")]
        public virtual ActionResult Index(int personId)
        {
            var person = _queryProcessor.Execute(new PersonById(personId));
            if (person == null) return HttpNotFound();

            ViewBag.CustomBib = person.DisplayName;
            ViewBag.personId = personId;
            ViewBag.UserName = person.User != null ? person.User.Name : null;
            ViewBag.currentPage = "profile";
            return View();
        }

        [GET("people/{personId:int}/card")]
        [ChildActionOnly]
        public virtual ActionResult GetCard(int personId)
        {
            var model = GetPerson(personId);
            if (model == null)
            {
                return HttpNotFound();
            }
            return PartialView(MVC.People.Views._Card, model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}/index_spike")]
        public virtual ActionResult Index_Spike(int personId)
        {
            ViewBag.personId = personId;
            ViewBag.currentPage = "profile";
            var model = GetPerson(personId);
            if (model == null)
            {
                return HttpNotFound();
            }
            ViewBag.CustomBib = model.DisplayName;
            return View(MVC.People.Views.Index_Spike, model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}/activities")]
        public virtual ActionResult Activities(int personId, ActivityPublicInputModel input)
        {
            var person = _queryProcessor.Execute(new PersonById(personId));
            if (person == null) return HttpNotFound();

            var query = new ActivityValuesPageBy
            {
                Principal = User,
                PersonId = personId,
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Tags,
                    x => x.Documents,
                    x => x.Types.Select(y => y.Type),
                    x => x.Locations.Select(y => y.Place),
                    x => x.Activity.Person.Emails,
                },
            };
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfActivityPublicViewModel>(entities);

            ViewBag.CustomBib = person.DisplayName;
            ViewBag.keyword = input.Keyword;
            ViewBag.personId = personId;
            ViewBag.countryCode = input.CountryCode;
            ViewBag.orderBy = input.OrderBy;
            var personModel = GetPerson(personId);

            ViewBag.Username = personModel.Username;
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}/degrees")]
        public virtual ActionResult Degrees(int personId, DegreeSearchInputModel input)
        {
            var person = _queryProcessor.Execute(new PersonById(personId));
            if (person == null) return HttpNotFound();

            var query = new DegreesByPersonId(personId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfDegreePublicViewModel>(entities);
            ViewBag.CustomBib = person.DisplayName;
            ViewBag.currentPage = "degrees";
            ViewBag.personId = personId;
            
            var personModel = GetPerson(personId);
            ViewBag.Username = personModel.Username;
            return View(model);
        }

        private PersonViewModel GetPerson(int personId)
        {
            var entity = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations,
                    x => x.Emails,
                }

            });
            return entity == null ? null : Mapper.Map<PersonViewModel>(entity);
        }

        [GET("people/{personId:int}/affiliations")]
        [ChildActionOnly]
        public virtual ActionResult GetAffiliations(int personId)
        {
            var query = new AffiliationsByPerson(User, personId)
            {
                EagerLoad = new Expression<Func<Affiliation, object>>[]
                {
                    x => x.Establishment.Ancestors.Select(y => y.Ancestor.Names),
                }
            };
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<AffiliationViewModel[]>(entities.Where(x => !x.IsDefault));

            return PartialView(MVC.People.Views._Affiliations, model);
        }

        [GET("people/{personId:int}/emails")]
        [ChildActionOnly]
        public virtual ActionResult GetEmails(int personId)
        {
            var model = GetPerson(personId);

            return model == null ? null : PartialView(MVC.People.Views._Emails, model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}/language-expertise")]
        public virtual ActionResult Languages(int personId)
        {
            var person = _queryProcessor.Execute(new PersonById(personId));
            if (person == null) return HttpNotFound();

            var query = new LanguageExpertisesByPersonId(personId);
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<LanguageExpertiseViewModel[]>(entities);

            ViewBag.CustomBib = person.DisplayName;
            ViewBag.currentPage = "languages";
            ViewBag.personId = personId;

            var personModel = GetPerson(personId);
            
            ViewBag.Username = personModel.Username;
            return View(model);
        }

        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("people/{personId:int}/global-expertise")]
        public virtual ActionResult GlobalExpertises(int personId)
        {
            var person = _queryProcessor.Execute(new PersonById(personId));
            if (person == null) return HttpNotFound();

            var query = new GeographicExpertisesByPersonId(personId);
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<GeographicExpertiseApiModel[]>(entities);

            ViewBag.CustomBib = person.DisplayName;
            ViewBag.currentPage = "global-expertise";
            ViewBag.personId = personId;
            var personModel = GetPerson(personId);

            ViewBag.Username = personModel.Username;
            return View(model);
        }

        [Authorize]
        [POST("people/{personId:int}/emails")]
        public virtual ActionResult Emails(int personId, EmailAddressPostModel model)
        {
            if (ModelState.IsValid)
            {
                var myPerson = _queryProcessor.Execute(new MyPerson(User)
                {
                    EagerLoad = new Expression<Func<Person, object>>[]
                    {
                        x => x.User,
                    }
                });
                if (!myPerson.User.Name.Equals(User.Identity.Name, StringComparison.OrdinalIgnoreCase))
                    ModelState.AddModelError(model.PropertyName(x => x.Value), "You are not authorized to add email addresses for this person.");
            }

            if (!ModelState.IsValid)
            {
                var firstError = ModelState.Values.SelectMany(x => x.Errors.Select(y => y.ErrorMessage)).First();
                TempData.Flash("Could not add new email address: {0}", firstError);
            }
            else
            {
                var command = new CreateEmailAddress(model.Value, model.PersonId);
                _createEmailAddress.Handle(command);
                TempData.Flash("Email address '{0}' was successfully added", model.Value);
            }
            return RedirectToAction(MVC.People.Index(personId));
        }

        [Authorize]
        [DELETE("people/{personId:int}/emails/{emailNumber}")]
        public virtual ActionResult DeleteEmail(int personId, int emailNumber)
        {
            if (ModelState.IsValid)
            {
                var myPerson = _queryProcessor.Execute(new MyPerson(User)
                {
                    EagerLoad = new Expression<Func<Person, object>>[]
                    {
                        x => x.User,
                    }
                });
                if (!myPerson.User.Name.Equals(User.Identity.Name, StringComparison.OrdinalIgnoreCase))
                    ModelState.AddModelError("", "You are not authorized to delete email addresses for this person.");
            }

            if (!ModelState.IsValid)
            {
                var firstError = ModelState.Values.SelectMany(x => x.Errors.Select(y => y.ErrorMessage)).First();
                TempData.Flash("Could not add new email address: {0}", firstError);
            }
            else
            {
                var emailAddress = _queryProcessor.Execute(new MyEmailAddressByNumber(User, emailNumber));
                if (emailAddress != null)
                {
                    var command = new DeleteEmailAddress(User, personId, emailNumber);
                    _deleteEmailAddress.Handle(command);
                    TempData.Flash("Email address '{0}' was successfully deleted", emailAddress.Value);
                }
            }
            return RedirectToAction(MVC.People.Index(personId));
        }
    }
}
