using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using Lucene.Net.Analysis;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Version = Lucene.Net.Util.Version;

namespace UCosmic.Domain.Places
{
    public class IndexPlaceDocuments : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.FromHours(15); } }
    }

    public class PlaceDocumentIndexer : IIndexDocuments<PlaceDocument>, IPerformWork<IndexPlaceDocuments>
    {
        private readonly IQueryEntities _entities;
        private readonly IStoreDocumentIndexes _documents;

        public PlaceDocumentIndexer(IQueryEntities entities, IStoreDocumentIndexes documents)
        {
            _entities = entities;
            _documents = documents;
        }

        public void Index()
        {
            const Version version = Version.LUCENE_30;
            var analyzer = new PerFieldAnalyzerWrapper(new StandardAnalyzer(version));
            var directory = _documents.GetDirectory<PlaceDocument>();
            var writer = new IndexWriter(directory, analyzer, IndexWriter.MaxFieldLength.UNLIMITED);
            writer.DeleteAll();
            var skip = 0;
            const int take = 1000;
            const int sleep = 10;
            var places = _entities.Query<Place>()
                .EagerLoad(_entities, new Expression<Func<Place, object>>[]
                {
                    x => x.Names,
                    x => x.Ancestors,
                })
                .OrderBy(x => x.RevisionId);
            var total = places.Count();
            while (skip < total)
            {
                var items = places.Skip(skip).Take(take).ToArray().Select(x => new PlaceDocument(x));
                foreach (var document in items.Select(CreateDocument))
                    writer.AddDocument(document);
                skip += take;
                if (skip < total) Thread.Sleep(sleep);
            }

            try
            {
                writer.Optimize();
                writer.Dispose();
            }
            catch
            {
                writer.Rollback();
            }
        }

        private Document CreateDocument(PlaceDocument place)
        {
            var document = new Document();
            document.Add(new NumericField(place.PropertyName(x => x.PlaceId), Field.Store.YES, true).SetIntValue(place.PlaceId));
            document.Add(new Field(place.PropertyName(x => x.OfficialName), place.OfficialName, Field.Store.YES, Field.Index.NOT_ANALYZED));
            document.Add(new Field(place.PropertyName(x => x.OfficialNameLower), place.OfficialNameLower, Field.Store.NO, Field.Index.NOT_ANALYZED));
            document.Add(new Field(place.PropertyName(x => x.OfficialNameStandard), place.OfficialNameStandard, Field.Store.NO, Field.Index.ANALYZED));

            document.Add(new Field(place.PropertyName(x => x.IsEarth), place.IsEarth.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsContinent), place.IsContinent.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsCountry), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsWater), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsRegion), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsAdmin1), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsAdmin2), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsAdmin3), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new Field(place.PropertyName(x => x.IsAdmin3), place.IsCountry.ToString().ToLower(), Field.Store.YES, Field.Index.NO));
            document.Add(new NumericField(place.PropertyName(x => x.AncestorCount), Field.Store.YES, true).SetIntValue(place.AncestorCount));
            return document;
        }

        public void Perform(IndexPlaceDocuments job)
        {
            Index();
        }
    }
}