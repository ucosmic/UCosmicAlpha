using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentNamesByKeyword : BaseEntitiesQuery<EstablishmentName>, IDefineQuery<PagedQueryResult<EstablishmentName>>
    {
        public string Keyword { get; set; }
        public StringMatchStrategy? KeywordMatchStrategy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleEstablishmentNamesByKeywordQuery : IHandleQueries<EstablishmentNamesByKeyword, PagedQueryResult<EstablishmentName>>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentNamesByKeywordQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<EstablishmentName> Handle(EstablishmentNamesByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            switch (query.KeywordMatchStrategy)
            {
                case StringMatchStrategy.StartsWith:
                    {
                        var startsWithResults = _entities.Query<EstablishmentName>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .Where(x => x.Text.StartsWith(query.Keyword) || (x.AsciiEquivalent != null && x.AsciiEquivalent.StartsWith(query.Keyword)))
                            .OrderBy(query.OrderBy)
                        ;
                        var pagedResults = new PagedQueryResult<EstablishmentName>(startsWithResults, query.PageSize, query.PageNumber);
                        return pagedResults;
                    }
                case StringMatchStrategy.Contains:
                    {
                        var containsResults = _entities.Query<EstablishmentName>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .Where(x => x.Text.Contains(query.Keyword) || (x.AsciiEquivalent != null && x.AsciiEquivalent.Contains(query.Keyword)))
                            .OrderBy(query.OrderBy)

                        ;
                        var pagedResults = new PagedQueryResult<EstablishmentName>(containsResults, query.PageSize, query.PageNumber);
                        return pagedResults;
                    }

                case StringMatchStrategy.Equals:
                    {
                        var results = _entities.Query<EstablishmentName>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .Where(x => x.Text.Equals(query.Keyword) || (x.AsciiEquivalent != null && x.AsciiEquivalent.Equals(query.Keyword)))
                            .OrderBy(query.OrderBy)

                        ;
                        var pagedResults = new PagedQueryResult<EstablishmentName>(results, query.PageSize, query.PageNumber);
                        return pagedResults;
                    }
                default:
                    {
                        var startsWithResults = _entities.Query<EstablishmentName>()
                            .Where(x => x.Text.StartsWith(query.Keyword) || (x.AsciiEquivalent != null && x.AsciiEquivalent.StartsWith(query.Keyword)))
                            .Select(x => new EntityRanker<EstablishmentName>
                            {
                                Entity = x,
                                Rank = 1,
                            })
                        ;

                        var containsResults = _entities.Query<EstablishmentName>()
                            .Where(x => !startsWithResults.Select(y => y.Entity.RevisionId).Contains(x.RevisionId))
                            .Where(x => x.Text.Contains(query.Keyword) || (x.AsciiEquivalent != null && x.AsciiEquivalent.Contains(query.Keyword)))
                            .Select(x => new EntityRanker<EstablishmentName>
                            {
                                Entity = x,
                                Rank = 2,
                            })
                        ;

                        var rankedResults = startsWithResults.Concat(containsResults).OrderBy(x => x.Rank);
                        if (query.OrderBy.Any())
                        {
                            foreach (var thenBy in query.OrderBy)
                            {
                                var expression = LinqPropertyChain.Chain<EntityRanker<EstablishmentName>, object, EstablishmentName>(x => x.Entity, thenBy.Key);
                                rankedResults = thenBy.Value == OrderByDirection.Ascending
                                    ? rankedResults.ThenBy(expression)
                                    : rankedResults.ThenByDescending(expression);
                            }
                        }
                        var orderedResults = rankedResults.Select(x => x.Entity).EagerLoad(_entities, query.EagerLoad);

                        var pagedResults = new PagedQueryResult<EstablishmentName>(orderedResults, query.PageSize, query.PageNumber);
                        return pagedResults;
                    }
            }

        }
    }
}