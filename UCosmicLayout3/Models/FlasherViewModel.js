(function (window, $, undefined) {
    
    function FlasherViewModel() {
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

        ko.computed(function () {
            if (self.text()) {
                self.$element().hide();
                self.$element().removeClass('hide');
                self.$element().fadeIn('fast');
                setTimeout(function () {
                    self.dismiss();
                }, 10000);
            }
        });
    }

    ko.bindingHandlers.element = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var name = ko.utils.unwrapObservable(valueAccessor());
            viewModel[name] = element;
        }
    };

    window.app.flasher = new FlasherViewModel();
    window.ko.applyBindings(app.flasher, $('.flasher')[0]);
    
}(window, jQuery));

