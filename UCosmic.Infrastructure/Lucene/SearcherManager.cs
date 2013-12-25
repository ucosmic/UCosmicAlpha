using System;
using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Threading;
using Lucene.Net.Index;
using Lucene.Net.Search;
using Lucene.Net.Store;

namespace UCosmic.Lucene
{
    public class SearcherManager : IProvideDocumentSearchers
    {
        private readonly IStoreDocumentIndexes _documentStore;
        private readonly ConcurrentDictionary<Directory, IndexSearcher> _currentSearchers = new ConcurrentDictionary<Directory, IndexSearcher>();
        private readonly ConcurrentDictionary<Directory, bool> _reopenings = new ConcurrentDictionary<Directory, bool>();

        public SearcherManager(IStoreDocumentIndexes documentStore)
        {
            _documentStore = documentStore;
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        public IndexSearcher Acquire<TDocument>()
            where TDocument : IDefineDocument
        {
            return Acquire(typeof(TDocument), true);
        }

        //[MethodImpl(MethodImplOptions.Synchronized)]
        //private IndexSearcher Acquire(Type documentType)
        //{
        //    return Acquire(documentType, true);
        //}

        [MethodImpl(MethodImplOptions.Synchronized)]
        private IndexSearcher Acquire(Type documentType, bool maybeReopen)
        {
            if (documentType == null) throw new ArgumentNullException("documentType");
            if (!typeof(IDefineDocument).IsAssignableFrom(documentType))
                throw new ArgumentException(string.Format(
                    "Invalid documentType: '{0}' is not assignable from '{1}'.",
                        documentType, typeof(IDefineDocument)), "documentType");

            var directory = _documentStore.GetDirectory(documentType);
            if (!_currentSearchers.ContainsKey(directory) || _currentSearchers[directory] == null)
            {
                _currentSearchers.TryAdd(directory, new IndexSearcher(IndexReader.Open(directory, true)));
                _reopenings.TryAdd(directory, false);
            }
            if (maybeReopen) MaybeReopen(documentType);
            _currentSearchers[directory].IndexReader.IncRef();
            return _currentSearchers[directory];
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        public void Release(IndexSearcher searcher)
        {
            searcher.IndexReader.DecRef();
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        private void MaybeReopen(Type documentType)
        {
            var directory = _documentStore.GetDirectory(documentType);
            StartReopen(directory);
            try
            {
                var searcher = Acquire(documentType, false);
                try
                {
                    var newReader = _currentSearchers[directory].IndexReader.Reopen();
                    if (newReader == _currentSearchers[directory].IndexReader) return;

                    var newSearcher = new IndexSearcher(newReader);
                    SwapSearcher(newSearcher, documentType);
                }
                finally
                {
                    Release(searcher);
                }
            }
            finally
            {
                DoneReopen(directory);
            }
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        private void StartReopen(Directory directory)
        {
            while (_reopenings[directory])
            {
                Monitor.Wait(this);
            }
            _reopenings[directory] = true;
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        private void DoneReopen(Directory directory)
        {
            _reopenings[directory] = false;

            Monitor.PulseAll(this);
        }

        [MethodImpl(MethodImplOptions.Synchronized)]
        private void SwapSearcher(IndexSearcher newSearcher, Type documentType)
        {
            var directory = _documentStore.GetDirectory(documentType);
            Release(_currentSearchers[directory]);
            _currentSearchers[directory] = newSearcher;
        }
    }
}
