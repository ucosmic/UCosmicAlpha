using System;
using System.Linq;
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
        private readonly ICommandEntities _entities;

        public FacultyStaffController(IProcessQueries queryProcessor, ICommandEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("facultystaff")]
        public virtual ActionResult Index()
        {
            var model = new FacultyStaffInstitutionInfoModel
            {
                InstitutionId = null,
                InstitutionHasCampuses = false,
                ActivityTypes = null
            };

            Establishment establishment = null;

            if (!String.IsNullOrEmpty(User.Identity.Name))
            {
                establishment =
                    _queryProcessor.Execute(new EstablishmentByEmail(User.Identity.Name.GetEmailDomain()));
            }
            else
            {
                var tenancy = Request.Tenancy();
                if (tenancy != null)
                {
                    if (tenancy.TenantId.HasValue)
                    {
                        establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                    }
                    else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                    {
                        establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                    }
                }
            }

            if (establishment != null)
            {
                model.InstitutionId = establishment.RevisionId;

                var campusEstablishmentType =
                    _entities.Get<EstablishmentType>().Single(t => t.EnglishName == "University Campus");
                model.InstitutionHasCampuses = _entities.Get<Establishment>()
                                                        .Count(
                                                            e =>
                                                            (e.Parent.RevisionId == model.InstitutionId) &&
                                                            (e.Type.RevisionId == campusEstablishmentType.RevisionId)) >
                                               0;

                var employeeModuleSettings =
                    _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(model.InstitutionId.Value));
                if (employeeModuleSettings != null)
                {
                    employeeModuleSettings.ActivityTypes.OrderBy(a => a.Rank);

                    model.ActivityTypes = new FacultyStaffActivityType[employeeModuleSettings.ActivityTypes.Count];
                    for (int i = 0; i < employeeModuleSettings.ActivityTypes.Count; i += 1)
                    {
                        model.ActivityTypes[i] = new FacultyStaffActivityType();
                        model.ActivityTypes[i].Id = employeeModuleSettings.ActivityTypes.ElementAt(i).Id;
                        model.ActivityTypes[i].Name = employeeModuleSettings.ActivityTypes.ElementAt(i).Type;
                    }
                }
            }

            return View(model);
        }
    }
}
