namespace UCosmic.Domain.Activities
{
    public class ActivityTag : RevisableEntity
    {
        protected internal ActivityTag()
        {
            _domainType = ActivityTagDomainType.Place;
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

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
    }
}
