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
        placeholder: function (selector) {
            if ($.fn.placeholder)
                $(selector).find('input[placeholder], textarea[placeholder]').placeholder();
        }
    });

    $(function () {
        window.app.obtrude(document);
    });

}(window, jQuery, undefined));