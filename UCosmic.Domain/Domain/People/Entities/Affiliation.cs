using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class Affiliation : Entity
    {
        protected internal Affiliation()
        {
        }

        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected internal set; }

        public int EstablishmentId { get; protected internal set; }
        public virtual Establishment Establishment { get; protected internal set; }
        public virtual EstablishmentCampus Campus { get; protected internal set; }
        public EstablishmentCollege College { get; protected internal set; }
        public EstablishmentDepartment Department { get; protected internal set; }

        public string JobTitles { get; protected internal set; }
        public EstablishmentFacultyRank FacultyRank { get; protected internal set; }

        public bool IsDefault { get; protected internal set; }

        public bool IsAcknowledged { get; protected internal set; }
        public bool IsClaimingStudent { get; protected internal set; }
        public bool IsClaimingEmployee { get; protected internal set; }

        public bool IsClaimingInternationalOffice { get; protected internal set; }
        public bool IsClaimingAdministrator { get; protected internal set; }
        public bool IsClaimingFaculty { get; protected internal set; }
        public bool IsClaimingStaff { get; protected internal set; }

        public override string ToString()
        {
            return string.Format("{0} - {1}", Person.DisplayName, Establishment.OfficialName);
        }
    }
}