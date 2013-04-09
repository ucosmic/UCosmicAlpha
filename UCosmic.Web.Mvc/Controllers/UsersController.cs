using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Identity;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    [TryAuthorize(Roles = RoleName.UserManagers)]
    public partial class UsersController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public UsersController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public virtual ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult New()
        {
            return View();
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
                    var user = _queryProcessor.Execute(new UserById(id.Value));
                    TempData.Flash("User '{0}' was successfully created.", user.Name);
                    return RedirectToAction(MVC.Users.Index());
                }
            }
            return HttpNotFound();
        }
    }
}
