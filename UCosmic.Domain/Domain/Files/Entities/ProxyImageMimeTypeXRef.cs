using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Files
{
    public class ProxyImageMimeTypeXRef : Entity
    {
        protected internal ProxyImageMimeTypeXRef()
        {
        }

        public int Id { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public int ImageId { get; protected internal set; }
    }
}
