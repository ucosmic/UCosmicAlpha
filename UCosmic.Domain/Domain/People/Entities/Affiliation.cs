using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class Affiliation : RevisableEntity
    {
        protected bool Equals(Affiliation other)
        {
            return  EstablishmentId == other.EstablishmentId &&
                    string.Equals(JobTitles, other.JobTitles) &&
                    IsDefault.Equals(other.IsDefault) &&
                    IsAcknowledged.Equals(other.IsAcknowledged) &&
                    IsClaimingStudent.Equals(other.IsClaimingStudent) &&
                    IsClaimingEmployee.Equals(other.IsClaimingEmployee) &&
                    IsClaimingInternationalOffice.Equals(other.IsClaimingInternationalOffice) &&
                    IsClaimingAdministrator.Equals(other.IsClaimingAdministrator) &&
                    IsClaimingFaculty.Equals(other.IsClaimingFaculty) &&
                    IsClaimingStaff.Equals(other.IsClaimingStaff) &&
                    CampusId == other.CampusId &&
                    CollegeId == other.CollegeId &&
                    DepartmentId == other.DepartmentId &&
                    FacultyRankId == other.FacultyRankId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((Affiliation) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = EstablishmentId;
                hashCode = (hashCode*397) ^ (JobTitles != null ? JobTitles.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ IsDefault.GetHashCode();
                hashCode = (hashCode*397) ^ IsAcknowledged.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingStudent.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingEmployee.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingInternationalOffice.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingAdministrator.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingFaculty.GetHashCode();
                hashCode = (hashCode*397) ^ IsClaimingStaff.GetHashCode();
                hashCode = (hashCode*397) ^ CampusId.GetHashCode();
                hashCode = (hashCode*397) ^ CollegeId.GetHashCode();
                hashCode = (hashCode*397) ^ DepartmentId.GetHashCode();
                hashCode = (hashCode*397) ^ FacultyRankId.GetHashCode();
                return hashCode;
            }
        }

        protected internal Affiliation()
        {
        }

        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected internal set; }

        public int EstablishmentId { get; protected internal set; }
        public virtual Establishment Establishment { get; protected internal set; }

        // TODO: temporary until data is moved to Employee entity.
        public string JobTitles { get; protected internal set; }

        /* Default affiliation should be linked to a University type Establishment. */
        public bool IsDefault { get; protected internal set; }

        public bool IsAcknowledged { get; protected internal set; }
        public bool IsClaimingStudent { get; protected internal set; }
        public bool IsClaimingEmployee { get; protected internal set; }

        public bool IsClaimingInternationalOffice { get; protected internal set; }
        public bool IsClaimingAdministrator { get; protected internal set; }
        public bool IsClaimingFaculty { get; protected internal set; }
        public bool IsClaimingStaff { get; protected internal set; }

        public int? CampusId { get; protected internal set; }
        public int? CollegeId { get; protected internal set; }
        public int? DepartmentId { get; protected internal set; }

        public int? FacultyRankId { get; protected internal set; }

        public override string ToString()
        {
            return string.Format("{0} - {1}", Person.DisplayName, Establishment.OfficialName);
        }
    }
}