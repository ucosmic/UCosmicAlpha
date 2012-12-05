(function (window, $, undefined) {

    // ReSharper disable InconsistentNaming
    function FlasherViewModel() {
        // ReSharper restore InconsistentNaming
        var self = this;

        self.text = ko.observable();
        self.element = undefined;
        self.$element = function () {
            return $(self.element);
        };

        self.dismiss = function () {
            self.$element().fadeOut('slow', function () {
                self.text('');
                self.$element().addClass('hide');
            });
        };

        self.flash = function (text) {
            self.text(undefined);
            if (text) self.text(text);
        };

        self.ticks = 0;
        self.tickInterval = undefined;
        self.tickCount = ko.observable(10);

        self.tick = function () {
            if (self.ticks <= 0) {
                self.ticks = 0;
                self.tickCount(self.ticks);
                clearInterval(self.tickInterval);
                self.dismiss();
            }
            else {
                --self.ticks;
                self.tickCount(self.ticks);
            }
        };

        ko.computed(function () {
            if (self.text()) {
                clearInterval(self.tickInterval);
                self.ticks = 9;
                self.tickCount(self.ticks);
                self.tickInterval = setInterval(function () {
                    self.tick();
                }, 1000);
                self.$element().hide();
                self.$element().removeClass('hide');
                self.$element().fadeIn('fast');
            }
            else {
                if (self.tickInterval)
                    clearInterval(self.tickInterval);
                if (self.element)
                    self.$element().addClass('hide');
            }
        });
    }

    window.app.flasher = new FlasherViewModel();
    window.ko.applyBindings(app.flasher, $('.flasher')[0]);

}(window, jQuery));

