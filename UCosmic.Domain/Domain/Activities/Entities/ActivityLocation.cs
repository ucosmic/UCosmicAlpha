using System;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class ActivityLocation : RevisableEntity, IEquatable<ActivityLocation>
    {
        protected internal ActivityLocation()
        {
        }

        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual Place Place { get; set; }
        public int PlaceId { get; set; }

        public bool Equals(ActivityLocation other)
        {
            return other != null &&
                PlaceId == other.PlaceId &&
                ActivityValuesId == other.ActivityValuesId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return ReferenceEquals(this, obj) || Equals(obj as ActivityLocation);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = PlaceId.GetHashCode();
                hashCode = (hashCode * 397) ^ ActivityValuesId.GetHashCode();
                return hashCode;
            }
        }
    }
}
