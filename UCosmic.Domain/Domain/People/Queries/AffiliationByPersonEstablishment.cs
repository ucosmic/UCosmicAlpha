using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class AffiliationByPersonEstablishment : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        public Person Person { get; set; }
        public Establishment Establishment { get; set; }

        public AffiliationByPersonEstablishment(Person person, Establishment establishment)
        {
            if (person == null) throw new ArgumentNullException("person");
            if (establishment == null) throw new ArgumentNullException("establishment");

            Person = person;
            Establishment = establishment;
        }
    }

    internal static class QueryAffiliation
    {
        internal static Affiliation ByPersonEstablishment(this IQueryable<Affiliation> queryable
            , Person person
            , Establishment establishment)
        {
            return queryable.SingleOrDefault(p => p.PersonId == person.RevisionId && p.EstablishmentId == establishment.RevisionId);
        }
    }

    public class HandleAffiliationByPersonEstablishmentQuery : IHandleQueries<AffiliationByPersonEstablishment, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationByPersonEstablishmentQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation Handle(AffiliationByPersonEstablishment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Affiliation>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByPersonEstablishment(query.Person,query.Establishment)
            ;
        }
    }
}
