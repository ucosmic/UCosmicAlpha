using Lucene.Net.Analysis;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Store;
using Lucene.Net.Store.Azure;
using Microsoft.WindowsAzure.Storage;
using System.Collections.Generic;
using UCosmic.Domain;

namespace UCosmic.Lucene
{
    public class AzureDirectoryStore : IStoreTextIndices
    {
        private readonly CloudStorageAccount _cloudStorageAccount;
        private readonly IDictionary<string, Directory> _directoryCache = new Dictionary<string, Directory>();

        public AzureDirectoryStore(string connectionString)
        {
            _cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
        }

        public Directory GetStore(string catalog)
        {
            catalog = string.Format("lucene-{0}", catalog.ToLower());
            if (!_directoryCache.ContainsKey(catalog) || _directoryCache[catalog] == null)
                _directoryCache[catalog] = new AzureDirectory(_cloudStorageAccount, catalog, new RAMDirectory());
            return _directoryCache[catalog];
        }

        public Directory GetStore<TEntity>() where TEntity : Entity
        {
            return GetStore<TEntity, StandardAnalyzer>();
        }

        public Directory GetStore<TEntity, TAnalyzer>()
            where TEntity : Entity
            where TAnalyzer : Analyzer
        {
            var entityName = typeof(TEntity).Name.ToLower();
            var analyzerName = typeof(TAnalyzer) == typeof(StandardAnalyzer)
                ? null : typeof(TAnalyzer).Name.ToLower();
            if (analyzerName != null && analyzerName.EndsWith("analyzer"))
                analyzerName = analyzerName.Substring(0, analyzerName.Length - "analyzer".Length);

            var catalog = analyzerName == null
                ? entityName
                : string.Format("{0}-{1}", typeof(TEntity).Name.ToLower(), typeof(TAnalyzer));

            return GetStore(catalog);
        }
    }
}
