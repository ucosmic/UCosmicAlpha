var ViewModels;
(function (ViewModels) {
    var SpinnerOptions = (function () {
        function SpinnerOptions(delay, isVisible) {
            if (typeof delay === "undefined") { delay = 0; }
            if (typeof isVisible === "undefined") { isVisible = false; }
            this.delay = delay;
            this.isVisible = isVisible;
        }
        return SpinnerOptions;
    })();
    ViewModels.SpinnerOptions = SpinnerOptions;    
    var Spinner = (function () {
        function Spinner(options) {
            this.isActivated = ko.observable(true);
            this.isVisible = ko.observable(false);
            if(!options) {
                options = new SpinnerOptions();
            }
            this.delay = options.delay;
            this.isVisible(options.isVisible);
        }
        Spinner.prototype.start = function () {
            var _this = this;
            this.isActivated(true);
            if(this.delay < 1) {
                this.isVisible(true);
            } else {
                setTimeout(function () {
                    if(_this.isActivated()) {
                        _this.isVisible(true);
                    }
                }, this.delay);
            }
        };
        Spinner.prototype.stop = function () {
            this.isVisible(false);
            this.isActivated(false);
        };
        return Spinner;
    })();
    ViewModels.Spinner = Spinner;    
})(ViewModels || (ViewModels = {}));
