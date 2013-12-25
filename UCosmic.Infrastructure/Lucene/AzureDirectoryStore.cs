using System;
using System.Collections.Concurrent;
using Lucene.Net.Store;
using Lucene.Net.Store.Azure;
using Microsoft.WindowsAzure.Storage;

namespace UCosmic.Lucene
{
    [UsedImplicitly]
    public class AzureDirectoryStore : IStoreDocumentIndexes
    {
        private readonly CloudStorageAccount _cloudStorageAccount;
        private readonly ConcurrentDictionary<string, Directory> _cache = new ConcurrentDictionary<string, Directory>();

        public AzureDirectoryStore(string connectionString)
        {
            _cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
        }

        private Directory GetDirectory(string catalog)
        {
            catalog = string.Format("lucene-{0}", catalog.ToLower());

            if (!_cache.ContainsKey(catalog) || _cache[catalog] == null)
                _cache.TryAdd(catalog, new AzureDirectory(_cloudStorageAccount, catalog, new RAMDirectory()));
            return _cache[catalog];
        }

        public Directory GetDirectory(Type documentType)
        {
            if (documentType == null) throw new ArgumentNullException("documentType");
            if (!typeof(IDefineDocument).IsAssignableFrom(documentType))
                throw new ArgumentException(string.Format(
                    "Invalid documentType: '{0}' is not assignable from '{1}'.",
                        documentType, typeof(IDefineDocument)), "documentType");

            var documentName = documentType.Name.ToLower();
            if (documentName.EndsWith("document"))
                documentName = documentName.Substring(0, documentName.Length - "document".Length);

            return GetDirectory(documentName);
        }

        public Directory GetDirectory<TDocument>() where TDocument : IDefineDocument
        {
            return GetDirectory(typeof(TDocument));
        }
    }
}
