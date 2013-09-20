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
            return other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as ActivityTag);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }
    }
}
