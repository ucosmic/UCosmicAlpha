using Elmah;
using System;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Http;

namespace UCosmic.Web.Mvc
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class ElmahHandleApiErrorAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            base.OnException(actionExecutedContext);
            var exception = actionExecutedContext.Exception;
            if (exception is HttpResponseException) return;
            if (RaiseErrorSignal(exception) || IsFiltered(actionExecutedContext))
                return;
            LogException(exception);
        }

        private static bool RaiseErrorSignal(Exception e)
        {
            var current = HttpContext.Current;
            if (current == null)
                return false;
            var applicationInstance = HttpContext.Current.ApplicationInstance;
            if (applicationInstance == null)
                return false;
            var errorSignal = ErrorSignal.Get(applicationInstance);
            if (errorSignal == null)
                return false;
            errorSignal.Raise(e, current);
            return true;
        }

        private static bool IsFiltered(HttpActionExecutedContext context)
        {
            var filterConfiguration = HttpContext.Current.GetSection("elmah/errorFilter") as ErrorFilterConfiguration;
            if (filterConfiguration == null)
                return false;
            var assertionHelperContext = new ErrorFilterModule.AssertionHelperContext(context.Exception, HttpContext.Current);
            return filterConfiguration.Assertion.Test(assertionHelperContext);
        }

        private static void LogException(Exception e)
        {
            var current = HttpContext.Current;
            ErrorLog.GetDefault(current).Log(new Error(e, current));
        }
    }
}
