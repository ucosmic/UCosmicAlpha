using Newtonsoft.Json;

namespace UCosmic.Domain.Files
{
    public class LoadableFile : Entity
    {
        protected internal LoadableFile()
        {
        }

        public int Id { get; protected set; }
        public virtual LoadableFileBinary Binary { get; protected internal set; }
        public long Length { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Title { get; protected internal set; }
        public string Name { get; protected internal set; }         // file name only
        public string Extension { get; protected internal set; }    // extension only, no .
        public string Path { get; protected internal set; }    // key for IStoreBinaryData
    }


    internal static class LoadableFileSerializer
    {
        internal static string ToJsonAudit(this LoadableFile entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.Id,
                entity.Length,
                entity.Path,
                entity.MimeType,
                entity.Title,
                entity.Name,
                entity.Extension
                //file.Binary.Content, // this works, but unnecessarily bloats the database
            });
            return state;
        }
    }
}