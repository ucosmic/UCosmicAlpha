using System;
using Microsoft.ApplicationServer.Caching;
using Newtonsoft.Json;

namespace UCosmic.Cqrs
{
    public class AzureCacheViewManager : BaseViewManager, IManageViews
    {
        private readonly DataCache _dataCache;
        private readonly TimeSpan _maxTtl;

        public AzureCacheViewManager(DataCache dataCache, TimeSpan maxTtl)
        {
            _dataCache = dataCache;
            _maxTtl = maxTtl;
        }

        public TResult Get<TResult>()
        {
            try
            {
                var result = _dataCache.Get(ComputeKey(typeof (TResult)));
                if (result != null)
                {
                    var tResult = JsonConvert.DeserializeObject<TResult>(result.ToString());
                    return tResult;
                }
                return default(TResult);
            }
            catch (Exception)
            {
                return Get<TResult>();
            }
        }

        public void Set<TResult>(object value)
        {
            try
            {
                var result = JsonConvert.SerializeObject(value);
                _dataCache.Put(ComputeKey(typeof (TResult)), result, _maxTtl);
            }
            catch (Exception)
            {
                Set<TResult>(value);
            }
        }
    }
}
