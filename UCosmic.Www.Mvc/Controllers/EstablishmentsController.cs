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

        public virtual ViewResult Index()
        {
            return View();
        }

        public virtual ViewResult New()
        {
            return View();
        }

        public virtual ViewResult Create()
        {
            return null;
        }

        public virtual ViewResult Show(int id)
        {
            ViewBag.Id = id;
            return View();
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
