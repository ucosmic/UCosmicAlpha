using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Areas.ActivitiesDeprecated
{
    public class ActivitiesDeprecatedAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "ActivitiesDeprecated";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "ActivitiesDeprecated_default",
                "ActivitiesDeprecated/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
