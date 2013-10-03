/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jquery.plugins/jquery.autosize.d.ts" />
/// <reference path="../typings/jquery.plugins/jquery.placeholder.d.ts" />
if (!String.prototype.format) {
    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
}

var App;
(function (App) {
    // react to unexpected situations
    (function (Failures) {
        function message(xhr, reason, autoAlert) {
            if (typeof reason === "undefined") { reason = ''; }
            if (typeof autoAlert === "undefined") { autoAlert = false; }
            if (xhr)
                if (xhr.readyState === 0 || xhr.status === 0)
                    return null;

            if (reason !== '')
                reason = ' ' + reason;
            var format = 'UCosmic experienced an unexpected error{0}. If this continues to happen, ' + 'please use the Feedback & Support link on this page to report it.';
            var message = format.format(reason);
            if (autoAlert)
                alert(message);
            return message;
        }
        Failures.message = message;
    })(App.Failures || (App.Failures = {}));
    var Failures = App.Failures;

    (function (Constants) {
        Constants.int32Max = 2147483647;
    })(App.Constants || (App.Constants = {}));
    var Constants = App.Constants;

    // track & get/set window scroll position
    var WindowScroller = (function () {
        function WindowScroller() {
        }
        WindowScroller.init = function () {
            // track the scroll top in a hidden field
            var trackTop = function () {
                var windowScrollTop = $(window).scrollTop();
                $(WindowScroller.scrollTopTrackerId).val(windowScrollTop);
            };
            $(window).off('scroll', trackTop);
            $(window).on('scroll', trackTop);
        };

        WindowScroller.getTop = function () {
            return $(window).scrollTop();
        };

        WindowScroller.setTop = function (value) {
            $(window).scrollTop(value);
        };

        WindowScroller.restoreTop = function () {
            $(window).scrollTop($(WindowScroller.scrollTopTrackerId).val());
        };
        WindowScroller.scrollTopTrackerId = '#scroll_top_tracker';
        return WindowScroller;
    })();
    App.WindowScroller = WindowScroller;
    $(function () {
        App.WindowScroller.init();
    });

    // fix sidebar elements when scrolling vertically
    var SidebarFixedScroller = (function () {
        function SidebarFixedScroller() {
        }
        SidebarFixedScroller.init = function () {
            $('[data-fixed-scroll=root]').each(function () {
                var $window = $(window), $root = $(this), $content = $root.find('[data-fixed-scroll=content]'), $anchor = $root.find('[data-fixed-scroll=anchor]'), contentWidth = $content.width(), update = function () {
                    var windowScrollTop = $window.scrollTop(), anchorOffsetTop = $anchor.offset().top;
                    if (windowScrollTop > anchorOffsetTop) {
                        $content.css({
                            position: 'fixed'
                        });
                        if ($content.height() > $window.height())
                            $content.css({
                                top: '',
                                bottom: '0px'
                            });
else
                            $content.css({
                                top: '0px',
                                bottom: ''
                            });
                    } else if (windowScrollTop <= anchorOffsetTop) {
                        $content.css({
                            position: 'relative',
                            top: '',
                            bottom: ''
                        });
                    }
                };
                $window.scroll(update).resize(update);
                update();
            });
        };
        return SidebarFixedScroller;
    })();
    $(function () {
        SidebarFixedScroller.init();
    });

    // unobtrusive behaviors
    (function (Obtruders) {
        function autosize(selector) {
            if ($.fn.autosize)
                $(selector).find('textarea[data-autosize]').autosize();
        }
        Obtruders.autosize = autosize;
        function placeholder(selector) {
            if ($.fn.placeholder)
                $(selector).find('input[placeholder], textarea[placeholder]').placeholder();
        }
        Obtruders.placeholder = placeholder;
        function moduleNav(selector) {
            $(selector).find('[data-current-module]').each(function () {
                var current = $(this).data('current-module');
                $('nav.modules li.' + current).addClass('current');
            });
            $('nav.modules').removeClass('hide');
        }
        Obtruders.moduleNav = moduleNav;
        function bibNav(selector) {
            $(selector).find('[data-current-bib]').each(function () {
                var current = $(this).data('current-bib');
                $('nav.bib li.' + current).addClass('current');
            });
            $('nav.bib').removeClass('hide');
        }
        Obtruders.bibNav = bibNav;
    })(App.Obtruders || (App.Obtruders = {}));
    var Obtruders = App.Obtruders;

    // unobtrusive behavior applicator
    var Obtruder = (function () {
        function Obtruder() {
        }
        Obtruder.obtrude = function (selector, obtruders) {
            var obtruder;
            obtruders = obtruders || App.Obtruders;
            for (obtruder in obtruders) {
                if (obtruders.hasOwnProperty(obtruder)) {
                    if (typeof obtruders[obtruder] === 'function') {
                        obtruders[obtruder].apply(this, Array.prototype.slice.call(arguments, 0, 1) || document);
                    }

                    if (typeof obtruders[obtruder] === 'object') {
                        App.Obtruder.obtrude(selector, obtruders[obtruder]);
                    }
                }
            }
        };
        return Obtruder;
    })();
    App.Obtruder = Obtruder;
    $(function () {
        App.Obtruder.obtrude(document);
    });
})(App || (App = {}));
