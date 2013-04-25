using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityLocation : RevisableEntity
    {
        protected bool Equals(ActivityLocation other)
        {
            return PlaceId == other.PlaceId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityLocation) obj);
        }

        public override int GetHashCode()
        {
            return PlaceId;
        }

        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual Place Place { get; set; }
        public int PlaceId { get; set; }
    }
}
