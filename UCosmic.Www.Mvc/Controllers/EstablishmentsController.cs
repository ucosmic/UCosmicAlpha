using System.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class EstablishmentsController : Controller
    {
        //private readonly IQueryEntities _queryEntities;

        //public EstablishmentsController(IQueryEntities queryEntities)
        //{
        //    _queryEntities = queryEntities;
        //}

        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
