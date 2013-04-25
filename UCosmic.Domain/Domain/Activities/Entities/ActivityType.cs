using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class ActivityType : RevisableEntity
    {
        protected bool Equals(ActivityType other)
        {
            return TypeId == other.TypeId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityType) obj);
        }

        public override int GetHashCode()
        {
            return TypeId;
        }

        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual EmployeeActivityType Type { get; set; }
        public int TypeId { get; set; }
    }
}
