using System;
using Microsoft.ApplicationServer.Caching;

namespace UCosmic.Cache
{
    public class AzureCacheProvider : IProvideCache
    {
        private readonly DataCache _dataCache;

        public AzureCacheProvider(DataCache dataCache)
        {
            _dataCache = dataCache;
        }

        public bool Contains(string key)
        {
            return Get(key) != null;
        }

        public object Get(string key)
        {
            return _dataCache.Get(key);
        }

        public void Add(string key, object value, TimeSpan timeout)
        {
            _dataCache.Put(key, value, timeout);
        }
    }
}