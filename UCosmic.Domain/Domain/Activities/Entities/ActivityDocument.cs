using UCosmic.Domain.Files;
using UCosmic.Domain.Images;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity
    {
        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public virtual LoadableFile File { get; protected internal set; }
        public int? FileId { get; protected internal set; }

        public virtual UCosmic.Domain.Images.Image Image { get; protected internal set; }
        public int? ImageId { get; protected internal set; }

        public virtual UCosmic.Domain.Images.Image ProxyImage { get; protected internal set; }
        public int? ProxyImageId { get; protected internal set; }

        public string ModeText { get; private set; }
        public ActivityMode Mode { get { return ModeText.AsEnum<ActivityMode>(); } protected internal set { ModeText = value.AsSentenceFragment(); } }
    }
}
