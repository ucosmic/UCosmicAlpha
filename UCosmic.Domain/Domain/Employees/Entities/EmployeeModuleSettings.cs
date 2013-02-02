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
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            FacultyRanks = new Collection<EmployeeFacultyRank>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
            NotifyAdminOnUpdate = false;
        }

        public int Id { get; set; }
        public virtual ICollection<EmployeeFacultyRank> FacultyRanks { get; protected internal set; }
        public bool NotifyAdminOnUpdate { get; protected internal set; }
        public virtual ICollection<Person> NotifyAdmins { get; protected internal set; }
        public string PersonalInfoAnchorText { get; protected internal set; }

        public virtual Establishment Establishment { get; protected internal set; }
    }
}
