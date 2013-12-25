using System;
using System.Collections.Concurrent;
using System.IO;
using System.Web.Hosting;
using Lucene.Net.Store;
using Directory = Lucene.Net.Store.Directory;

namespace UCosmic.Lucene
{
    public class IisFileSystemDirectoryStore : IStoreDocumentIndexes
    {
        private readonly string _root;
        private readonly ConcurrentDictionary<string, Directory> _cache = new ConcurrentDictionary<string, Directory>();

        public IisFileSystemDirectoryStore(string appRelativeRoot)
        {
            appRelativeRoot = appRelativeRoot ?? "~/";
            if (!appRelativeRoot.StartsWith("~/"))
                throw new ArgumentException(string.Format(
                    "The path '{0}' is not a valid app-relative root directory. App-relative directories begin with '~/'.",
                        appRelativeRoot));
            _root = HostingEnvironment.MapPath(appRelativeRoot);
        }

        private Directory GetDirectory(string catalog)
        {
            catalog = Path.Combine(_root, catalog);

            if (!_cache.ContainsKey(catalog) || _cache[catalog] == null)
                _cache.TryAdd(catalog, FSDirectory.Open(catalog));

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
