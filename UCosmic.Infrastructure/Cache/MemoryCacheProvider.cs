using System;
using System.Runtime.Caching;

namespace UCosmic.Cache
{
    public class ObjectCacheProvider : IProvideCache
    {
        private readonly ObjectCache _objectCache;

        public ObjectCacheProvider(ObjectCache objectCache)
        {
            _objectCache = objectCache;
        }

        public bool Contains(string key)
        {
            return _objectCache.Contains(key);
        }

        public object Get(string key)
        {
            return _objectCache.Get(key);
        }

        public void Add(string key, object value, TimeSpan timeout)
        {
            _objectCache.Add(key, value, DateTime.Now.Add(timeout));
        }
    }
}