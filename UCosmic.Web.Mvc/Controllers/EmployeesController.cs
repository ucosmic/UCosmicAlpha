using System;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Controllers
{
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class EmployeesController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _queryEntities;

        public EmployeesController(IProcessQueries queryProcessor, IQueryEntities queryEntities)
        {
            _queryProcessor = queryProcessor;
            _queryEntities = queryEntities;
        }

        [GET("employees")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("{domain}/employees")]
        public virtual ActionResult TenantIndex(string domain)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesDomain = domain;
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            return View();
        }

        [GET("{domain}/employees/search")]
        public virtual ActionResult Search(string domain)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (establishment == null) return HttpNotFound();
            ViewBag.EmployeesDomain = domain;
            ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            return View();
        }

    }
}
