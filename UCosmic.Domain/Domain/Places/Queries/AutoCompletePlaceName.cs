using System;
using System.Linq;
using System.Linq.Expressions;
using Lucene.Net.Index;
using Lucene.Net.Search;

namespace UCosmic.Domain.Places
{
    public class AutoCompletePlaceName : IDefineQuery<PlaceDocument[]>
    {
        public string Terms { get; set; }
        public int? MaxResults { get; set; }
        public int? Granularity { get; set; }
    }

    public class HandleAutoCompletePlaceNameQuery : IHandleQueries<AutoCompletePlaceName, PlaceDocument[]>
    {
        private readonly IProvideDocumentSearchers _searchers;

        public HandleAutoCompletePlaceNameQuery(IProvideDocumentSearchers searchers)
        {
            _searchers = searchers;
        }

        public PlaceDocument[] Handle(AutoCompletePlaceName query)
        {

            if (query == null) throw new ArgumentNullException("query");
            if (string.IsNullOrWhiteSpace(query.Terms)) return new PlaceDocument[0];

            var eDoc = new PlaceDocument();
            var keyword = query.Terms;
            var searcher = _searchers.Acquire<PlaceDocument>();
            try
            {
                var terms = new BooleanQuery
                {
                    {
                        new PrefixQuery(new Term(eDoc.PropertyName(x => x.OfficialName), keyword))
                        {
                            Boost = 2,
                        },
                        Occur.SHOULD
                    },
                    {
                        new PrefixQuery(new Term(eDoc.PropertyName(x => x.OfficialNameLower), keyword.ToLower()))
                        {
                            Boost = 2,
                        },
                        Occur.SHOULD
                    },
                    {
                        new PrefixQuery(new Term(eDoc.PropertyName(x => x.OfficialNameStandard),
                            keyword.ToLower())),
                        Occur.SHOULD
                    },
                };

                var search = new BooleanQuery { { terms, Occur.MUST } };

                if (query.Granularity.HasValue)
                {
                    var granularity = NumericRangeQuery.NewIntRange(eDoc.PropertyName(x => x.AncestorCount), 0, query.Granularity, true, true);
                    search.Add(granularity, Occur.MUST);
                }

                var results = searcher.Search(search, query.MaxResults ?? int.MaxValue);
                var documents = results.ScoreDocs.Select(x => new PlaceDocument(x, searcher.Doc(x.Doc))).ToArray();
                return documents;
            }
            finally
            {
                _searchers.Release(searcher);
            }
        }
    }
}
