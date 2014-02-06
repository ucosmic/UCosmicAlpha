using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public class CurrentModuleTabAttribute : ActionFilterAttribute
    {
        private readonly ModuleTab _moduleTab;

        public CurrentModuleTabAttribute(ModuleTab moduleTab)
        {
            _moduleTab = moduleTab;
        }

        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            filterContext.Controller.ViewData[string.Format("{0}ModuleTab", _moduleTab)] = "current";
        }
    }

    public enum ModuleTab
    {
        Employees,
        Admin,
    }
}