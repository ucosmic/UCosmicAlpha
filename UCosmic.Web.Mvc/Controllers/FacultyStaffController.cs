using System;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    //[RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class FacultyStaffController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public FacultyStaffController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("facultystaff")]
        public virtual ActionResult Index()
        {
            FacultyStaffFilterModel model = new FacultyStaffFilterModel
            {
                FilterType = "activities",
                FromDate = new DateTime(1900,1,1),
                ToDate = null,
                LocationIds = new int[0],
                TypeIds = new int[0],
                InstitutionId  = 0,
                CampusId = null,
                CollegeId = null,
                DepartmentId = null
            };

            if (!String.IsNullOrEmpty(User.Identity.Name))
            {
                var establishment =
                    _queryProcessor.Execute(new EstablishmentByEmail(User.Identity.Name.GetEmailDomain()));
                if (establishment != null)
                {
                    model.InstitutionId = establishment.RevisionId;
                }
            }

            return View(model);
        }
    }
}
