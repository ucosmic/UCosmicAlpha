using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Affiliations
{
    public class Affiliation : RevisableEntity
    {
        protected bool Equals(Affiliation other)
        {
            return string.Equals(Title, other.Title) &&
                    string.Equals(FieldOfStudy, other.FieldOfStudy) &&
                    YearAwarded == other.YearAwarded &&
                    InstitutionId == other.InstitutionId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((Affiliation)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = (Title != null ? Title.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (FieldOfStudy != null ? FieldOfStudy.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (YearAwarded.HasValue ? YearAwarded.Value : 0);
                hashCode = (hashCode * 397) ^ (InstitutionId.HasValue ? InstitutionId.Value : 0);
                return hashCode;
            }
        }

        public Affiliation()
        {
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public string Title { get; protected internal set; }
        public string FieldOfStudy { get; protected internal set; }
        public int? YearAwarded { get; protected internal set; }
        public virtual Establishment Institution { get; protected internal set; }
        public int? InstitutionId { get; protected internal set; }
    }
}
