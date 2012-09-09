using System;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByKeyword : BaseEntitiesQuery<Establishment>, IDefineQuery<PagedQueryResult<Establishment>>
    {
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        //public int MaxResults { get; set; }
        public PagedQueryRequest Pager { get; set; }
        //public StringMatchStrategy TermMatchStrategy { get; set; }
    }

    public class QueriedEstablishmentsByKeyword : BaseEvent
    {
    }

    public class HandleEstablishmentsByKeywordQuery : IHandleQueries<EstablishmentsByKeyword, PagedQueryResult<Establishment>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessEvents _events;

        public HandleEstablishmentsByKeywordQuery(IQueryEntities entities, IProcessEvents events)
        {
            _entities = entities;
            _events = events;
        }

        public PagedQueryResult<Establishment> Handle(EstablishmentsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            //if (string.IsNullOrWhiteSpace(query.Term))
            //    throw new ValidationException(new[]
            //{
            //    new ValidationFailure("Term", "Term cannot be null or white space string", query.Term),
            //});

            //if (query.MaxResults < 0)
            //    throw new ValidationException(new[]
            //{
            //    new ValidationFailure("MaxResults", "MaxResults must be greater than or equal to zero", query.MaxResults),
            //});

            var results = _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                //.WithNameOrUrl(query.Term, query.TermMatchStrategy)
                .OrderBy(query.OrderBy);

            //if (query.MaxResults > 0)
            //    results = results.Take(query.MaxResults);

            //return results.ToArray();

            var pagedResults = new PagedQueryResult<Establishment>(results, query.Pager);

            _events.Raise(new QueriedEstablishmentsByKeyword());

            return pagedResults;
        }
    }

    public class HandleQueriedEstablishmentsByKeywordEvent : IHandleEvents<QueriedEstablishmentsByKeyword>
    {
        public void Handle(QueriedEstablishmentsByKeyword @event)
        {
            throw new NotImplementedException();
        }
    }

    public class HandleQueriedEstablishmentsByKeywordEvent2 : IHandleEvents<QueriedEstablishmentsByKeyword>
    {
        public void Handle(QueriedEstablishmentsByKeyword @event)
        {
            throw new NotImplementedException();
        }
    }
}