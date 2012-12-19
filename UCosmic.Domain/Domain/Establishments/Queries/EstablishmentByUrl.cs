using System;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentByUrl : BaseEntityQuery<Establishment>, IDefineQuery<Establishment>
    {
        public EstablishmentByUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Cannot be null or white space.", "url");
            Url = url;
        }

        public string Url { get; private set; }
    }

    public class HandleEstablishmentByUrlQuery : IHandleQueries<EstablishmentByUrl, Establishment>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentByUrlQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment Handle(EstablishmentByUrl query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByUrl(query.Url)
            ;
        }
    }
}
