using Newtonsoft.Json;

namespace UCosmic.Domain.Files
{
    public class ExternalFile : Entity
    {
        protected internal ExternalFile()
        {
        }

        public int Id { get; protected set; }
        public long Length { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Name { get; protected internal set; }
        public string Path { get; protected internal set; }
    }


    internal static class ExternalFileSerializer
    {
        internal static string ToJsonAudit(this ExternalFile entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.Id,
                entity.Length,
                entity.Path,
                entity.MimeType,
                entity.Name,
            });
            return state;
        }
    }
}