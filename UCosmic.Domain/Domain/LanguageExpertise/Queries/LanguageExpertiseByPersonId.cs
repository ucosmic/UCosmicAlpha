using System;
using System.Linq;

namespace UCosmic.Domain.LanguageExpertises
{
    public class LanguageExpertisesByPersonId : BaseEntitiesQuery<LanguageExpertise>, IDefineQuery<PagedQueryResult<LanguageExpertise>>
    {
        public int PersonId { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleLanguageExpertisesByPersonIdQuery : IHandleQueries<LanguageExpertisesByPersonId, PagedQueryResult<LanguageExpertise>>
    {
        private readonly IQueryEntities _entities;

        public HandleLanguageExpertisesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<LanguageExpertise> Handle(LanguageExpertisesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            IQueryable<LanguageExpertise> results = _entities.Query<LanguageExpertise>()
                                                             .Where(a => a.PersonId == query.PersonId)
                                                             .OrderBy(a => a.Language.Names.FirstOrDefault().Text);

            var pagedResults = new PagedQueryResult<LanguageExpertise>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
