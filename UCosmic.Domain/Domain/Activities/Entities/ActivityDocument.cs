namespace UCosmic.Domain.Activities
{
    public class ActivityDocument : RevisableEntity
    {
        internal const string PathFormat = "/activity-documents/{0}/{1}";

        protected internal ActivityDocument()
        {
        }

        public virtual ActivityValues ActivityValues { get; protected internal set; }
        public int ActivityValuesId { get; protected internal set; }

        public string FileName { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Path { get; protected internal set; }
        public int Length { get; protected internal set; }

        public string Title { get; protected internal set; }
    }
}
