using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class ExternalUrlBy : BaseEntityQuery<ExternalUrl>, IDefineQuery<ExternalUrl>
    {
        public ExternalUrlBy(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleExternalUrlByQuery : IHandleQueries<ExternalUrlBy, ExternalUrl>
    {
        private readonly IQueryEntities _entities;

        public HandleExternalUrlByQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public ExternalUrl Handle(ExternalUrlBy query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<ExternalUrl>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.Id == query.Id);
        }
    }
}
