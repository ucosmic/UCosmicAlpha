using AttributeRouting.Web.Http;

namespace UCosmic.Www.Mvc
{
    public class DefaultApiHttpRouteConventionAttribute : DefaultHttpRouteConventionAttribute
    {
        public override string GetDefaultRoutePrefix(System.Reflection.MethodInfo actionMethod)
        {
            var controllerName = base.GetDefaultRoutePrefix(actionMethod);
            return string.Format("api/{0}", controllerName);
        }
    }
}