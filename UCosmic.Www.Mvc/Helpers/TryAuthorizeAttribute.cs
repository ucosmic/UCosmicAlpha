using System.Web.Mvc;

namespace UCosmic.Www.Mvc
{
    public class TryAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (!string.IsNullOrWhiteSpace(filterContext.HttpContext.User.Identity.Name))
            {
                filterContext.Result = new ViewResult
                {
                    ViewName = MVC.Errors.Views.Unauthorized,
                };
            }
            else
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
        }
    }
}