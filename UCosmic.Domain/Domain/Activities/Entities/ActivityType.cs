using System;
using System.Globalization;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class ActivityType : RevisableEntity, IEquatable<ActivityType>
    {
        protected internal ActivityType()
        {
        }

        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual EmployeeActivityType Type { get; set; }
        public int TypeId { get; set; }

        public bool Equals(ActivityType other)
        {
            return other != null &&
                   TypeId == other.TypeId &&
                   ActivityValuesId == other.ActivityValuesId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return ReferenceEquals(this, obj) || Equals(obj as ActivityType);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = TypeId.GetHashCode();
                hashCode = (hashCode * 397) ^ ActivityValuesId.GetHashCode();
                return hashCode;
            }
        }
    }
}
