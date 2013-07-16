using System;

namespace UCosmic.Domain.Activities
{
    public class ActivityTag : RevisableEntity, IAmNumbered, IEquatable<ActivityTag>
    {
        protected internal ActivityTag()
        {
            _domainType = ActivityTagDomainType.Place;
            Mode = ActivityMode.Draft;
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public int Number { get; protected internal set; }
        public string Text { get; protected internal set; }

        private ActivityTagDomainType _domainType;
        public string DomainTypeText
        {
            get { return _domainType.AsSentenceFragment(); }
            set { _domainType = value.AsEnum<ActivityTagDomainType>(); }
        }
        public ActivityTagDomainType DomainType
        {
            get { return _domainType; }
            set { _domainType = value; }
        }

        public int? DomainKey { get; protected internal set; }

        public string ModeText { get; protected set; }
        public ActivityMode Mode
        {
            get { return ModeText.AsEnum<ActivityMode>(); }
            protected internal set { ModeText = value.AsSentenceFragment(); }
        }

        public bool Equals(ActivityTag other)
        {
            return other != null &&
                string.Equals(Text, other.Text) &&
                string.Equals(DomainTypeText, other.DomainTypeText) &&
                DomainKey == other.DomainKey &&
                string.Equals(ModeText, other.ModeText);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return Equals(obj as ActivityTag);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = Number;
                hashCode = (hashCode * 397) ^ (Text != null ? Text.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (DomainTypeText != null ? DomainTypeText.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (DomainKey != null ? DomainKey.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                return hashCode;
            }
        }
    }
}
