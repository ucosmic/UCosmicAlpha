using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class Activity : RevisableEntity, IAmNumbered
    {
        protected internal Activity()
        {
            Mode = ActivityMode.Draft;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Values = new Collection<ActivityValues>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public virtual Person Person { get; protected internal set; }
        public int PersonId { get; protected internal set; }
        public int Number { get; protected internal set; }

        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }

        public virtual ICollection<ActivityValues> Values { get; protected internal set; }

        public int? EditSourceId { get; protected internal set; }
    }
}
