using System;

namespace UCosmic.Domain.People
{
    public class PeopleByCriteria : BaseEntitiesQuery<Person>, IDefineQuery<PagedQueryResult<Person>>
    {
        public int PageSize { get; set; }
        public int PageNumber { get; set; }

        public string Email { get; set; }
        public StringMatchStrategy EmailMatch { get; set; }

        public string FirstName { get; set; }
        public StringMatchStrategy FirstNameMatch { get; set; }

        public string LastName { get; set; }
        public StringMatchStrategy LastNameMatch { get; set; }
    }

    public class HandlePeopleByCriteriaQuery : IHandleQueries<PeopleByCriteria, PagedQueryResult<Person>>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleByCriteriaQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Person> Handle(PeopleByCriteria query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Person>()
                .EagerLoad(_entities, query.EagerLoad);

            // apply filters
            if (!string.IsNullOrWhiteSpace(query.Email))
                queryable = queryable.ByEmail(query.Email, query.EmailMatch);

            if (!string.IsNullOrWhiteSpace(query.FirstName))
                queryable = queryable.ByFirstName(query.FirstName, query.FirstNameMatch);

            if (!string.IsNullOrWhiteSpace(query.LastName))
                queryable = queryable.ByLastName(query.LastName, query.LastNameMatch);

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Person>(queryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
