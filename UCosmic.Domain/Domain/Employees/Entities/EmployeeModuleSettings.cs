﻿using System.Collections.Generic;
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
            
            OfferCountry = true;
            OfferActivityType = true;
            OfferFundingQuestions = true;
            InternationalPedigreeTitle = "International Pedigree";
            ReportsDefaultYearRange = 10;
        }

        // EstablishmentId is the primary key
        public int EstablishmentId { get; protected set; }
        public virtual Establishment Establishment { get; protected internal set; }

        public virtual ICollection<EmployeeFacultyRank> FacultyRanks { get; protected internal set; }
        public virtual ICollection<EmployeeActivityType> ActivityTypes { get; protected internal set; }
        public bool NotifyAdminOnUpdate { get; protected internal set; }
        public virtual ICollection<Person> NotifyAdmins { get; protected internal set; }
        public string PersonalInfoAnchorText { get; protected internal set; }

        public bool OfferCountry { get; protected internal set; }
        public bool OfferActivityType { get; protected internal set; }
        public bool OfferFundingQuestions { get; protected internal set; }
        public string InternationalPedigreeTitle { get; protected internal set; }

        /* Used on Faculty & Staff page as look-back period for column chart and line chart */
        public int? ReportsDefaultYearRange { get; protected internal set; }

        /* Faculty & Staff Global View icon */
        public int? GlobalViewIconLength { get; protected internal set; }
        public string GlobalViewIconMimeType { get; protected internal set; }
        public string GlobalViewIconName { get; protected internal set; }
        public string GlobalViewIconPath { get; protected internal set; }
        private string _globalViewIconFileName;
        public string GlobalViewIconFileName
        {
            get { return (string.IsNullOrWhiteSpace(_globalViewIconFileName)) ? GlobalViewIconName : _globalViewIconFileName; }
            protected internal set { _globalViewIconFileName = value; }
        }

        /* Faculty & Staff Find an Expert icon */
        public int? FindAnExpertIconLength { get; protected internal set; }
        public string FindAnExpertIconMimeType { get; protected internal set; }
        public string FindAnExpertIconName { get; protected internal set; }
        public string FindAnExpertIconPath { get; protected internal set; }
        private string _findAnExpertIconFileName;
        public string FindAnExpertIconFileName
        {
            get { return (string.IsNullOrWhiteSpace(_findAnExpertIconFileName)) ? FindAnExpertIconName : _findAnExpertIconFileName; }
            protected internal set { _findAnExpertIconFileName = value; }
        }
    }
}
