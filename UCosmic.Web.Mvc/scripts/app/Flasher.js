/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
var App;
(function (App) {
    // private properties
    var ticks;
    var tickInterval;

    //private methods
    function init(flasher) {
        if (flasher.text()) {
            window.clearInterval(tickInterval);
            ticks = 9;
            flasher.tickCount(ticks);
            tickInterval = window.setInterval(function () {
                tick(flasher);
            }, 1000);
            flasher.isDismissing(false);
            flasher.isDismissed(false);
            flasher.$element.hide().removeClass('hide').fadeIn('fast');
        } else {
            flasher.isDismissed(true);
            flasher.isDismissing(false);
            if (tickInterval)
                window.clearInterval(tickInterval);
            if (flasher.$element)
                flasher.$element.addClass('hide');
        }
    }

    function tick(flasher) {
        if (ticks <= 0) {
            ticks = 0;
            window.clearInterval(tickInterval);
            flasher.dismiss();
        } else {
            --ticks;
        }
        flasher.tickCount(ticks);
    }

    // keep class private but implement exported interface
    var Flasher = (function () {
        function Flasher() {
            var _this = this;
            // text to be displayed in the flasher
            this.text = ko.observable();
            // number of seconds to display the flashed text
            this.tickCount = ko.observable(9);
            this.isDismissing = ko.observable();
            this.isDismissed = ko.observable();
            // DOM element that wraps the flasher markup
            this.$element = undefined;
            // register init as a computed so that it will execute
            // whenever an observable changes
            ko.computed(function () {
                init(_this);
            });
        }
        // set the text to be displayed in the flasher
        Flasher.prototype.flash = function (text) {
            this.text(undefined);
            if (text)
                this.text(text);
        };

        // fade out and then hide the flasher DOM element
        Flasher.prototype.dismiss = function () {
            var _this = this;
            this.isDismissing(true);
            this.$element.fadeOut('slow', function () {
                _this.text('');
                _this.$element.addClass('hide');
            });
        };
        return Flasher;
    })();
    App.Flasher = Flasher;

    App.flasher = new Flasher();

    // proxy to display flasher info on other page sections
    var FlasherProxy = (function () {
        function FlasherProxy() {
            var _this = this;
            this.text = ko.computed(function () {
                return App.flasher.text();
            });
            this.isVisible = ko.computed(function () {
                if (App.flasher.isDismissing() || App.flasher.isDismissed()) {
                    return false;
                }
                return _this.text() ? true : false;
            });
        }
        FlasherProxy.prototype.dismiss = function () {
            App.flasher.dismiss();
        };
        return FlasherProxy;
    })();
    App.FlasherProxy = FlasherProxy;
})(App || (App = {}));
//# sourceMappingURL=Flasher.js.map
