using System;
using Microsoft.ApplicationServer.Caching;
using Newtonsoft.Json;

namespace UCosmic.Cqrs
{
    public class AzureCacheViewManager : IManageViews
    {
        private readonly DataCache _dataCache;
        private readonly TimeSpan _maxTtl;

        public AzureCacheViewManager(DataCache dataCache, TimeSpan maxTtl)
        {
            _dataCache = dataCache;
            _maxTtl = maxTtl;
        }

        public TResult Get<TResult>(params object[] parameters)
        {
            try
            {
                var result = _dataCache.Get(typeof(TResult).GetViewKey(parameters));
                if (result != null)
                {
                    var tResult = JsonConvert.DeserializeObject<TResult>(result.ToString());
                    return tResult;
                }
                return default(TResult);
            }
            catch (Exception)
            {
                return Get<TResult>(parameters);
            }
        }

        public void Set<TResult>(object value, params object[] parameters)
        {
            try
            {
                var result = JsonConvert.SerializeObject(value);
                _dataCache.Put(typeof(TResult).GetViewKey(parameters), result, _maxTtl);
            }
            catch (Exception)
            {
                Set<TResult>(value, parameters);
            }
        }
    }
}
