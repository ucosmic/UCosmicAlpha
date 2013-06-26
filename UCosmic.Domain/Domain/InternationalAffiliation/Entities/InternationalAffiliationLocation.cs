using UCosmic.Domain.Places;

namespace UCosmic.Domain.InternationalAffiliations
{
    public class InternationalAffiliationLocation : RevisableEntity
    {
        protected bool Equals(InternationalAffiliationLocation other)
        {
            return PlaceId == other.PlaceId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((InternationalAffiliationLocation)obj);
        }

        public override int GetHashCode()
        {
            return PlaceId;
        }

        public virtual InternationalAffiliation InternationalAffiliation { get; set; }
        public int InternationalAffiliationId { get; set; }

        public virtual Place Place { get; set; }
        public int PlaceId { get; set; }
    }
}
