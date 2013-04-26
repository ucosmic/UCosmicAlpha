using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity
    {
        protected bool Equals(ActivityDocument other)
        {
            return FileId == other.FileId &&
                   ImageId == other.ImageId &&
                   string.Equals(ModeText, other.ModeText) &&
                   Visible.Equals(other.Visible) &&
                   string.Equals(Title, other.Title);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            //if (obj.GetType() != this.GetType()) return false;
            return Equals((ActivityDocument) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = FileId.GetHashCode();
                hashCode = (hashCode*397) ^ ImageId.GetHashCode();
                hashCode = (hashCode*397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ Visible.GetHashCode();
                hashCode = (hashCode*397) ^ (Title != null ? Title.GetHashCode() : 0);
                return hashCode;
            }
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public virtual LoadableFile File { get; protected internal set; }
        public int? FileId { get; protected internal set; }

        public virtual Image Image { get; protected internal set; }
        public int? ImageId { get; protected internal set; }

        private ActivityMode _mode;
        public string ModeText { get { return _mode.AsSentenceFragment(); }
                                 set { _mode = value.AsEnum<ActivityMode>(); } }
        public ActivityMode Mode { get { return _mode; }
                                   set { _mode = value; } }

        public string Title { get; protected internal set; }
        public bool Visible { get; protected internal set; }
    }
}
