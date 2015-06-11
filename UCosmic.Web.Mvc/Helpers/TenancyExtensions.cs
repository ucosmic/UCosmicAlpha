using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Principal;
using System.Web;
using Newtonsoft.Json;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{

    public static class TenancyExtensions
    {
        public static int IndexOfNth(string str, char c, int n)
        {
            int remaining = n;
            for (int i = 0; i < str.Length; i++)
            {
                if (str[i] == c)
                {
                    remaining--;
                    if (remaining == 0)
                    {
                        return i;
                    }
                }
            }
            return -1;
        }
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
            {
                json = cookie.Value ?? json;
            }
            else
            {
                if (request.Path.Length > 1)
                {
                    string domain = request.Path.Substring(1);
                    if (domain.IndexOf("/") > 0)
                    {
                        domain = domain.Substring(0, domain.IndexOf("/"));
                        string estId = request.QueryString["establishmentId"];
                        json = "{\"StyleDomain\":\"" + domain + "\", \"TenantId\":\"" + estId + "\"}";
                    }
                }
            }

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

        private const string UserImpersonatingKey = "UserImpersonating";

        public static void UserImpersonating(this HttpSessionStateBase session, IPrincipal principal, IEnumerable<string> roleNames = null)
        {
            if (principal == null)
            {
                session.Remove(UserImpersonatingKey);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(principal.Identity.Name))
                    throw new ArgumentException("Anonymous users cannot impersonate.");

                roleNames = roleNames ?? new string[0];
                var sessionIdentity = new GenericIdentity(principal.Identity.Name);
                var sessionPrincipal = new GenericPrincipal(sessionIdentity, roleNames.ToArray());
                session[UserImpersonatingKey] = sessionPrincipal;
            }
        }

        public static IPrincipal UserImpersonating(this HttpSessionStateBase session)
        {
            return session[UserImpersonatingKey] as IPrincipal;
        }

        //public static void UserImpersonating(this TempDataDictionary tempData, bool isImpersonating)
        //{
        //    tempData[UserImpersonatingKey] = isImpersonating;
        //}

        //public static bool UserImpersonating(this TempDataDictionary tempData)
        //{
        //    var isImpersonatingAsObject = tempData[UserImpersonatingKey];
        //    if (isImpersonatingAsObject is bool)
        //        return (bool) isImpersonatingAsObject;
        //    return false;
        //}


        //public static void Firebase_token(this HttpResponseBase response, String firebase_token)
        //{
        //    // serialize model to json
        //    //var json = JsonConvert.SerializeObject(firebase_token);

        //    // create a cookie
        //    var cookie = new HttpCookie(CookieName, firebase_token)
        //    {
        //        Expires = DateTime.UtcNow.AddDays(60),
        //    };

        //    // write the cookie
        //    response.SetCookie(cookie);
        //}

        //public static String Firebase_token(this HttpRequestBase request)
        //{
        //    // default firebase_token is empty
        //    var json = "{}";

        //    // try to get firebase_token json from cookie
        //    var cookie = request.Cookies.Get(CookieName);
        //    if (cookie != null)
        //    {
        //        json = cookie.Value ?? json;
        //    }


        //    // deserialize & return the firebase_token from json
        //    var firebase_token = JsonConvert.DeserializeObject<String>(json);
        //    return firebase_token;
        //}

        //public static String Firebase_token(this HttpRequestMessage request)
        //{
        //    // default firebase_token is empty
        //    var json = "{}";

        //    // try to get firebase_token json from cookie
        //    var cookie = request.Headers.GetCookies(CookieName).FirstOrDefault();
        //    if (cookie != null)
        //        json = cookie[CookieName].Value ?? json;

        //    // deserialize & return the firebase_token from json
        //    var firebase_token = json;
        //    return firebase_token;
        //}
    }
}