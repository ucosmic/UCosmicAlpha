using System.Web;
using System.Web.Optimization;

namespace UCosmicLayout3
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            // jQuery
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/scripts/jquery-{version}.js"));

            // jQuery UI
            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/scripts/jquery-ui-{version}.js"));

            // jquery validation, plus ms unobtrusive validation and ajax
            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/scripts/jquery.unobtrusive*",
                        "~/scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/scripts/modernizr-*"));

            // bootstrap css bundle
            bundles.Add(new StyleBundle("~/bundles/css").Include(
                        "~/styles/reset.css",
                        "~/styles/layout.css",
                        "~/styles/forms.css"));

            // jQuery UI theme
            bundles.Add(new StyleBundle("~/content/themes/base/css").Include(
                        "~/content/themes/base/jquery.ui.core.css",
                        "~/content/themes/base/jquery.ui.resizable.css",
                        "~/content/themes/base/jquery.ui.selectable.css",
                        "~/content/themes/base/jquery.ui.accordion.css",
                        "~/content/themes/base/jquery.ui.autocomplete.css",
                        "~/content/themes/base/jquery.ui.button.css",
                        "~/content/themes/base/jquery.ui.dialog.css",
                        "~/content/themes/base/jquery.ui.slider.css",
                        "~/content/themes/base/jquery.ui.tabs.css",
                        "~/content/themes/base/jquery.ui.datepicker.css",
                        "~/content/themes/base/jquery.ui.progressbar.css",
                        "~/content/themes/base/jquery.ui.theme.css"));
        }
    }
}