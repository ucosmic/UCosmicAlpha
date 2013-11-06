using System.Collections.Generic;
using System.Collections.ObjectModel;
using Newtonsoft.Json;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public abstract class PublicActivity : RevisableEntity
    {
        protected internal PublicActivity()
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
    }

/*
    internal static class PublicActivitySerializer
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
*/
}
