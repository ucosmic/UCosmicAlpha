ko.bindingHandlers.element = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name] = element;
    }
};
ko.bindingHandlers.jqElement = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name] = $(element);
    }
};
ko.bindingHandlers.jqObservableElement = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name]($(element));
    }
};
ko.bindingHandlers.slideDownVisible = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if(value && !$(element).is(':visible')) {
            $(element).slideDown('fast');
        } else {
            if(!value && $(element).is(':visible')) {
                $(element).slideUp('fast');
            }
        }
    }
};
//@ sourceMappingURL=knockout.binding-handlers.js.map
