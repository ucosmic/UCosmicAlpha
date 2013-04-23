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
ko.bindingHandlers.multilineText = {
    init: function () {
        return {
            'controlsDescendantBindings': true
        };
    },
    update: function (element, valueAccessor) {
        var text = ko.utils.unwrapObservable(valueAccessor());
        if(text) {
            text = text.replace('\r\n', '<br />').replace('\n\r', '<br />').replace('\n', '<br />').replace('\r', '<br />');
            ko.utils.setHtml(element, text);
        } else {
            ko.utils.setHtml(element, '');
        }
    }
};
ko.bindingHandlers.slideDownVisible = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if(value && !$(element).is(':visible')) {
            $(element).slideDown('fast');
        } else if(!value) {
            if($(element).is(':animated')) {
                $(element).hide();
            } else {
                $(element).slideUp('fast');
            }
        }
    }
};
ko.bindingHandlers.fadeVisible = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if(value && !isCurrentlyVisible) {
            $(element).fadeIn();
        } else if((!value) && isCurrentlyVisible) {
            $(element).fadeOut();
        }
    }
};
