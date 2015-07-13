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
ko.bindingHandlers.jQuery = {
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
ko.bindingHandlers.jQueryObservable = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var name = ko.utils.unwrapObservable(valueAccessor());
        viewModel[name]($(element));
    }
};
ko.bindingHandlers.multilineText = {
    init: function () {
        return { 'controlsDescendantBindings': true };
    },
    update: function (element, valueAccessor) {
        var text = ko.utils.unwrapObservable(valueAccessor());
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
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && !$(element).is(':visible')) {
            $(element).slideDown('fast');
        }
        else if (!value) {
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
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            $(element).fadeIn();
        else if ((!value) && isCurrentlyVisible)
            $(element).fadeOut();
    }
};
(function ($) {
    var instances_by_id = {}, init_queue = $.Deferred(), init_queue_next = init_queue;
    init_queue.resolve();
    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var init_arguments = arguments;
            var options = allBindingsAccessor().tinymceOptions || {};
            var modelValue = valueAccessor();
            var value = ko.utils.unwrapObservable(valueAccessor());
            var el = $(element);
            var eventsToCatch = ["change"];
            var requestedEventsToCatch = allBindingsAccessor()["valueUpdate"];
            if (requestedEventsToCatch) {
                if (typeof requestedEventsToCatch == "string")
                    requestedEventsToCatch = [requestedEventsToCatch];
                ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
                eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
            }
            options.setup = function (ed) {
                ed.onChange.add(function (ed, l) {
                    if (ko.isWriteableObservable(modelValue)) {
                        modelValue(l.content);
                    }
                });
                var valueUpdateHandler = function (eventName) {
                    if (ko.isWriteableObservable(modelValue)) {
                        if (eventName.indexOf('after') == 0)
                            setTimeout(function () {
                                modelValue(ed.getContent({ format: 'raw' }));
                            }, 10);
                        else
                            modelValue(ed.getContent({ format: 'raw' }));
                    }
                };
                $.each(eventsToCatch, function (index) {
                    var eventName = eventsToCatch[index];
                    if (eventName.indexOf('keydown') >= 0) {
                        ed.onKeyDown.add(function (ed, e) {
                            valueUpdateHandler(eventName);
                        });
                    }
                    if (eventName.indexOf('keypress') >= 0) {
                        ed.onKeyPress.add(function (ed, e) {
                            valueUpdateHandler(eventName);
                        });
                    }
                    if (eventName.indexOf('keyup') >= 0) {
                        ed.onKeyUp.add(function (ed, e) {
                            valueUpdateHandler(eventName);
                        });
                    }
                });
                ed.onBeforeSetContent.add(function (editor, l) {
                    if (ko.isWriteableObservable(modelValue)) {
                        modelValue(l.content);
                    }
                });
                ed.onPaste.add(function (ed, evt) {
                    var doc = ed.getDoc();
                    if (ko.isWriteableObservable(modelValue)) {
                        setTimeout(function () { modelValue(ed.getContent({ format: 'raw' })); }, 10);
                    }
                });
                ed.onInit.add(function (ed, evt) {
                    var doc = ed.getDoc();
                    tinymce.dom.Event.add(doc, 'blur', function (e) {
                        if (ko.isWriteableObservable(modelValue)) {
                            modelValue(ed.getContent({ format: 'raw' }));
                        }
                    });
                });
            };
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).parent().find("span.mceEditor,div.mceEditor").each(function (i, node) {
                    var tid = node.id.replace(/_parent$/, '');
                    var ed = tinyMCE.get(tid);
                    if (ed) {
                        ed.remove();
                        if (instances_by_id[tid]) {
                            delete instances_by_id[tid];
                        }
                    }
                });
            });
            if (!element.id) {
                element.id = tinyMCE.DOM.uniqueId();
            }
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
        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {
            var el = $(element);
            var value = ko.utils.unwrapObservable(valueAccessor());
            var id = el.attr('id');
            if (id !== undefined && id !== '' && instances_by_id.hasOwnProperty(id)) {
                var content = instances_by_id[id].getContent({ format: 'raw' });
                if (content !== value || content !== el.val()) {
                    el.val(value);
                }
            }
        }
    };
}(jQuery));
