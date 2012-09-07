using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace UCosmic.Www.Mvc
{
    public class HttpOutputCacheAttribute : ActionFilterAttribute
    {
        //public int Duration { get; set; }

        //// cache length in seconds
        //private int _timespan;
        //// client cache length in seconds
        //private int _clientTimeSpan;

        public int Duration { get; set; }
        
        //// cache for anonymous users only?
        //private bool _anonymousOnly;
        // cache key
        private string _cachekey;
        // cache repository
        private static readonly ObjectCache WebApiCache = MemoryCache.Default;

        //public HttpOutputCacheAttribute(int timespan, int clientTimeSpan, bool anonymousOnly)
        //{
        //    _timespan = timespan;
        //    _clientTimeSpan = clientTimeSpan;
        //    _anonymousOnly = anonymousOnly;
        //}

        private bool IsCacheable(HttpActionContext ac)
        {
            //if (_timespan > 0 && _clientTimeSpan > 0)
            if (Duration > 0)
            {
                //if (_anonymousOnly)
                //    if (Thread.CurrentPrincipal.Identity.IsAuthenticated)
                //        return false;
                if (ac.Request.Method == HttpMethod.Get) return true;
            }
            else
            {
                throw new InvalidOperationException("Wrong Arguments");
            }
            return false;
        }

        private CacheControlHeaderValue SetClientCache()
        {
            var cachecontrol = new CacheControlHeaderValue
            {
                MaxAge = TimeSpan.FromSeconds(Duration), 
                MustRevalidate = true
            };
            //cachecontrol.MaxAge = TimeSpan.FromSeconds(_clientTimeSpan);
            return cachecontrol;
        }



        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext == null) throw new ArgumentNullException("actionContext");

            if (IsCacheable(actionContext))
            {

                _cachekey = string.Join(":", new[] { actionContext.Request.RequestUri.AbsolutePath, actionContext.Request.Headers.Accept.First().ToString() });
                if (WebApiCache.Contains(_cachekey))
                {
                    var val = (string)WebApiCache.Get(_cachekey);
                    if (val != null)
                    {
                        actionContext.Response = actionContext.Request.CreateResponse();
                        actionContext.Response.Content = new StringContent(val);
                        var contenttype = (MediaTypeHeaderValue)WebApiCache.Get(_cachekey + ":response-ct") ??
                                          new MediaTypeHeaderValue(_cachekey.Split(':')[1]);
                        actionContext.Response.Content.Headers.ContentType = contenttype;
                        actionContext.Response.Headers.CacheControl = SetClientCache();
                    }
                }
            }
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            if (!(WebApiCache.Contains(_cachekey)))
            {
                var body = actionExecutedContext.Response.Content.ReadAsStringAsync().Result;
                //WebApiCache.Add(_cachekey, body, DateTime.Now.AddSeconds(_timespan));
                WebApiCache.Add(_cachekey, body, DateTime.Now.AddSeconds(Duration));
                //WebApiCache.Add(_cachekey + ":response-ct", actionExecutedContext.Response.Content.Headers.ContentType, DateTime.Now.AddSeconds(_timespan));
                WebApiCache.Add(_cachekey + ":response-ct", actionExecutedContext.Response.Content.Headers.ContentType, DateTime.Now.AddSeconds(Duration));
            }
            if (IsCacheable(actionExecutedContext.ActionContext))
                actionExecutedContext.ActionContext.Response.Headers.CacheControl = SetClientCache();
        }
    }
}