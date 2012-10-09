using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    [RestfulRouteConvention]
    public partial class EstablishmentsController : Controller
    {
        //private readonly IQueryEntities _queryEntities;

        //public EstablishmentsController(IQueryEntities queryEntities)
        //{
        //    _queryEntities = queryEntities;
        //}

        [HttpGet]
        public virtual ViewResult Index()
        {
            return View();
        }

        [HttpGet]
        public virtual ViewResult New()
        {
            return View();
        }

        [HttpGet]
        public virtual ViewResult Show(int id)
        {
            return View();
        }
    }
}
