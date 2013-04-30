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

(function($) {
    var instances_by_id = {} // needed for referencing instances during updates.
      , init_queue = $.Deferred() // jQuery deferred object used for creating TinyMCE instances synchronously
      , init_queue_next = init_queue;
    init_queue.resolve();
    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var init_arguments = arguments;
            var options = allBindingsAccessor().tinymceOptions || {};
            var modelValue = valueAccessor();
            var value = ko.utils.unwrapObservable(valueAccessor());
            var el = $(element)

            options.setup = function (ed) {
                //handle edits made in the editor. Updates after an undo point is reached.
                ed.onChange.add(function (ed, l) {
                    if (ko.isWriteableObservable(modelValue)) {
                        modelValue(l.content);
                    }
                });

                //This is required if you want the HTML Edit Source button to work correctly
                ed.onBeforeSetContent.add(function (editor, l) {
                    if (ko.isWriteableObservable(modelValue)) {
                        modelValue(l.content);
                    }
                });

                // The paste event for the mouse paste fix.
                ed.onPaste.add(function (ed, evt) {
                    var doc = ed.getDoc();

                    if (ko.isWriteableObservable(modelValue)) {
                        setTimeout(function () { modelValue(ed.getContent({ format: 'raw' })); }, 10);
                    }

                });

                // Make sure observable is updated when leaving editor.
                ed.onInit.add(function (ed, evt) {
                    var doc = ed.getDoc();
                    tinymce.dom.Event.add(doc, 'blur', function (e) {
                        if (ko.isWriteableObservable(modelValue)) {
                            modelValue(ed.getContent({ format: 'raw' }));
                        }
                    });
                });
            };

            //handle destroying an editor
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).parent().find("span.mceEditor,div.mceEditor").each(function (i, node) {
                    var tid = node.id.replace(/_parent$/, '');
                    var ed = tinyMCE.get(tid);
                    if (ed) {
                        ed.remove();
                        // remove referenced instance if possible.
                        if (instances_by_id[tid]) {
                            delete instances_by_id[tid];
                        }
                    }
                });
            });

            // TinyMCE attaches to the element by DOM id, so we need to make one for the element if it doesn't have one already.
            if (!element.id) {
                element.id = tinyMCE.DOM.uniqueId();
            }

            // create each tinyMCE instance synchronously. This addresses an issue when working with foreach bindings
            init_queue_next = init_queue_next.pipe(function () {
                var defer = $.Deferred();
                var init_options = $.extend({}, options, {
                    mode: 'none',
                    init_instance_callback: function (instance) {
                        instances_by_id[element.id] = instance;
                        ko.bindingHandlers.tinymce.update.apply(undefined, init_arguments);
                        defer.resolve(element.id);
                        if (options.hasOwnProperty("init_instance_callback")) {
                            options.init_instance_callback(instance);
                        }
                    }
                });
                setTimeout(function () {
                    tinyMCE.init(init_options);
                    setTimeout(function () {
                        tinyMCE.execCommand("mceAddControl", true, element.id);
                    }, 10);
                }, 10);
                return defer.promise();
            });
            el.val(value);

            //$(element).tinymce(options);
            //setTimeout(function () { $(element).tinymce(options); }, 0);
            //el.html(value);

        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {
            var el = $(element)
            var value = ko.utils.unwrapObservable(valueAccessor());
            var id = el.attr('id')

            //handle programmatic updates to the observable
            // also makes sure it doesn't update it if it's the same. 
            // otherwise, it will reload the instance, causing the cursor to jump.
            //if (id !== undefined) {
            //    var content = tinyMCE.getInstanceById(id).getContent({ format: 'raw' })
            //    if (content !== value) {
            //        el.html(value);
            //    }
            //}
            if (id !== undefined && id !== '' && instances_by_id.hasOwnProperty(id)) {
                var content = instances_by_id[id].getContent({ format: 'raw' });
                if (content !== value || content !== el.val()) {
                    el.val(value);
                }
            }
        }
    };
} (jQuery));