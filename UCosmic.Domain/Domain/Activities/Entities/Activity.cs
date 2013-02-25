using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class Activity : Entity, IAmNumbered
    {
        protected internal Activity()
        {
            Mode = ActivityMode.Draft;
            CreatedOn = DateTime.UtcNow;
            UpdatedOn = DateTime.UtcNow;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Values = new Collection<ActivityValues>();
            Tags = new Collection<ActivityTag>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int Id { get; protected internal set; }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public int Number { get; protected internal set; }

        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }

        public virtual ICollection<ActivityValues> Values { get; protected internal set; }
        public virtual ICollection<ActivityTag> Tags { get; protected set; }

        public DateTime CreatedOn { get; protected internal set; }
        public DateTime UpdatedOn { get; protected internal set; }
        public virtual User UpdatedByUser { get; protected internal set; }
        public int UpdatedByUserId { get; protected internal set; }
    }
}
