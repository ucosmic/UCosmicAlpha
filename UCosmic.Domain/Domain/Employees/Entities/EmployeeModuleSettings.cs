using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Activities;
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
            ActivityTypes = new Collection<ActivityType>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
            NotifyAdminOnUpdate = false;
        }

        public int Id { get; set; }
        public virtual ICollection<EmployeeFacultyRank> FacultyRanks { get; protected internal set; }
        public bool NotifyAdminOnUpdate { get; protected internal set; }
        public virtual ICollection<Person> NotifyAdmins { get; protected internal set; }
        public string PersonalInfoAnchorText { get; protected internal set; }
        public virtual ICollection<ActivityType> ActivityTypes { get; protected internal set; }
        public virtual Establishment Establishment { get; protected internal set; }
        public bool OfferCountry { get; protected internal set; }
        public bool OfferActivityType { get; protected internal set; }
    }
}
