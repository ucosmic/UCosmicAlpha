using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        public ActivityValues()
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Locations = new Collection<ActivityLocation>();
            Types = new Collection<ActivityType>();
            Tags = new Collection<ActivityTag>();
            Documents = new Collection<ActivityDocument>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public void Set(ActivityValues v)
        {
            if (v == null) return;

            Title = v.Title;
            Content = v.Content;
            StartsOn = v.StartsOn;
            EndsOn = v.EndsOn;
            Locations = v.Locations;
            Types = v.Types;
            Tags = v.Tags;
            Documents = v.Documents;
            Mode = v.Mode;
            WasExternallyFunded = v.WasExternallyFunded;
            WasInternallyFunded = v.WasInternallyFunded;
        }

        public virtual Activity Activity { get; protected internal set; }
        public int ActivityId { get; protected internal set; }

        public string Title { get; protected internal set; }
        public string Content { get; protected internal set; }
        public DateTime? StartsOn { get; protected internal set; }
        public DateTime? EndsOn { get; protected internal set; }
        public virtual ICollection<ActivityLocation> Locations { get; protected internal set; }
        public virtual ICollection<ActivityType> Types { get; protected internal set; }
        public virtual ICollection<ActivityTag> Tags { get; protected internal set; }
        public virtual ICollection<ActivityDocument> Documents { get; protected internal set; }
        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }
        public bool? WasExternallyFunded { get; protected internal set; }
        public bool? WasInternallyFunded { get; protected internal set; }
    }
}
