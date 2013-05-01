namespace UCosmic.Domain.Activities
{
    public class ActivityTag : RevisableEntity, IAmNumbered
    {
        protected bool Equals(ActivityTag other)
        {
            return  string.Equals(Text, other.Text) &&
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
                hashCode = (hashCode*397) ^ (DomainKey != null ? DomainKey.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                return hashCode;
            }
        }

        public ActivityTag()
        {
            _domainType = ActivityTagDomainType.Place;
            _mode = ActivityMode.Draft;
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public int Number { get; protected internal set; }
        public string Text { get; protected internal set; }

        private ActivityTagDomainType _domainType;
        public string DomainTypeText {  get { return _domainType.AsSentenceFragment(); }
                                        set { _domainType = value.AsEnum<ActivityTagDomainType>(); } }
        public ActivityTagDomainType DomainType { get { return _domainType; }
                                                  set { _domainType = value; } }

        public int? DomainKey { get; protected internal set; }

        private ActivityMode _mode;
        public string ModeText { get { return _mode.AsSentenceFragment(); }
                                 set { _mode = value.AsEnum<ActivityMode>(); } }
        public ActivityMode Mode { get { return _mode; }
                                   set { _mode = value; } }    }
}
