using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class ExternalsUrlBy : BaseEntityQuery<ExternalUrl>, IDefineQuery<IQueryable<ExternalUrl>>
    {
        public ExternalsUrlBy(int personId)
        {
            PersonId = personId;
        }

        public int PersonId { get; private set; }
    }

    public class HandleExternalsUrlByQuery : IHandleQueries<ExternalsUrlBy, IQueryable<ExternalUrl>>
    {
        private readonly IQueryEntities _entities;

        public HandleExternalsUrlByQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<ExternalUrl> Handle(ExternalsUrlBy query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<ExternalUrl>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.PersonId == query.PersonId);
        }
    }
}
