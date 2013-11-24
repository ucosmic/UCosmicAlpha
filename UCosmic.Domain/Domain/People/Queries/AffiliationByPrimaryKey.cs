using System;

namespace UCosmic.Domain.People
{
    public class AffiliationByPrimaryKey : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        public AffiliationByPrimaryKey(int personId, int establishmentId)
        {
            PersonId = personId;
            EstablishmentId = establishmentId;
        }

        public int PersonId { get; private set; }
        public int EstablishmentId { get; private set; }
    }

    public class HandleAffiliationByPrimaryKeyQuery : IHandleQueries<AffiliationByPrimaryKey, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationByPrimaryKeyQuery(IQueryEntities entities)
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
