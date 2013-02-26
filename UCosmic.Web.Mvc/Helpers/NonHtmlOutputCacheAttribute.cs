using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    // http://stackoverflow.com/q/1755313/304832
    public class NonHtmlOutputCacheAttribute : OutputCacheAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            string contentType = null;
            var notChildAction = !filterContext.IsChildAction;

            if (notChildAction)
                contentType = filterContext.HttpContext.Response.ContentType;

            base.OnResultExecuting(filterContext);

            if (notChildAction)
                filterContext.HttpContext.Response.ContentType = contentType;
        }
    }
}