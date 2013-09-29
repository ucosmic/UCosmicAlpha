using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        public const string DefaultDateFormat = "MM/dd/yyyy";

        protected internal ActivityValues()
        {
            Mode = ActivityMode.Draft;
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Locations = new Collection<ActivityLocation>();
            Types = new Collection<ActivityType>();
            Tags = new Collection<ActivityTag>();
            Documents = new Collection<ActivityDocument>();
            DateFormat = DefaultDateFormat; // "Custom Date and Time Format Strings" http://msdn.microsoft.com/en-us/library/8kb3ddd4.aspx
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Activity Activity { get; protected internal set; }
        public int ActivityId { get; protected internal set; }

        public string Title { get; protected internal set; }
        public string Content { get; protected internal set; }

        /* Rules for StartsOn and EndsOn:
         * 
         * 1. StartsOn must be equal to or earlier than EndsOn
         * 2. StartsOn and EndsOn may or may not have a value
         * 3. Both are stored in UTC
         */

        private DateTime? _startsOn;
        public DateTime? StartsOn
        {
            get
            {
                return _startsOn.HasValue ? _startsOn.Value.ToLocalTime() : (DateTime?)null;
            }

            protected internal set
            {
                _startsOn = value.HasValue ? value.Value.ToUniversalTime() : (DateTime?)null;
                OrderTime();
            }
        }

        private DateTime? _endsOn;
        public DateTime? EndsOn
        {
            get
            {
                return _endsOn.HasValue ? _endsOn.Value.ToLocalTime() : (DateTime?)null;
            }

            protected internal set
            {
                _endsOn = value.HasValue ? value.Value.ToUniversalTime() : (DateTime?)null;
                OrderTime();
            }
        }

        public bool? OnGoing { get; protected internal set; }
        public string DateFormat { get; protected internal set; }
        public virtual ICollection<ActivityLocation> Locations { get; protected set; }
        public virtual ICollection<ActivityType> Types { get; protected set; }
        public virtual ICollection<ActivityTag> Tags { get; protected set; }
        public virtual ICollection<ActivityDocument> Documents { get; protected internal set; }
        public string ModeText { get; protected set; }
        public ActivityMode Mode
        {
            get { return ModeText.AsEnum<ActivityMode>(); }
            protected internal set { ModeText = value.AsSentenceFragment(); }
        }
        public bool? WasExternallyFunded { get; protected internal set; }
        public bool? WasInternallyFunded { get; protected internal set; }

        private void OrderTime()
        {
            if (_startsOn.HasValue && _endsOn.HasValue)
            {
                if (_startsOn.Value.CompareTo(_endsOn.Value) > 0)
                {
                    DateTime temp = _endsOn.Value;
                    _endsOn = _startsOn.Value;
                    _startsOn = temp;
                }
            }
        }
    }
}
