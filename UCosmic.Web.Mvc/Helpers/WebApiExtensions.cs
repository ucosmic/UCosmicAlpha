using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace UCosmic.Web.Mvc
{
    public static class WebApiExtensions
    {
        public static HttpContextBase GetHttpContext(this HttpRequestMessage request)
        {
            if (request != null)
            {
                // look in properties
                const string keyName = "MS_HttpContext";
                if (request.Properties.ContainsKey(keyName))
                {
                    return request.Properties[keyName] as HttpContextBase;
                }
            }
            return null;
        }

        public static bool GetIsLocal(this HttpRequestMessage request)
        {
            if (request != null)
            {
                // look in properties
                const string keyName = "MS_IsLocal";
                if (request.Properties.ContainsKey(keyName))
                {
                    var isLocal = request.Properties[keyName] as Lazy<bool>;
                    if (isLocal != null) return isLocal.Value;
                }
            }
            throw new NotSupportedException("Could not get IsLocal from WebAPI HTTP Request Properties.");
        }
    }
}