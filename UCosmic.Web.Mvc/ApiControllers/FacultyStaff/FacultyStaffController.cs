using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class FacultyStaffController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public FacultyStaffController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [POST("")]
        public FacultyStaffResultsModel Post(FacultyStaffFilterModel filter)
        {
            var model = new FacultyStaffResultsModel();



            return model;
        }
    }
}
