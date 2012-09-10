using System;
using Microsoft.ApplicationServer.Caching;
using Newtonsoft.Json;

namespace UCosmic.Cqrs
{
    public class AzureCacheViewManager : IManageViews
    {
        private readonly DataCache _dataCache;

        public AzureCacheViewManager(DataCache dataCache)
        {
            _dataCache = dataCache;
        }

        public TResult Get<TResult>()
        {
            var result = _dataCache.Get(ComputeKey(typeof (TResult)));
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
            _dataCache.Put(ComputeKey(typeof (TResult)), result);
        }

        private string ComputeKey(Type type)
        {
            return string.Format("view:{0}", type.FullName);
        }
    }
}
