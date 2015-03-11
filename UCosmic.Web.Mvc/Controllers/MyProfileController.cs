using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class MyProfileController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public MyProfileController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }


        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/degrees/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewDegree()
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.DegreeId = 0;
            return View(MVC.MyProfile.Views.DegreeForm);
        }

        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/degrees/{degreeId:int}")]
        [GET("my/degrees/{degreeId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditDegree(int degreeId)
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.DegreeId = degreeId;
            return View(MVC.MyProfile.Views.DegreeForm);
        }

        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/geographic-expertise/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewGeographicExpertise()
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.ExpertiseId = 0;
            return View(MVC.MyProfile.Views.GeographicExpertiseForm);
        }

        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/geographic-expertise/{expertiseId:int}")]
        [GET("my/geographic-expertise/{expertiseId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditGeographicExpertise(int expertiseId)
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.ExpertiseId = expertiseId;
            return View(MVC.MyProfile.Views.GeographicExpertiseForm);
        }

        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/language-expertise/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewLanguageExpertise()
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.ExpertiseId = 0;
            return View(MVC.MyProfile.Views.LanguageExpertiseForm);
        }

        [Authorize]
        [CurrentModuleTab(ModuleTab.Employees)]
        [GET("my/language-expertise/{expertiseId:int}")]
        [GET("my/language-expertise/{expertiseId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditLanguageExpertise(int expertiseId)
        {
            var person = _queryProcessor.Execute(new MyPerson(User));
            ViewBag.PersonId = person.RevisionId;
            ViewBag.ExpertiseId = expertiseId;
            return View(MVC.MyProfile.Views.LanguageExpertiseForm);
        }
    }
}
