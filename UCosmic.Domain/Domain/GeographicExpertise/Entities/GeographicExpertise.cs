using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.GeographicExpertises
{
    public class GeographicExpertise : RevisableEntity
    {
        protected bool Equals(GeographicExpertise other)
        {
            return  PlaceId == other.PlaceId &&
                    string.Equals(Description, other.Description);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((GeographicExpertise)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = PlaceId;
                hashCode = (hashCode * 397) ^ (Description != null ? Description.GetHashCode() : 0);
                return hashCode;
            }
        }

        public GeographicExpertise()
        {
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public virtual Place Place { get; protected internal set; }
        public int PlaceId { get; protected internal set; }
        public string Description { get; protected internal set; }
    }
}
