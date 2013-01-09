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

        /* If IsPrimary is true, JobTitles is considered Working Title. */
        public string JobTitles { get; protected internal set; }

        /* Default affiliation should be linked to a University type Establishment. */
        public bool IsDefault { get; protected internal set; }

        /* Primary affiliation is the Department (or College) the employee is primarily associated with. */
        public bool IsPrimary { get; protected internal set; }

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