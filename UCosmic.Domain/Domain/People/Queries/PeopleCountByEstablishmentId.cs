using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class PeopleCountByEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int EstablishmentId { get; protected set; }

        public PeopleCountByEstablishmentId(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }
    }

    public class HandlePeopleCountByEstablishmentIdQuery : IHandleQueries<PeopleCountByEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleCountByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Person>().Count(p => p.Affiliations.Any(a => a.EstablishmentId == query.EstablishmentId));
        }
    }
}
