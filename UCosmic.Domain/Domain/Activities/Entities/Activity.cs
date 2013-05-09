using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class Activity : RevisableEntity, IAmNumbered
    {
        protected bool Equals(Activity other)
        {
            return PersonId == other.PersonId &&
                   Number == other.Number &&
                   string.Equals(ModeText, other.ModeText) &&
                   Equals(Values, other.Values);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((Activity) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = PersonId;
                hashCode = (hashCode*397) ^ Number;
                hashCode = (hashCode*397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Values != null ? Values.GetHashCode() : 0);
                return hashCode;
            }
        }

        public bool IsEmpty()
        {
            bool empty = true;

            if (Values != null)
            {
                foreach (var value in Values)
                {
                    empty &= value.IsEmpty();
                }
            }
            else
            {
                empty = true;
            }

            return empty;
        }

        public Activity()
        {
            _mode = ActivityMode.Draft;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Values = new Collection<ActivityValues>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public int Number { get; protected internal set; }

        private ActivityMode _mode;

        public string ModeText
        {
            get { return _mode.AsSentenceFragment(); }
            set { _mode = value.AsEnum<ActivityMode>(); }
        }

        public ActivityMode Mode
        {
            get { return _mode; }
            set { _mode = value; }
        }

        public virtual ICollection<ActivityValues> Values { get; protected internal set; }

        public int? EditSourceId { get; protected internal set; }
    }
}
