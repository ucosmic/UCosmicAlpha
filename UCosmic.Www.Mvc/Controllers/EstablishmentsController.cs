using System.Web.Mvc;
using UCosmic;

namespace UCosmicLayout3.Controllers
{
    public partial class EstablishmentsController : Controller
    {
        private readonly IQueryEntities _queryEntities;

        public EstablishmentsController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
