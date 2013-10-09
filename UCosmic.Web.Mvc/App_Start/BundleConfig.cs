#if DEBUG
using System.Linq;
#endif
using System.Web.Optimization;

namespace UCosmic.Web.Mvc
{
    public static class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            // uncomment the following line to enable bundle optimization at debug time.
            //BundleTable.EnableOptimizations = true;

#if !DEBUG
            // uncomment the following line to disable bundle optimization at deployment time.
            //BundleTable.EnableOptimizations = false;
#endif

            #region Default Bundles
#if DEBUG && OFFLINE
            // jQuery
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/scripts/jquery/jquery-{version}.js"));
#endif
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

                // for some reason, kendo web ui does not work when jQuery is minified & bundled like this.
                // current solution is to get jQuery separately from google's CDN and exclude it from the layout bundle.

                //"~/scripts/jquery/jquery-{version}.js",

                "~/scripts/jquery/jquery-ui-{version}.js",
                "~/scripts/ko/knockout-{version}.js",
                "~/scripts/ko/knockout.mapping-latest.js",
                "~/scripts/ko/knockout.validation.js",
                "~/scripts/ko/knockout.binding-handlers.js",
                "~/scripts/sammy/sammy-{version}.js",
                "~/scripts/kendo/2013.2.716/kendo.web.js",
                "~/scripts/oss/jquery.placeholder.js",
                "~/scripts/oss/jquery.animate-enhanced.js",
                "~/scripts/oss/jquery.autosize.js",
                "~/scripts/app/App.js",
                "~/scripts/app/SideSwiper.js",
                "~/scripts/app/Routes.js",
                "~/scripts/app/Flasher.js",
                "~/scripts/oss/moment.js"));

            // establishment search page
            bundles.Add(new ScriptBundle("~/bundles/establishments").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/viewmodels/establishments/SearchResult.js",
                "~/scripts/viewmodels/establishments/Search.js"));

            // establishment item form
            bundles.Add(new ScriptBundle("~/bundles/establishments/item").Include(
                "~/scripts/google/ToolsOverlay.js",
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/viewmodels/places/Utils.js",
                "~/scripts/viewmodels/establishments/SearchResult.js",
                "~/scripts/viewmodels/establishments/Search.js",
                "~/scripts/viewmodels/establishments/Name.js",
                "~/scripts/viewmodels/establishments/Url.js",
                "~/scripts/viewmodels/establishments/Location.js",
                "~/scripts/viewmodels/establishments/Item.js"));

            bundles.Add(new ScriptBundle("~/bundles/agreements").Include(
                "~/scripts/jquery/jquery.globalize/globalize.js",
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/google/toolsoverlay.js",
                "~/scripts/viewmodels/establishments/SearchResult.js",
                "~/scripts/viewmodels/establishments/Search.js",
                "~/scripts/viewmodels/establishments/Name.js",
                "~/scripts/viewmodels/establishments/Url.js",
                "~/scripts/viewmodels/establishments/Location.js",
                "~/scripts/viewmodels/establishments/Item.js",
                "~/scripts/viewmodels/agreements/scrollBody.js",
                "~/scripts/viewmodels/agreements/contacts.js",
                "~/scripts/viewmodels/agreements/populateFiles.js",
                "~/scripts/viewmodels/agreements/fileAttachments.js",
                "~/scripts/viewmodels/agreements/datesStatus.js",
                "~/scripts/viewmodels/agreements/visibility.js",
                "~/scripts/viewmodels/agreements/basicInfo.js",
                "~/scripts/viewmodels/agreements/participants.js",
                "~/scripts/viewmodels/agreements/phones.js",
                "~/scripts/viewmodels/agreements/establishmentSearchNav.js",
                "~/scripts/viewmodels/agreements/agreementVM.js"));

            bundles.Add(new ScriptBundle("~/bundles/agreementSearch").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/viewmodels/agreements/searchResult.js",
                "~/scripts/viewmodels/agreements/search.js",
                "~/scripts/viewmodels/agreements/publicView.js",
                "~/scripts/viewmodels/agreements/populateFiles.js",
                "~/scripts/oss/moment.js"));

            bundles.Add(new ScriptBundle("~/bundles/agreementPublicView").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/viewmodels/agreements/publicView.js",
                "~/scripts/viewmodels/agreements/populateFiles.js",
                "~/scripts/oss/moment.js"));

            // employee personal profile page
            bundles.Add(new ScriptBundle("~/bundles/people").Include(
                "~/scripts/datacontext/people.js",
                "~/scripts/datacontext/peoplewebservice.js",
                //"~/scripts/viewmodels/people/PersonalInfo.js",
                //"~/scripts/viewmodels/people/PersonalInfo2.js"),
                "~/scripts/viewmodels/people/PersonalInfo3.js",
                "~/scripts/viewmodels/people/EmailAddresses.js"));

            // my personal profile page
            bundles.Add(new ScriptBundle("~/bundles/my/profile").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/viewmodels/my/Profile.js"));

            // activities
            bundles.Add(new ScriptBundle("~/bundles/activities").Include(
                "~/scripts/oss/linq.js",
                "~/scripts/viewmodels/activities/ActivityEnums.js",
                "~/scripts/viewmodels/activities/Activities.js"));
            bundles.Add(new ScriptBundle("~/bundles/activity").Include( // do not bundle tinyMCE, causes errors when optimized.
                "~/scripts/oss/linq.js",
                "~/scripts/viewmodels/activities/ActivityEnums.js",
                "~/scripts/viewmodels/activities/Activity.js",
                "~/scripts/app/Spinner.js"));

            // geographic expertise
            bundles.Add(new ScriptBundle("~/bundles/geographicExpertises").Include(
                "~/scripts/viewmodels/geographicExpertises/GeographicExpertises.js"));
            bundles.Add(new ScriptBundle("~/bundles/geographicExpertise").Include(
                "~/scripts/viewmodels/geographicExpertises/GeographicExpertise.js"));

            // language expertise
            bundles.Add(new ScriptBundle("~/bundles/languageExpertises").Include(
                "~/scripts/viewmodels/languageExpertises/LanguageExpertises.js"));
            bundles.Add(new ScriptBundle("~/bundles/languageExpertise").Include(
                "~/scripts/viewmodels/languageExpertises/LanguageExpertise.js"));

            // international affiliation
            bundles.Add(new ScriptBundle("~/bundles/internationalAffiliations").Include(
                "~/scripts/viewmodels/internationalAffiliations/InternationalAffiliations.js"));
            bundles.Add(new ScriptBundle("~/bundles/internationalAffiliation").Include(
                "~/scripts/viewmodels/internationalAffiliations/InternationalAffiliation.js"));

            // degrees
            bundles.Add(new ScriptBundle("~/bundles/degrees").Include(
                "~/scripts/viewmodels/degrees/Degrees.js"));
            bundles.Add(new ScriptBundle("~/bundles/degree").Include(
                "~/scripts/viewmodels/degrees/Degree.js"));

            // affiliations
            bundles.Add(new ScriptBundle("~/bundles/affiliations").Include(
                "~/scripts/viewmodels/affiliations/Affiliations.js"));
            bundles.Add(new ScriptBundle("~/bundles/affiliation").Include(
                "~/scripts/viewmodels/affiliations/Affiliation.js"));

            // employees, faculty and staff
            bundles.Add(new ScriptBundle("~/bundles/employees").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/viewmodels/employees/Employees.js"));

            // user search page
            bundles.Add(new ScriptBundle("~/bundles/users").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/app/PagedSearch.js",
                "~/scripts/viewmodels/users/SearchResult.js",
                "~/scripts/viewmodels/users/Search.js"));

            // user create form
            bundles.Add(new ScriptBundle("~/bundles/users/create").Include(
                "~/scripts/app/Spinner.js",
                "~/scripts/viewmodels/users/User.js"));

            // bootstrap css bundles
            var tenants = new[]
            {
                "_default",
                "suny.edu",
                "uc.edu",
                "uwi.edu",
                "lehigh.edu",
                "usf.edu",
            };
#if DEBUG
            tenants = tenants.Concat(new[] { "testshib.org" }).ToArray();
#endif
            foreach (var tenant in tenants)
            {
                bundles.Add(new StyleBundle(string.Format("~/styles/tenants/{0}/main", tenant)).Include(
                    "~/styles/reset.css",
                    "~/styles/sass/sheets/maps.css",
                    string.Format("~/styles/tenants/{0}/layout.css", tenant),
                    string.Format("~/styles/tenants/{0}/designs.css", tenant),
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

            // KendoUI uniform theme
            bundles.Add(new StyleBundle("~/content/kendo/2013.2.716/uniform-css").Include(
                "~/content/kendo/2013.2.716/kendo.common.css",
                "~/content/kendo/2013.2.716/kendo.uniform.css"));


        }
    }
}