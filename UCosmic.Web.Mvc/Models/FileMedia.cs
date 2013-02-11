namespace UCosmic.Web.Mvc.Models
{
    public class FileMedia
    {
        public FileMedia(string fileName, string contentType, byte[] content)
        {
            FileName = fileName.WithoutEnclosingDoubleQuotes();
            ContentType = contentType;
            Content = content;
        }

        public string FileName { get; private set; }
        public string ContentType { get; private set; }
        public byte[] Content { get; private set; }
    }
}