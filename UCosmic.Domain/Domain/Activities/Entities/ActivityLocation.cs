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
            return other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as ActivityLocation);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }
    }
}
