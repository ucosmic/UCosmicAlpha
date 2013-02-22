using System;
using System.Linq;
using System.Net.Http;
using System.Web;
using Newtonsoft.Json;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{
    public static class TenancyExtensions
    {
        private const string CookieName = "Tenancy";

        public static void Tenancy(this HttpResponseBase response, Tenancy tenancy)
        {
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

        public static Tenancy Tenancy(this HttpRequestMessage request)
        {
            // default tenancy is empty
            var json = "{}";

            // try to get tenancy json from cookie
            var cookie = request.Headers.GetCookies(CookieName).FirstOrDefault();
            if (cookie != null)
                json = cookie[CookieName].Value ?? json;

            // deserialize & return the tenancy from json
            var tenancy = JsonConvert.DeserializeObject<Tenancy>(json);
            return tenancy;
        }
    }
}