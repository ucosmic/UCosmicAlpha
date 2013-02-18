using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    [TryAuthorize(Roles = RoleName.EstablishmentAdministrator)]
    public partial class EstablishmentsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public virtual ViewResult Index()
        {
            return View();
        }

        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Establishments.Views.Form);
        }

        [GET("created")]
        public virtual ActionResult Created(string location)
        {
            if (!string.IsNullOrWhiteSpace(location))
            {
                // strip id out of location header
                var id = location.GetLastInt();

                if (id.HasValue)
                {
                    TempData.Flash("Establishment was successfully created.");
                    return RedirectToAction(MVC.Establishments.Show(id.Value));
                }
            }
            return HttpNotFound();
        }

        public virtual ActionResult Show(int id)
        {
            var entity = _queryProcessor.Execute(new EstablishmentById(id));
            if (entity == null)
                return HttpNotFound();

            ViewBag.Id = id;
            return View(MVC.Establishments.Views.Form);
        }

        //public virtual ViewResult Edit(int id)
        //{
        //    return null;
        //}

        //public virtual ViewResult Update(int id)
        //{
        //    return null;
        //}

        //public virtual ViewResult Delete(int id)
        //{
        //    return null;
        //}

        //public virtual ViewResult Destroy(int id)
        //{
        //    return null;
        //}
    }
}
