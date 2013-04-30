/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="knockout-2.2.d.ts" />
/// <reference path="../tinymce/tinymce.d.ts" />
/// <reference path="../oss/jquery.tinymce.d.ts" />

interface KnockoutBindingHandlers {
    element: KnockoutBindingHandler;
    jqElement: KnockoutBindingHandler;
    jqObservableElement: KnockoutBindingHandler;
    multilineText: KnockoutBindingHandler;
    slideDownVisible: KnockoutBindingHandler;
    fadeVisible: KnockoutBindingHandler;
    tinymce: KnockoutBindingHandler;
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

ko.bindingHandlers.tinymce = {
    init: function (element, valueAccessor, allBindingsAccessor, context) {
        var options = allBindingsAccessor().tinymceOptions || {};
        var modelValue = valueAccessor();
        var value = ko.utils.unwrapObservable(valueAccessor());
        var el = $(element)

        //handle edits made in the editor. Updates after an undo point is reached.
        options.setup = function (ed) {
            ed.onChange.add(function (ed, l) {
                if (ko.isWriteableObservable(modelValue)) {
                    modelValue(l.content);
                }
            });
        };

        //handle destroying an editor
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            setTimeout(function () { $(element).tinymce().remove() }, 0)
        });

        //$(element).tinymce(options);
        setTimeout(function () { $(element).tinymce(options); }, 0);
        el.html(value);

    },
    update: function (element, valueAccessor, allBindingsAccessor, context) {
        var el = $(element)
        var value = ko.utils.unwrapObservable(valueAccessor());
        var id = el.attr('id')

        //handle programmatic updates to the observable
        // also makes sure it doesn't update it if it's the same. 
        // otherwise, it will reload the instance, causing the cursor to jump.
        if (id !== undefined) {
            var content = tinyMCE.getInstanceById(id).getContent({ format: 'raw' })
            if (content !== value) {
                el.html(value);
            }
        }
    }
};