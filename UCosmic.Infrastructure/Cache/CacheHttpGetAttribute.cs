using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Newtonsoft.Json;

namespace UCosmic.Cache
{
    // based on strathweb implementation
    // http://www.strathweb.com/2012/05/output-caching-in-asp-net-web-api/
    public class CacheHttpGetAttribute : ActionFilterAttribute
    {
        public int Duration { get; set; }

        public IProvideCache CacheProvider { get; set; }

        private IProvideCache GetCache()
        {
            if (_cache == null)
                _cache = CacheProvider ?? new ObjectCacheProvider(MemoryCache.Default);
            return _cache;
        }

        private IProvideCache _cache;

        private bool IsCacheable(HttpActionContext actionContext)
        {
            if (Duration < 1)
                throw new InvalidOperationException("Duration must be greater than zero.");

            // only cache for GET requests
            return actionContext.Request.Method == HttpMethod.Get;
        }

        private CacheControlHeaderValue SetClientCache()
        {
            var cachecontrol = new CacheControlHeaderValue
            {
                MaxAge = TimeSpan.FromSeconds(Duration),
                MustRevalidate = true
            };
            return cachecontrol;
        }

        private string _serverCacheKey;
        private string _clientCacheKey;

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext == null) throw new ArgumentNullException("actionContext");
            if (!IsCacheable(actionContext)) return;

            try
            {
                _serverCacheKey = string.Join(":",
                    new[]
                {
                    actionContext.Request.RequestUri.AbsoluteUri, 
                    actionContext.Request.Headers.Accept.First().ToString(),
                });
                _clientCacheKey = string.Join(":",
                    new[]
                {
                    _serverCacheKey,
                    "response-content-type",
                });

                var cache = GetCache();
                if (cache.Contains(_serverCacheKey))
                {
                    var serverValue = cache.Get(_serverCacheKey);
                    var clientValue = cache.Get(_clientCacheKey);
                    if (serverValue == null) return;

                    var contentType = clientValue != null
                        ? JsonConvert.DeserializeObject<MediaTypeHeaderValue>(clientValue.ToString())
                        : new MediaTypeHeaderValue(_serverCacheKey.Substring(_serverCacheKey.LastIndexOf(':') + 1));

                    actionContext.Response = actionContext.Request.CreateResponse();
                    actionContext.Response.Content = new StringContent(serverValue.ToString());
                    actionContext.Response.Content.Headers.ContentType = contentType;
                    actionContext.Response.Headers.CacheControl = SetClientCache();
                }
            }
            catch (Exception)
            {
                // TODO: add exception logging
            }
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            try
            {
                var cache = GetCache();
                if (!cache.Contains(_serverCacheKey))
                {
                    var serverValue = actionExecutedContext.Response.Content.ReadAsStringAsync().Result;
                    var contentType = actionExecutedContext.Response.Content.Headers.ContentType;
                    var clientValue = JsonConvert.SerializeObject(
                        new
                        {
                            contentType.MediaType,
                            contentType.CharSet
                        });

                    cache.Add(_serverCacheKey, serverValue, new TimeSpan(0, 0, Duration));
                    cache.Add(_clientCacheKey, clientValue, new TimeSpan(0, 0, Duration));
                }

                if (IsCacheable(actionExecutedContext.ActionContext))
                    actionExecutedContext.ActionContext.Response.Headers.CacheControl = SetClientCache();
            }
            catch (Exception)
            {
                // TODO: add exception logging
            }
        }
    }
}