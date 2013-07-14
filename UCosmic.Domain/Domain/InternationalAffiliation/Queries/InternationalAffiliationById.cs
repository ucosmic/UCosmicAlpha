using System;
using System.Linq;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class InternationalAffiliationById : BaseEntityQuery<InternationalAffiliation>, IDefineQuery<InternationalAffiliation>
    {
        public int Id { get; private set; }

        public InternationalAffiliationById(int inEntityId)
        {
            Id = inEntityId;
        }
    }

    public class HandleInternationalAffiliationByIdQuery : IHandleQueries<InternationalAffiliationById, InternationalAffiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleInternationalAffiliationByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public InternationalAffiliation Handle(InternationalAffiliationById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<InternationalAffiliation>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id);

            return result;
        }
    }
}
