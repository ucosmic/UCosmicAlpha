using System;
using System.ComponentModel.DataAnnotations;

namespace UCosmic.Domain.Activities
{
    public class ActivityTag : RevisableEntity, IAmNumbered
    {
        public virtual Activity Activity { get; protected internal set; }
        public int ActivityId { get; protected internal set; }

        public int Number { get; protected internal set; }
        public string Text { get; protected internal set; }

        public string DomainTypeText { get; private set; }
        public ActivityTagDomainType DomainType
        {
            get { return DomainTypeText.AsEnum<ActivityTagDomainType>(); }
            protected internal set { DomainTypeText = value.AsSentenceFragment(); }
        }

        public int? DomainKey { get; protected internal set; }

        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }
    }
}
