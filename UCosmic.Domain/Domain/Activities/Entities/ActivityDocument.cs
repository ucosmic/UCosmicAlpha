using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity
    {
        public virtual Activity Activity { get; protected internal set; }
        public int ActivityId { get; protected internal set; }

        public virtual LoadableFile Document { get; protected internal set; }
        public int DocumentId { get; protected internal set; }
    }
}
