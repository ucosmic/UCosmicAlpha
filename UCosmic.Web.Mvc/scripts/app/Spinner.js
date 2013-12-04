/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
var App;
(function (App) {
    var Spinner = (function () {
        //constructor(options?: ISpinnerxOptions) {
        //    if (!options) options = new SpinnerxOptions();
        //    this._delay = options.delay;
        //    this.isVisible(options.isVisible);
        //    this.isRunning(options.isVisible);
        //}
        function Spinner(settings) {
            if (typeof settings === "undefined") { settings = {}; }
            this.settings = settings;
            //private _delay: number;
            // this offers a way to short circuit the spinner when its activity time is
            // greater than zero but less than the delay
            //private _isActivated: KnockoutObservable<boolean> = ko.observable(true);
            this.isRunning = ko.observable(true);
            //private inTransition: KnockoutObservable<boolean> = ko.observable(false);
            this.isVisible = ko.observable(false);
            this.settings = $.extend({}, Spinner.defaultSettings, this.settings);

            //if (!options) options = new SpinnerxOptions();
            //this._delay = options.delay;
            this.isRunning(this.settings.runImmediately);
            this.isVisible(this.settings.runImmediately);
        }
        Spinner.prototype.start = function (immediately) {
            if (typeof immediately === "undefined") { immediately = false; }
            var _this = this;
            //this._isActivated(true); // we are entering an ajax call
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
            //this.inTransition(false);
            this.isVisible(false);
            this.isRunning(false);
            //this._isActivated(false);
        };
        Spinner.defaultSettings = {
            delay: 0,
            runImmediately: false
        };
        return Spinner;
    })();
    App.Spinner = Spinner;
})(App || (App = {}));
//# sourceMappingURL=Spinner.js.map
