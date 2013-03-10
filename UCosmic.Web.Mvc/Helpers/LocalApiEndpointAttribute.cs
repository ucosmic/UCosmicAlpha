using System;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using UCosmic.Cryptography;

namespace UCosmic.Web.Mvc
{
    /// <summary>
    /// This action filter checks for a cookie written by the LocalApiAuthorizeAttribute
    /// and rejects requests that are not authorized for remote access.
    /// </summary>
    public class LocalApiEndpointAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            base.OnActionExecuting(actionContext);

            var isAuthorized = false;
            var secret = ConfigurationManager.AppSettings[LocalApiAuthorizeAttribute.SecretKey];
            var salt = actionContext.Request.GetHttpContext().Request.AnonymousID;
            if (secret != null && salt != null)
            {
                var cookies = actionContext.Request.Headers.GetCookies(LocalApiAuthorizeAttribute.CookieName);
                if (cookies != null && cookies.Count == 1)
                {
                    var cookie = cookies.Single();
                    var cookieCipher = cookie[LocalApiAuthorizeAttribute.CookieName].Value;
                    try
                    {
                        var cookieText = cookieCipher.DecryptAes(secret, salt);
                        DateTime cookieValueDateTime;
                        if (DateTime.TryParse(cookieText, CultureInfo.InvariantCulture,
                            DateTimeStyles.None, out cookieValueDateTime))
                        {
                            // request is authorized when cookie is less than 2 days old
                            var difference = cookieValueDateTime - DateTime.UtcNow;
                            if (difference.Days < 2) isAuthorized = true;
                        }
                    }
                    catch
                    {
                        isAuthorized = false;
                    }
                }
            }

            if (!isAuthorized)
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.Forbidden, "This API endpoint is not public.");
        }
    }
}