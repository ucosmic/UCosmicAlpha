using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class Activity : RevisableEntity, IAmNumbered, IEquatable<Activity>
    {
        protected internal Activity()
        {
            Mode = ActivityMode.Draft;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Values = new Collection<ActivityValues>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public int Number { get; protected internal set; }

        public string ModeText { get; protected set; }
        public ActivityMode Mode
        {
            get { return ModeText.AsEnum<ActivityMode>(); }
            protected internal set { ModeText = value.AsSentenceFragment(); }
        }

        public virtual ICollection<ActivityValues> Values { get; protected internal set; }

        public int? EditSourceId { get; protected internal set; }

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

            return empty;
        }

        public bool Equals(Activity other)
        {
            return other != null &&
                PersonId == other.PersonId &&
                Number == other.Number &&
                string.Equals(ModeText, other.ModeText) &&
                Equals(Values, other.Values);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return ReferenceEquals(this, obj) || Equals(obj as Activity);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = PersonId;
                hashCode = (hashCode * 397) ^ Number;
                hashCode = (hashCode * 397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Values != null ? Values.GetHashCode() : 0);
                return hashCode;
            }
        }
    }
}
