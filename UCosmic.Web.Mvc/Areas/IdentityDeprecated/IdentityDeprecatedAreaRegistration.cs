using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Areas.IdentityDeprecated
{
    public class IdentityDeprecatedAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "IdentityDeprecated";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "IdentityDeprecated_default",
                "IdentityDeprecated/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
