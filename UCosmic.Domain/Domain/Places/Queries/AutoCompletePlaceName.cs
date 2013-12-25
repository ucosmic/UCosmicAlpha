using System;
using System.Diagnostics;
using System.Linq;
using Lucene.Net.Index;
using Lucene.Net.Search;

namespace UCosmic.Domain.Places
{
    public class AutoCompletePlaceName : IDefineQuery<string>, IDefineWork
    {
        public string Terms { get; set; }
        public TimeSpan Interval { get { return TimeSpan.FromMinutes(1); } }
    }

    public class HandleAutoCompletePlaceNameQuery : IHandleQueries<AutoCompletePlaceName, string>, IPerformWork<AutoCompletePlaceName>
    {
        private readonly IProvideDocumentSearchers _searchers;

        public HandleAutoCompletePlaceNameQuery(IProvideDocumentSearchers searchers)
        {
            _searchers = searchers;
        }

        public string Handle(AutoCompletePlaceName query)
        {
            var eDoc = new PlaceDocument();

            var keywords = new[] { "C", "Ch", "Chi", "Chin", "China" };
            foreach (var keyword in keywords)
            {
                var searcher = _searchers.Acquire<PlaceDocument>();
                try
                {
                    var search = new BooleanQuery
                    {
                        {
                            new PrefixQuery(new Term(eDoc.PropertyName(x => x.OfficialName), keyword))
                            {
                                Boost = 2,
                            },
                            Occur.SHOULD
                        },
                        {
                            new PrefixQuery(new Term(eDoc.PropertyName(x => x.OfficialNameStandard),
                                keyword.ToLower())),
                            Occur.SHOULD
                        }
                    };
                    var results = searcher.Search(search, int.MaxValue);
                    var documents = results.ScoreDocs.Select(x => new PlaceDocument(x, searcher.Doc(x.Doc))).ToArray();
                    Debug.Assert(documents.Length >= 0);
                }
                finally
                {
                    _searchers.Release(searcher);
                }
            }

            return null;
        }

        public void Perform(AutoCompletePlaceName job)
        {
            Handle(new AutoCompletePlaceName { Terms = "C" });
        }
    }
}
