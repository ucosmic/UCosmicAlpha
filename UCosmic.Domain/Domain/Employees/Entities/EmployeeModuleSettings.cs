using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettings : Entity
    {
        protected internal EmployeeModuleSettings()
        {
            FacultyRanks = new Collection<EmployeeFacultyRank>();
            NotifyAdminOnUpdate = false;
        }

        public int EmployeeModuleSettingsId { get; set; }
        public ICollection<EmployeeFacultyRank> FacultyRanks { get; protected internal set; }
        public bool NotifyAdminOnUpdate { get; protected internal set; }
        public Person NotifyAdmin { get; protected internal set; }
        public string PersonalInfoAnchorText { get; protected internal set; }

        public virtual Establishment ForEstablishment { get; protected internal set; }
    }
}
