using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace UCosmic.Domain.Activities
{
    public class ActivityValues : RevisableEntity
    {
        protected bool EqualsNullableBool(bool? a, bool? b)
        {
            if (!a.HasValue && !b.HasValue) return true;
            if (!a.HasValue && !b.Value) return true;
            if (!b.HasValue && !a.Value) return true;
            return a == b;
        }

        protected bool Equals(ActivityValues other)
        {
            bool equal = true;
            equal &= Equals(Title, other.Title);
            equal &= string.Equals(Content, other.Content);
            equal &= StartsOn.Equals(other.StartsOn);
            equal &= EndsOn.Equals(other.EndsOn);
            equal &= EqualsNullableBool(OnGoing, other.OnGoing);
            equal &= string.Equals(DateFormat, other.DateFormat);
            equal &= Locations.OrderBy(a => a.PlaceId).SequenceEqual(other.Locations.OrderBy(b => b.PlaceId));
            equal &= Types.OrderBy(a => a.TypeId).SequenceEqual(other.Types.OrderBy(b => b.TypeId));
            equal &= Tags.OrderBy(a => a.Text).SequenceEqual(other.Tags.OrderBy(b => b.Text));
            equal &= Documents.OrderBy(a => a.Title).SequenceEqual(other.Documents.OrderBy(b => b.Title));
            equal &= string.Equals(ModeText, other.ModeText);
            equal &= EqualsNullableBool(WasExternallyFunded, other.WasExternallyFunded);
            equal &= EqualsNullableBool(WasInternallyFunded, other.WasInternallyFunded);
            return equal;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            // TBD - This check is not working well with EF.
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityValues)obj);
        }

        public bool IsEmpty()
        {
            bool empty = true;
            empty &= String.IsNullOrEmpty(Title);
            empty &= String.IsNullOrEmpty(Content);
            empty &= !StartsOn.HasValue;
            empty &= !EndsOn.HasValue;
            empty &= !OnGoing.HasValue;
            empty &= Locations != null ? Locations.Count == 0 : true;
            empty &= Types != null ? Types.Count == 0 : true;
            empty &= Tags != null ? Tags.Count == 0 : true;
            empty &= Documents != null ? Documents.Count == 0 : true;
            empty &= !WasExternallyFunded.HasValue;
            empty &= !WasInternallyFunded.HasValue;
            return empty;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = (Title != null ? Title.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Content != null ? Content.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ StartsOn.GetHashCode();
                hashCode = (hashCode * 397) ^ EndsOn.GetHashCode();
                hashCode = (hashCode * 397) ^ OnGoing.GetHashCode();
                hashCode = (hashCode * 397) ^ (DateFormat != null ? DateFormat.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Locations != null ? Locations.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Types != null ? Types.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Tags != null ? Tags.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Documents != null ? Documents.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ WasExternallyFunded.GetHashCode();
                hashCode = (hashCode * 397) ^ WasInternallyFunded.GetHashCode();
                return hashCode;
            }
        }

        public ActivityValues()
        {
            _mode = ActivityMode.Draft;
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Locations = new Collection<ActivityLocation>();
            Types = new Collection<ActivityType>();
            Tags = new Collection<ActivityTag>();
            Documents = new Collection<ActivityDocument>();
            DateFormat = "MM/dd/yyyy"; // "Custom Date and Time Format Strings" http://msdn.microsoft.com/en-us/library/8kb3ddd4.aspx
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public void Set(ActivityValues v)
        {
            if (v == null) return;

            Title = v.Title;
            Content = v.Content;
            StartsOn = v.StartsOn;
            EndsOn = v.EndsOn;
            OnGoing = v.OnGoing;
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
        public virtual ICollection<ActivityLocation> Locations { get; protected internal set; }
        public virtual ICollection<ActivityType> Types { get; protected internal set; }
        public virtual ICollection<ActivityTag> Tags { get; protected internal set; }
        public virtual ICollection<ActivityDocument> Documents { get; protected internal set; }
        private ActivityMode _mode;
        public string ModeText { get { return _mode.AsSentenceFragment(); } set { _mode = value.AsEnum<ActivityMode>(); } }
        public ActivityMode Mode { get { return _mode; } set { _mode = value; } }
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
