using System;

namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity, IEquatable<ActivityDocument>
    {
        internal const string PathFormat = "/activity-documents/{0}/{1}";

        protected internal ActivityDocument()
        {
            Mode = ActivityMode.Draft;
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public string FileName { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Path { get; protected internal set; }
        public int Length { get; protected internal set; }

        public string ModeText { get; protected set; }
        public ActivityMode Mode
        {
            get { return ModeText.AsEnum<ActivityMode>(); }
            protected internal set { ModeText = value.AsSentenceFragment(); }
        }

        public string Title { get; protected internal set; }

        public bool Equals(ActivityDocument other)
        {
            return other != null &&
                string.Equals(MimeType, other.MimeType) &&
                string.Equals(FileName, other.FileName) &&
                string.Equals(Length, other.Length) &&
                string.Equals(Path, other.Path) &&
                string.Equals(ModeText, other.ModeText) &&
                string.Equals(Title, other.Title);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return ReferenceEquals(this, obj) || Equals(obj as ActivityDocument);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = Length.GetHashCode();
                hashCode = (hashCode * 397) ^ (FileName != null ? FileName.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (MimeType != null ? MimeType.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Path != null ? Path.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (ModeText != null ? ModeText.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Title != null ? Title.GetHashCode() : 0);
                return hashCode;
            }
        }
    }
}
