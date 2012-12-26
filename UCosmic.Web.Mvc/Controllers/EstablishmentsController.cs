using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    public partial class EstablishmentsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [TryAuthorize(Roles = "Establishment Administrator")]
        public virtual ViewResult Index()
        {
            return View();
        }

        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Establishments.Views.Form);
        }

        public virtual ViewResult Create()
        {
            return null;
        }

        [TryAuthorize(Roles = "Establishment Administrator")]
        public virtual ActionResult Show(int id)
        {
            var entity = _queryProcessor.Execute(new EstablishmentById(id));
            if (entity == null)
                return HttpNotFound();

            ViewBag.Id = id;
            return View(MVC.Establishments.Views.Form);
        }

        public virtual ViewResult Edit(int id)
        {
            return null;
        }

        public virtual ViewResult Update(int id)
        {
            return null;
        }

        public virtual ViewResult Delete(int id)
        {
            return null;
        }

        public virtual ViewResult Destroy(int id)
        {
            return null;
        }
    }
}
