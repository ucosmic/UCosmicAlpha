using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        protected bool Equals(ActivityValues other)
        {
            return  string.Equals(Title, other.Title) &&
                    string.Equals(Content, other.Content) &&
                    StartsOn.Equals(other.StartsOn) &&
                    EndsOn.Equals(other.EndsOn) &&
                    Equals(Locations, other.Locations) &&
                    Equals(Types, other.Types) &&
                    Equals(Tags, other.Tags) &&
                    Equals(Documents, other.Documents) &&
                    string.Equals(ModeText, other.ModeText) &&
                    WasExternallyFunded.Equals(other.WasExternallyFunded) &&
                    WasInternallyFunded.Equals(other.WasInternallyFunded);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityValues) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = (Title != null ? Title.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Content != null ? Content.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ StartsOn.GetHashCode();
                hashCode = (hashCode*397) ^ EndsOn.GetHashCode();
                hashCode = (hashCode*397) ^ (Locations != null ? Locations.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Types != null ? Types.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Tags != null ? Tags.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Documents != null ? Documents.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ WasExternallyFunded.GetHashCode();
                hashCode = (hashCode*397) ^ WasInternallyFunded.GetHashCode();
                return hashCode;
            }
        }

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
