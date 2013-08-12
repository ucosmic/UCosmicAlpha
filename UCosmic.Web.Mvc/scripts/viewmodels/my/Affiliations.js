var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    (function (My) {
        var Affiliations = (function () {
            function Affiliations() {
            }
            return Affiliations;
        })();
        My.Affiliations = Affiliations;
    })(ViewModels.My || (ViewModels.My = {}));
    var My = ViewModels.My;
})(ViewModels || (ViewModels = {}));
