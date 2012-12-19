using System;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentByEmail : BaseEntityQuery<Establishment>, IDefineQuery<Establishment>
    {
        public EstablishmentByEmail(string email)
        {
            Email = email;
        }
        public string Email { get; private set; }
    }

    public class HandleEstablishmentByEmailQuery : IHandleQueries<EstablishmentByEmail, Establishment>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentByEmailQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment Handle(EstablishmentByEmail query)
        {
            if (query == null) throw new ArgumentNullException("query");

            if (string.IsNullOrWhiteSpace(query.Email) || !query.Email.Contains("@"))
                return null;

            return _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByEmail(query.Email)
            ;
        }
    }
}
