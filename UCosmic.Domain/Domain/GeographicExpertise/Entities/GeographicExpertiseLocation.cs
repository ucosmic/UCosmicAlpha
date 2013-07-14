using UCosmic.Domain.Places;

namespace UCosmic.Domain.GeographicExpertise
{
    public class GeographicExpertiseLocation : RevisableEntity
    {
        protected bool Equals(GeographicExpertiseLocation other)
        {
            return PlaceId == other.PlaceId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((GeographicExpertiseLocation)obj);
        }

        public override int GetHashCode()
        {
            return PlaceId;
        }

        public virtual GeographicExpertise Expertise { get; set; }
        public int ExpertiseId { get; set; }

        public virtual Place Place { get; set; }
        public int PlaceId { get; set; }
    }
}
