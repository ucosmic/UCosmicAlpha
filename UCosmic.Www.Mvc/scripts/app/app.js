(function (window, $) {
    window.app = window.app || {
        obtruders: {},
        obtrude: function (selector, obtruders) {
            var obtruder;
            obtruders = obtruders || window.app.obtruders;
            for (obtruder in obtruders) { // execute every registered obtruder
                if (obtruders.hasOwnProperty(obtruder)) { // skip any inherited members

                    // apply an unobtrusive behavior
                    if (typeof obtruders[obtruder] === 'function') {
                        obtruders[obtruder].apply(this,
                            Array.prototype.slice.call(arguments, 0, 1) || document);
                    }

                    // apply all unobtrusive behaviors in set
                    if (typeof obtruders[obtruder] === 'object') {
                        window.app.obtrude(selector, obtruders[obtruder]);
                    }
                }
            }
        }
    };

    $.extend(window.app.obtruders, {
        autosize: function (selector) {
            if ($.fn.autosize)
                $(selector).find('textarea[data-autosize]').autosize();
        },
        placeholder: function (selector) {
            if ($.fn.placeholder)
                $(selector).find('input[placeholder], textarea[placeholder]').placeholder();
        }
    });

    $(window).on('scroll', function () {
        $('#scroll_top_tracker').val($(window).scrollTop());
    });

    window.app.windowScrollTop = function (val) {
        if (val === undefined)
            return $(window).scrollTop();
        else if (val && typeof val === 'string' && val.toLowerCase() === 'restore')
            $(window).scrollTop($('#scroll_top_tracker').val());
        else if (typeof val === 'number')
            $(window).scrollTop(val);
        return true;
    };

    $(function () {
        window.app.obtrude(document);
    });

}(window, jQuery, undefined));