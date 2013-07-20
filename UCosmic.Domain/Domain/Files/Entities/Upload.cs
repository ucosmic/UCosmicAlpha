using System;
using Newtonsoft.Json;

namespace UCosmic.Domain.Files
{
    public class Upload : Entity
    {
        internal const string PathFormat = "/uploads/{0}";

        protected internal Upload()
        {
            Guid = Guid.NewGuid();
            CreatedOnUtc = DateTime.UtcNow;
        }

        public Guid Guid { get; protected set; }
        public string Path { get; protected internal set; }
        public long Length { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string FileName { get; protected internal set; }
        public string CreatedByPrincipal { get; protected internal set; }
        public DateTime CreatedOnUtc { get; protected internal set; }
    }


    internal static class UploadSerializer
    {
        internal static string ToJsonAudit(this Upload entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                entity.Guid,
                entity.Length,
                entity.MimeType,
                entity.FileName,
                entity.Path,
            });
            return state;
        }
    }
}