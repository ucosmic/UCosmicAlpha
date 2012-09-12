using System;
using System.Runtime.Caching;
using Newtonsoft.Json;

namespace UCosmic.Cqrs
{
    public class MemoryViewManager : BaseViewManager, IManageViews
    {
        private readonly ObjectCache _objectCache;

        public MemoryViewManager(ObjectCache objectCache)
        {
            _objectCache = objectCache;
        }

        public TResult Get<TResult>()
        {
            var result = _objectCache.Get(ComputeKey(typeof(TResult)));
            if (result != null)
            {
                var tResult = JsonConvert.DeserializeObject<TResult>(result.ToString());
                return tResult;
            }
            return default(TResult);
        }

        public void Set<TResult>(object value)
        {
            var result = JsonConvert.SerializeObject(value);
            _objectCache.Add(ComputeKey(typeof(TResult)), result, DateTime.Now.Add(new TimeSpan(24 * 365, 0, 0, 0)));
        }
    }
}