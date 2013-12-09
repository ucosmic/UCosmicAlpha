var ViewModels;
(function (ViewModels) {
    (function (Representatives) {
        var RepModuleSettings = (function () {
            function RepModuleSettings(welcomeMessage, emailMessage) {
                this.welcomeMessage = welcomeMessage;
                this.emailMessage = emailMessage;
            }
            return RepModuleSettings;
        })();
        Representatives.RepModuleSettings = RepModuleSettings;
    })(ViewModels.Representatives || (ViewModels.Representatives = {}));
    var Representatives = ViewModels.Representatives;
})(ViewModels || (ViewModels = {}));
