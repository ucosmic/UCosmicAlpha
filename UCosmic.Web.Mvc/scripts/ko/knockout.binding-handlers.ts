/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="knockout-2.2.d.ts" />

interface KnockoutBindingHandlers {
    element: KnockoutBindingHandler;
    jqElement: KnockoutBindingHandler;
    jqObservableElement: KnockoutBindingHandler;
    slideDownVisible: KnockoutBindingHandler;
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

ko.bindingHandlers.slideDownVisible = {
    update: function (element: Element, valueAccessor: () => any): void {
        var value: any = ko.utils.unwrapObservable(valueAccessor());
        if (value && !$(element).is(':visible')) {
            $(element).slideDown('fast');
        }
        else if (!value && $(element).is(':visible')) {
            $(element).slideUp('fast');
        }
    }
};