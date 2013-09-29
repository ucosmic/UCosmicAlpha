using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class ActivityType : RevisableEntity
    {
        protected internal ActivityType()
        {
        }

        public virtual ActivityValues ActivityValues { get; set; }
        public int ActivityValuesId { get; set; }

        public virtual EmployeeActivityType Type { get; set; }
        public int TypeId { get; set; }
    }
}
