using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class ExternalUrlsBy : BaseEntityQuery<ExternalUrl>, IDefineQuery<IQueryable<ExternalUrl>>
    {
        public ExternalUrlsBy(int personId)
        {
            PersonId = personId;
        }

        public int PersonId { get; private set; }
    }

    public class HandleExternalUrlsByQuery : IHandleQueries<ExternalUrlsBy, IQueryable<ExternalUrl>>
    {
        private readonly IQueryEntities _entities;

        public HandleExternalUrlsByQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<ExternalUrl> Handle(ExternalUrlsBy query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<ExternalUrl>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.PersonId == query.PersonId);
        }
    }
}
