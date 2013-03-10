using System;
using System.Configuration;
using System.Globalization;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using UCosmic.Cryptography;

namespace UCosmic.Web.Mvc
{
    /// <summary>
    /// This action filter writes a cookie which authenticates the browser
    /// to access API endpoints decorated with the LocalApiEndpointAttribute.
    /// </summary>
    public class LocalApiAuthorizeAttribute : ActionFilterAttribute
    {
        internal const string CookieName = "LocalApiToken";
        internal const string SecretKey = "LocalApiEncryptionSecret";

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            if (filterContext.IsChildAction) return;

            // cannot write an encrypted cookie without secret and salt
            // secret is stored as a config appSetting, use anonymous ID as the salt
            var secret = ConfigurationManager.AppSettings[SecretKey];
            var salt = filterContext.HttpContext.Request.AnonymousID;
            if (secret == null || salt == null) return;

            var needsNewCookie = true;
            var utcNow = DateTime.UtcNow;

            // first, check to see if the cookie already exists.
            var cookie = filterContext.HttpContext.Request.Cookies[CookieName];

            // if the cookie exists, check its age
            if (cookie != null && cookie.Value != null)
            {
                try
                {
                    var cookieValueDecoded = HttpUtility.UrlDecode(cookie.Value);
                    var cookieValueString = cookieValueDecoded.DecryptAes(secret, salt);
                    DateTime cookieValueDateTime;
                    if (DateTime.TryParse(cookieValueString, CultureInfo.InvariantCulture,
                        DateTimeStyles.None, out cookieValueDateTime))
                    {
                        // no need to rewrite the cookie unless it is over a day old
                        var difference = cookieValueDateTime - utcNow;
                        if (difference.Days < 1) needsNewCookie = false;
                    }
                }
                catch
                {
                    needsNewCookie = true;
                }
            }

            if (!needsNewCookie) return;

            var valueToEncrypt = utcNow.ToString(CultureInfo.InvariantCulture);
            var encryptedValue = valueToEncrypt.EncryptAes(secret, salt);
            var encodedValue = HttpUtility.UrlEncode(encryptedValue);
            cookie = new HttpCookie(CookieName, encodedValue)
            {
                Domain = FormsAuthentication.CookieDomain,
                HttpOnly = false,
                Path = "/",
#if DEBUG
                Secure = false,
#else
                Secure = true,
#endif
                Expires = utcNow.AddDays(2),
            };
            filterContext.HttpContext.Response.Cookies.Add(cookie);
        }
    }
}