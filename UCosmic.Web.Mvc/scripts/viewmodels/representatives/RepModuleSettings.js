var ViewModels;
(function (ViewModels) {
    var Representatives;
    (function (Representatives) {
        var RepModuleSettings = (function () {
            function RepModuleSettings(welcomeMessage, emailMessage) {
                this.welcomeMessage = welcomeMessage;
                this.emailMessage = emailMessage;
            }
            return RepModuleSettings;
        })();
        Representatives.RepModuleSettings = RepModuleSettings;
    })(Representatives = ViewModels.Representatives || (ViewModels.Representatives = {}));
})(ViewModels || (ViewModels = {}));
