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
            catch (Exception ex)
            {
                return Get<TResult>();
            }
        }

        public void Set<TResult>(object value)
        {
            try
            {
                var result = JsonConvert.SerializeObject(value);
                _dataCache.Put(ComputeKey(typeof (TResult)), result);
            }
            catch (Exception ex)
            {
                Set<TResult>(value);
            }
        }

        private string ComputeKey(Type type)
        {
            return string.Format("view:{0}", type.FullName);
        }
    }
}
