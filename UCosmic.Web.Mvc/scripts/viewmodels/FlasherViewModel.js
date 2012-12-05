var FlasherViewModel = (function () {
    function FlasherViewModel() {
        var _this = this;
        this.text = ko.observable();
        this.element = undefined;
        this.tickCount = ko.observable(9);
        this._ticks = 0;
        this._tickInterval = undefined;
        ko.computed(function () {
            if(_this.text()) {
                window.clearInterval(_this._tickInterval);
                _this._ticks = 9;
                _this.tickCount(_this._ticks);
                _this._tickInterval = window.setInterval(function () {
                    _this.tick();
                }, 1000);
                _this.$element().hide().removeClass('hide').fadeIn('fast');
            } else {
                if(_this._tickInterval) {
                    window.clearInterval(_this._tickInterval);
                }
                if(_this.element) {
                    _this.$element().addClass('hide');
                }
            }
        });
    }
    FlasherViewModel.prototype.$element = function () {
        return $(this.element);
    };
    FlasherViewModel.prototype.flash = function (text) {
        this.text(undefined);
        if(text) {
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
app.flasher = new FlasherViewModel();
ko.applyBindings(app.flasher, $('.flasher')[0]);
