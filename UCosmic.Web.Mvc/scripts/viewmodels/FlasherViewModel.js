var App;
(function (App) {
    var ticks;
    var tickInterval;
    function init(flasher) {
        if(flasher.text()) {
            window.clearInterval(tickInterval);
            ticks = 9;
            flasher.tickCount(ticks);
            tickInterval = window.setInterval(function () {
                tick(flasher);
            }, 1000);
            flasher.$element.hide().removeClass('hide').fadeIn('fast');
        } else {
            if(tickInterval) {
                window.clearInterval(tickInterval);
            }
            if(flasher.$element) {
                flasher.$element.addClass('hide');
            }
        }
    }
    function tick(flasher) {
        if(ticks <= 0) {
            ticks = 0;
            window.clearInterval(tickInterval);
            flasher.dismiss();
        } else {
            --ticks;
        }
        flasher.tickCount(ticks);
    }
    var FlasherViewModel = (function () {
        function FlasherViewModel() {
            var _this = this;
            this.text = ko.observable();
            this.tickCount = ko.observable(9);
            this.$element = undefined;
            ko.computed(function () {
                init(_this);
            });
        }
                    window.clearInterval(_this._tickInterval);
                }
                if(_this.element) {
                    _this.$element().addClass('hide');
        FlasherViewModel.prototype.flash = function (text) {
            this.text(undefined);
            if(text) {
                this.text(text);
            }
    };
    FlasherViewModel.prototype.dismiss = function () {
        var _this = this;
        this.$element().fadeOut('slow', function () {
            _this.text('');
            _this.$element().addClass('hide');
        });
    };
    return FlasherViewModel;
})();
app.flasher = new FlasherViewModel();
ko.applyBindings(app.flasher, $('.flasher')[0]);
            this.text(text);
        }
    };
    FlasherViewModel.prototype.tick = function () {
        if(this._ticks <= 0) {
            this._ticks = 0;
            window.clearInterval(this._tickInterval);
            this.dismiss();
        } else {
            --this._ticks;
        }
        this.tickCount(this._ticks);
        };
        FlasherViewModel.prototype.dismiss = function () {
            var _this = this;
            this.$element.fadeOut('slow', function () {
                _this.text('');
                _this.$element.addClass('hide');
            });
        };
        return FlasherViewModel;
    })();    
    App.flasher = new FlasherViewModel();
})(App || (App = {}));

