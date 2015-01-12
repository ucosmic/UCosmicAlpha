var App;
(function (App) {
    var Spinner = (function () {
        function Spinner(settings) {
            if (settings === void 0) { settings = {}; }
            this.settings = settings;
            this.isRunning = ko.observable(true);
            this.isVisible = ko.observable(false);
            this.settings = $.extend({}, Spinner.defaultSettings, this.settings);
            this.isRunning(this.settings.runImmediately);
            this.isVisible(this.settings.runImmediately);
        }
        Spinner.prototype.start = function (immediately) {
            var _this = this;
            if (immediately === void 0) { immediately = false; }
            this.isRunning(true);
            if (this.settings.delay < 1 || immediately)
                this.isVisible(true);
            else
                setTimeout(function () {
                    if (_this.isRunning())
                        _this.isVisible(true);
                }, this.settings.delay);
        };
        Spinner.prototype.stop = function () {
            this.isVisible(false);
            this.isRunning(false);
        };
        Spinner.defaultSettings = {
            delay: 0,
            runImmediately: false,
        };
        return Spinner;
    })();
    App.Spinner = Spinner;
})(App || (App = {}));
