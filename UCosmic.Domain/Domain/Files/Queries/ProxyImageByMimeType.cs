using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class ProxyImageByMimeType : BaseEntityQuery<Image>, IDefineQuery<Image>
    {
        public string MimeType { get; set; }

        public ProxyImageByMimeType(string inMimeType)
        {
            if (String.IsNullOrEmpty(inMimeType)) throw new ArgumentNullException("inMimeType");
            MimeType = inMimeType;
        }
    }

    public class HandleProxyImageByMimeType: IHandleQueries<ProxyImageByMimeType, Image>
    {
        private readonly IQueryEntities _entities;

        public HandleProxyImageByMimeType(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Image Handle(ProxyImageByMimeType query)
        {
            if (query == null) throw new ArgumentNullException("query");

            ProxyImageMimeTypeXRef xref = _entities.Query<ProxyImageMimeTypeXRef>()
                .SingleOrDefault(i => i.MimeType == query.MimeType);

            return xref != null
                       ? _entities.Query<Image>()
                                  .EagerLoad(_entities, query.EagerLoad)
                                  .SingleOrDefault(i => i.Id == xref.ImageId)
                       : null;
        }
    }
}
