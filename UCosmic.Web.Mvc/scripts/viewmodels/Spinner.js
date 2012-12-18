var ViewModels;
(function (ViewModels) {
    var Spinner = (function () {
        function Spinner(delay) {
            if (typeof delay === "undefined") { delay = 400; }
            this.delay = 400;
            this.isActivated = ko.observable(true);
            this.isVisible = ko.observable(false);
            this.delay = delay;
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

