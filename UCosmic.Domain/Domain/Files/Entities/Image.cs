namespace UCosmic.Domain.Files
{
    public class Image : Entity
    {
        protected internal Image()
        {
        }

        public int Id { get; protected set; }
        public byte[] Data { get; protected internal set; }
        public string Title { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Name { get; protected internal set; }         // filename only
        public string Extension { get; protected internal set; }    // extension only, no .
        public string FileName { get; protected internal set; }
        public long Size { get; protected internal set; }
    }

}