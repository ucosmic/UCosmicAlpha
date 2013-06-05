using System;
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
            ActivityTypes = new Collection<EmployeeActivityType>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
            NotifyAdminOnUpdate = false;
            OfferCountry = true;
            OfferActivityType = true;
            OfferFundingQuestions = true;
            InternationalPedigreeTitle = "International Pedigree";
        }

        public int Id { get; set; }
        public virtual ICollection<EmployeeFacultyRank> FacultyRanks { get; protected internal set; }
        public virtual ICollection<EmployeeActivityType> ActivityTypes { get; protected internal set; }
        public bool NotifyAdminOnUpdate { get; protected internal set; }
        public virtual ICollection<Person> NotifyAdmins { get; protected internal set; }
        public string PersonalInfoAnchorText { get; protected internal set; }
        public virtual Establishment Establishment { get; protected internal set; }
        public bool OfferCountry { get; protected internal set; }
        public bool OfferActivityType { get; protected internal set; }
        public bool OfferFundingQuestions { get; protected internal set; }
        public string InternationalPedigreeTitle { get; protected internal set; }
        /* We should probably move these elsewhere. */
        public DateTime? EstablishmentsExternalSyncDate { get; protected internal set; }
        public DateTime? EstablishmentsLastUpdateAttempt { get; protected internal set; }
        public int? EstablishmentsUpdateFailCount { get; protected internal set; }
        public string EstablishmentsLastUpdateResult { get; protected internal set; } /* success, inprogress, failed */
    }
}
