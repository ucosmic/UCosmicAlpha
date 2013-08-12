/// <reference path="../../../typings/knockout/knockout.d.ts" />
define(["require", "exports"], function(require, exports) {
    var SpinnerOptions = (function () {
        function SpinnerOptions(delay, isVisible) {
            if (typeof delay === "undefined") { delay = 0; }
            if (typeof isVisible === "undefined") { isVisible = false; }
            this.delay = delay;
            this.isVisible = isVisible;
        }
        return SpinnerOptions;
    })();
    exports.SpinnerOptions = SpinnerOptions;

    var Spinner = (function () {
        function Spinner(options) {
            // this offers a way to short circuit the spinner when its activity time is
            // greater than zero but less than the delay
            this.isActivated = ko.observable(true);
            //private inTransition: KnockoutObservable<boolean> = ko.observable(false);
            this.isVisible = ko.observable(false);
            if (!options)
                options = new SpinnerOptions();
            this.delay = options.delay;
            this.isVisible(options.isVisible);
        }
        Spinner.prototype.start = function () {
            var _this = this;
            this.isActivated(true);
            if (this.delay < 1)
                this.isVisible(true);
else
                setTimeout(function () {
                    if (_this.isActivated())
                        _this.isVisible(true);
                }, this.delay);
        };
        Spinner.prototype.stop = function () {
            //this.inTransition(false);
            this.isVisible(false);
            this.isActivated(false);
        };
        return Spinner;
    })();
    exports.Spinner = Spinner;
});
