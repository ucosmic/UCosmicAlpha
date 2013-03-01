using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        public ActivityValues()
        {
            Locations = new Collection<ActivityLocation>();
        }

        public void Set(ActivityValues v)
        {
            if (v == null) return;

            Title = v.Title;
            Content = v.Content;
            StartsOn = v.StartsOn;
            EndsOn = v.EndsOn;
            Locations = v.Locations;
            Type = v.Type;
            TypeId = v.TypeId;
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
        public virtual ActivityType Type { get; protected internal set; }
        public int? TypeId { get; protected internal set; }
        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }
        public bool? WasExternallyFunded { get; protected internal set; }
        public bool? WasInternallyFunded { get; protected internal set; }
    }
}
