using System.Web.Optimization;

namespace UCosmic.Web.Mvc
{
    public static class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            //BundleTable.EnableOptimizations = true;

            #region Default Bundles
            //// jQuery
            //bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
            //            "~/scripts/jquery/jquery-{version}.js"));
            //
            //// jQuery UI
            //bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
            //            "~/scripts/jquery/jquery-ui-{version}.js"));
            //
            //// jquery validation, plus ms unobtrusive validation and ajax
            //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
            //            "~/scripts/oss/jquery.unobtrusive*",
            //            "~/scripts/oss/jquery.validate*"));
            //
            //// knockout
            //bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
            //            "~/scripts/knockout-*"));
            #endregion

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/scripts/modernizr/modernizr-{version}.js"));

            // bundles for layout (all pages)
            bundles.Add(new ScriptBundle("~/bundles/layout").Include(
                        "~/scripts/jquery/jquery-{version}.js",
                        "~/scripts/jquery/jquery-ui-{version}.js",
                        "~/scripts/ko/knockout-{version}.js",
                        "~/scripts/ko/knockout.mapping-latest.js",
                        "~/scripts/ko/knockout.validation.js",
                        "~/scripts/ko/knockout.binding-handlers.js",
                        "~/scripts/sammy/sammy-{version}.js",
                        "~/scripts/oss/jquery.placeholder.js",
                        "~/scripts/oss/jquery.animate-enhanced.js",
                        "~/scripts/oss/jquery.autosize.js",
                        "~/scripts/app/App.js",
                        "~/scripts/app/SideSwiper.js",
                        "~/scripts/app/Routes.js",
                        "~/scripts/viewmodels/FlasherViewModel.js"));

            // establishment search page
            bundles.Add(new ScriptBundle("~/bundles/establishments").Include(
                "~/scripts/viewmodels/Spinner.js",
                "~/scripts/viewmodels/PagedSearch.js",
                "~/scripts/viewmodels/places/ServerApiModel.js",
                "~/scripts/viewmodels/establishments/SearchResult.js",
                "~/scripts/viewmodels/establishments/Search.js"));

            // establishment item form
            bundles.Add(new ScriptBundle("~/bundles/establishments/item").Include(
                "~/scripts/google/ToolsOverlay.js",
                "~/scripts/viewmodels/Spinner.js",
                "~/scripts/viewmodels/languages/ServerApiModel.js",
                "~/scripts/viewmodels/places/ServerApiModel.js",
                "~/scripts/viewmodels/establishments/Name.js",
                "~/scripts/viewmodels/establishments/Url.js",
                "~/scripts/viewmodels/establishments/Item.js"));

            // employee personal info page
            bundles.Add(new ScriptBundle("~/bundles/employees").Include(
                "~/scripts/viewmodels/employees/PersonalInfo.js"));

            // bootstrap css bundles
            var tenants = new[]
            {
                "_default",
                "suny.edu",
                "uc.edu",
                "umn.edu",
                "lehigh.edu",
                "usf.edu",
            };
            foreach (var tenant in tenants)
            {
                bundles.Add(new StyleBundle(string.Format("~/styles/tenants/{0}/main", tenant)).Include(
                    "~/styles/reset.css",
                    "~/styles/sass/sheets/maps.css",
                    string.Format("~/styles/tenants/{0}/layout.css", tenant),
                    string.Format("~/styles/tenants/{0}/forms.css", tenant)));

                bundles.Add(new StyleBundle(string.Format("~/styles/tenants/{0}/ie8", tenant)).Include(
                    string.Format("~/styles/tenants/{0}/ie8.css", tenant)));
            }

            // internet explorer 8 sucks
            bundles.Add(new StyleBundle("~/bundles/legacy/ie8").Include(
                "~/styles/ie8/layout.css"
            ));

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