var App;
(function (App) {
    var FlasherViewModel = (function () {
        function FlasherViewModel() {
            var _this = this;
            this.text = ko.observable();
            this.tickCount = ko.observable(9);
            this._ticks = 0;
            this._tickInterval = undefined;
            this.element = undefined;
            ko.computed(function () {
                _this.init();
            });
        }
        FlasherViewModel.prototype.init = function () {
            var _this = this;
            if(this.text()) {
                window.clearInterval(this._tickInterval);
                this._ticks = 9;
                this.tickCount(this._ticks);
                this._tickInterval = window.setInterval(function () {
                    _this.tick();
                }, 1000);
                this.$element().hide().removeClass('hide').fadeIn('fast');
            } else {
                if(this._tickInterval) {
                    window.clearInterval(this._tickInterval);
                }
                if(this.element) {
                    this.$element().addClass('hide');
                }
            }
        };
        FlasherViewModel.prototype.tick = function () {
            if(this._ticks <= 0) {
                this._ticks = 0;
                window.clearInterval(this._tickInterval);
                this.dismiss();
            } else {
                --this._ticks;
                    window.clearInterval(_this._tickInterval);
                }
                if(_this.element) {
                    _this.$element().addClass('hide');
            }
            this.tickCount(this._ticks);
        };
        FlasherViewModel.prototype.$element = function () {
            return $(this.element);
        };
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
            this.$element().fadeOut('slow', function () {
                _this.text('');
                _this.$element().addClass('hide');
            });
        };
        return FlasherViewModel;
    })();
    App.FlasherViewModel = FlasherViewModel;    
    App.flasher = new FlasherViewModel();
})(App || (App = {}));

ko.applyBindings(App.flasher, $('.flasher')[0]);
