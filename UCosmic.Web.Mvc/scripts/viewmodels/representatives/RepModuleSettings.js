var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    (function (RepModuleSettings) {
        var RepModuleSettings = (function () {
            function RepModuleSettings(welcomeMessage, emailMessage) {
                this._welcomeMessage = welcomeMessage;
                this._emailMessage = emailMessage;
            }
            return RepModuleSettings;
        })();
        RepModuleSettings.RepModuleSettings = RepModuleSettings;
    })(ViewModels.RepModuleSettings || (ViewModels.RepModuleSettings = {}));
    var RepModuleSettings = ViewModels.RepModuleSettings;
})(ViewModels || (ViewModels = {}));
