using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity
    {
        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public virtual LoadableFile File { get; protected internal set; }
        public int? FileId { get; protected internal set; }

        public virtual UCosmic.Domain.Files.Image Image { get; protected internal set; }
        public int? ImageId { get; protected internal set; }

        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }

        public string Title { get; protected internal set; }
        public bool Visible { get; protected internal set; }
    }
}
