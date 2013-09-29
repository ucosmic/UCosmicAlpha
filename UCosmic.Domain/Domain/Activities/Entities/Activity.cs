using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Newtonsoft.Json;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class Activity : RevisableEntity, IEquatable<Activity>
    {
        protected internal Activity()
        {
            Mode = ActivityMode.Draft;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Values = new Collection<ActivityValues>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int PersonId { get; protected internal set; }
        public virtual Person Person { get; protected internal set; }

        public string ModeText { get; protected set; }
        public ActivityMode Mode
        {
            get { return ModeText.AsEnum<ActivityMode>(); }
            protected internal set { ModeText = value.AsSentenceFragment(); }
        }

        public virtual ICollection<ActivityValues> Values { get; protected set; }

        public virtual Activity Original { get; protected internal set; }
        public virtual Activity WorkCopy { get; protected internal set; }

        public bool Equals(Activity other)
        {
            if (ReferenceEquals(this, other)) return true;
            return RevisionId != 0 && other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as Activity);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }
    }

    internal static class ActivitySerializer
    {
        internal static string ToJsonAudit(this Activity entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                entity.PersonId,
                Mode = entity.ModeText,
            });
            return state;
        }
    }
}
