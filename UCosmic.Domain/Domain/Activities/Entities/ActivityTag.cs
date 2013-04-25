namespace UCosmic.Domain.Activities
{
    public class ActivityTag : RevisableEntity, IAmNumbered
    {
        protected bool Equals(ActivityTag other)
        {
            return Number == other.Number &&
                string.Equals(Text, other.Text) &&
                string.Equals(DomainTypeText, other.DomainTypeText) &&
                DomainKey == other.DomainKey &&
                string.Equals(ModeText, other.ModeText);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityTag) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = Number;
                hashCode = (hashCode*397) ^ (Text != null ? Text.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (DomainTypeText != null ? DomainTypeText.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ DomainKey.GetHashCode();
                hashCode = (hashCode*397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                return hashCode;
            }
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public int Number { get; protected internal set; }
        public string Text { get; protected internal set; }

        public string DomainTypeText { get; private set; }
        public ActivityTagDomainType DomainType
        {
            get { return DomainTypeText.AsEnum<ActivityTagDomainType>(); }
            protected internal set { DomainTypeText = value.AsSentenceFragment(); }
        }

        public int? DomainKey { get; protected internal set; }

        private ActivityMode _mode;
        public string ModeText { get { return _mode.AsSentenceFragment(); }
                                 set { _mode = value.AsEnum<ActivityMode>(); } }
        public ActivityMode Mode { get { return _mode; }
                                   set { _mode = value; } }    }
}
