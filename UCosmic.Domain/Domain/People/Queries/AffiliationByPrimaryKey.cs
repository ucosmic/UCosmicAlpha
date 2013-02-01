using System;

namespace UCosmic.Domain.People
{
    public class AffiliationByPrimaryKey : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        // do not pass entities to command objects, use scalars
        public int PersonId { get; private set; }
        public int EstablishmentId { get; private set; }

        public AffiliationByPrimaryKey(int personId, int establishmentId)
        {
            PersonId = personId;
            EstablishmentId = establishmentId;
        }
    }

    public class HandleAffiliationByPersonEstablishmentQuery : IHandleQueries<AffiliationByPrimaryKey, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationByPersonEstablishmentQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation Handle(AffiliationByPrimaryKey query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Affiliation>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByPersonIdAndEstablishmentId(query.PersonId, query.EstablishmentId)
            ;
        }
    }
}
