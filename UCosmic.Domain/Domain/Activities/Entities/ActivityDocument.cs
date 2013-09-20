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
            return other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as ActivityDocument);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }
    }
}
