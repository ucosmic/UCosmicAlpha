var ViewModels;
(function (ViewModels) {
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
