using System;
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
            return other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as ActivityType);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }
    }
}
