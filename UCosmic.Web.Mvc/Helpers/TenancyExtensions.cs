using System;
using System.Web;
using Newtonsoft.Json;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{
    public static class TenancyExtensions
    {
        private const string CookieName = "Tenancy";

        public static void Tenancy(this HttpResponseBase response, string domain, int? tenantId = null, int? personId = null, int? userId = null, string userName = null)
        {
            // create tenancy model object
            var tenancy = new Tenancy
           {
               Domain = domain,
               TenantId = tenantId,
               PersonId = personId,
               UserId = userId,
               UserName = userName,
           };

            // serialize model to json
            var json = JsonConvert.SerializeObject(tenancy);

            // create a cookie
            var cookie = new HttpCookie(CookieName, json)
            {
                Expires = DateTime.UtcNow.AddDays(60),
            };

            // write the cookie
            response.SetCookie(cookie);
        }

        public static Tenancy Tenancy(this HttpRequestBase request)
        {
            // default tenancy is empty
            var json = "{}";

            // try to get tenancy json from cookie
            var cookie = request.Cookies.Get(CookieName);
            if (cookie != null)
                json = cookie.Value ?? json;

            // deserialize & return the tenancy from json
            var tenancy = JsonConvert.DeserializeObject<Tenancy>(json);
            return tenancy;
        }
    }
}