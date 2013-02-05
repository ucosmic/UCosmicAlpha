using System.Web.Mvc;

namespace UCosmic.Web.Mvc.Areas.PeopleDeprecated
{
    public class PeopleDeprecatedAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "PeopleDeprecated";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "PeopleDeprecated_default",
                "PeopleDeprecated/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
