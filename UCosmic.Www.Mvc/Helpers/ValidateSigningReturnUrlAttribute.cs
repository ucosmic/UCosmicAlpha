using System;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class ValidateSigningReturnUrlAttribute : ActionFilterAttribute
    {
        private const string ReturnUrlParamName = "returnUrl";
        private string[] _invalidUrls;
        private Uri _requestUri;

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            // do not allow redirects to certain pages after certain sign in/on/out/off operations
            base.OnActionExecuting(filterContext);
            Initialize(filterContext); // to avoid passing filterContext arg to private methods

            var returnUrl = filterContext.ActionParameters[ReturnUrlParamName] as string;
            if (returnUrl == null) return;

            // TODO when signing in from home, redirect to default forms authentication url

            // when signing in from sign out page, do not redirect back to sign out page
            if (!IsValidReturnUrl(returnUrl))
            {
                // look for nested return url
                var nestedReturnUrl = ExtractNestedValidReturnUrl(returnUrl);
                if (nestedReturnUrl != null)
                {
                    // redirect back to this URL with new valid returnUrl param
                    var request = filterContext.HttpContext.Request;
                    var redirectUrl = new StringBuilder(_requestUri.AbsolutePath);
                    foreach (string paramName in request.QueryString)
                    {
                        redirectUrl.Append(redirectUrl.Length == _requestUri.AbsolutePath.Length ? '?' : '&');
                        redirectUrl.Append(string.Format("{0}=", HttpUtility.UrlEncode(paramName)));
                        redirectUrl.Append(string.Equals(paramName, ReturnUrlParamName, StringComparison.OrdinalIgnoreCase)
                            ? HttpUtility.UrlEncode(nestedReturnUrl)
                            : HttpUtility.UrlEncode(request.QueryString[paramName]));
                    }
                    filterContext.Result = new RedirectResult(redirectUrl.ToString());
                }
            }
        }

        private void Initialize(ActionExecutingContext filterContext)
        {
            var urlHelper = new UrlHelper(filterContext.RequestContext);
            _invalidUrls = new[]
            {
                urlHelper.Action(MVC.Identity.SignIn()).WithoutTrailingSlash(),
                urlHelper.Action(MVC.Identity.SignOut()).WithoutTrailingSlash(),
            };

            if (filterContext.HttpContext.Request.Url == null)
                throw new InvalidOperationException(
                    "An unexpected error has occurred (HttpRequestBase.Url was null).");
            _requestUri = filterContext.HttpContext.Request.Url;
        }

        private bool IsValidReturnUrl(string returnUrl)
        {
            var invalidReturnUrls = _invalidUrls;
            foreach (var invalidReturnUrl in invalidReturnUrls)
                if (returnUrl.StartsWith(invalidReturnUrl)) return false;
            return true;
        }

        private string ExtractNestedValidReturnUrl(string returnUrl)
        {
            var queryString = HttpUtility.ParseQueryString(string.Join(string.Empty, returnUrl.Split('?').Skip(1)));
            var nestedReturnUrl = queryString[ReturnUrlParamName];
            if (nestedReturnUrl != null)
                return IsValidReturnUrl(nestedReturnUrl) 
                    ? nestedReturnUrl 
                    : ExtractNestedValidReturnUrl(nestedReturnUrl);
            return null;
        }
    }
}