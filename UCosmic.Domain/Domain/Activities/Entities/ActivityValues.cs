using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        protected internal ActivityValues()
        {
            Mode = ActivityMode.Draft;
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Locations = new Collection<ActivityLocation>();
            Types = new Collection<ActivityType>();
            Tags = new Collection<ActivityTag>();
            Documents = new Collection<ActivityDocument>();
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

        public DateTime? StartsOn { get; protected internal set; }
        public DateTime? EndsOn { get; protected internal set; }
        public bool? OnGoing { get; protected internal set; }
        public string StartsFormat { get; protected internal set; }
        public string EndsFormat { get; protected internal set; }
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
    }
}
