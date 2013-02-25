/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="knockout-2.2.d.ts" />

interface KnockoutBindingHandlers {
    element: KnockoutBindingHandler;
    jqElement: KnockoutBindingHandler;
    jqObservableElement: KnockoutBindingHandler;
    multilineText: KnockoutBindingHandler;
    slideDownVisible: KnockoutBindingHandler;
    fadeVisible: KnockoutBindingHandler;
}

ko.bindingHandlers.element = {
    update: function (element: Element, valueAccessor: () => any,
        allBindingsAccessor: () => any, viewModel: any): void {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name] = element;
    }
};

ko.bindingHandlers.jqElement = {
    update: function (element: Element, valueAccessor: () => any,
        allBindingsAccessor: () => any, viewModel: any): void {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name] = $(element);
    }
};

ko.bindingHandlers.jqObservableElement = {
    update: function (element: Element, valueAccessor: () => any,
        allBindingsAccessor: () => any, viewModel: any): void {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name]($(element));
    }
};

ko.bindingHandlers.multilineText = {
    init: function () {
        return { 'controlsDescendantBindings': true };
    },
    update: function (element: Element, valueAccessor: () => any): void {
        var text: string = ko.utils.unwrapObservable(valueAccessor());
        if (text) {
            text = text.replace('\r\n', '<br />').replace('\n\r', '<br />')
                .replace('\n', '<br />').replace('\r', '<br />');
            ko.utils.setHtml(element, text);
        }
        else {
            ko.utils.setHtml(element, '');
        }
    }
};

ko.bindingHandlers.slideDownVisible = {
    update: function (element: Element, valueAccessor: () => any): void {
        var value: any = ko.utils.unwrapObservable(valueAccessor());
        if (value && !$(element).is(':visible')) {
            $(element).slideDown('fast');
        }
        else if (!value) {
            // element may still be animating
            if ($(element).is(':animated')) {
                $(element).hide();
            }
            else {
                $(element).slideUp('fast');
            }
        }
    }
};

ko.bindingHandlers.fadeVisible = {
    update: function (element: HTMLElement, valueAccessor: () => any): void {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            $(element).fadeIn();
        else if ((!value) && isCurrentlyVisible)
            $(element).fadeOut();
    }
};
