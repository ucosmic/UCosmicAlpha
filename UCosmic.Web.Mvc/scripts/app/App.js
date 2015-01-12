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
    var Failures;
    (function (Failures) {
        function message(xhr, reason, autoAlert) {
            if (reason === void 0) { reason = ''; }
            if (autoAlert === void 0) { autoAlert = false; }
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
    })(Failures = App.Failures || (App.Failures = {}));
    var Constants;
    (function (Constants) {
        Constants.int32Max = 2147483647;
    })(Constants = App.Constants || (App.Constants = {}));
    var WindowScroller = (function () {
        function WindowScroller() {
        }
        WindowScroller.init = function () {
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
    var SidebarFixedScroller = (function () {
        function SidebarFixedScroller() {
        }
        SidebarFixedScroller.init = function () {
            $('[data-fixed-scroll=root]').each(function () {
                var $window = $(window), $root = $(this), $content = $root.find('[data-fixed-scroll=content]'), $anchor = $root.find('[data-fixed-scroll=anchor]'), contentWidth = $content.width(), update = function () {
                    var windowScrollTop = $window.scrollTop(), anchorOffsetTop = $anchor.offset().top;
                    contentWidth = contentWidth == 0 ? $content.width() : contentWidth;
                    if (windowScrollTop > anchorOffsetTop) {
                        $content.css({
                            position: 'fixed',
                            width: contentWidth,
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
                    }
                    else if (windowScrollTop <= anchorOffsetTop) {
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
    var Obtruders;
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
    })(Obtruders = App.Obtruders || (App.Obtruders = {}));
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
    function deparam(params, coerce) {
        if (coerce === void 0) { coerce = false; }
        var obj = {}, coerce_types = { 'true': !0, 'false': !1, 'null': null };
        var decode = decodeURIComponent;
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='), key = decode(param[0]), val, cur = obj, i = 0, keys = key.split(']['), keys_last = keys.length - 1;
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');
                keys = keys.shift().split('[').concat(keys);
                keys_last = keys.length - 1;
            }
            else {
                keys_last = 0;
            }
            if (param.length === 2) {
                val = decode(param[1]);
                if (coerce) {
                    val = val && !isNaN(val) ? +val : val === 'undefined' ? undefined : coerce_types[val] !== undefined ? coerce_types[val] : val;
                }
                if (keys_last) {
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(Number(keys[i + 1])) ? {} : []) : val;
                    }
                }
                else {
                    if ($.isArray(obj[key])) {
                        obj[key].push(val);
                    }
                    else if (obj[key] !== undefined) {
                        obj[key] = [obj[key], val];
                    }
                    else {
                        obj[key] = val;
                    }
                }
            }
            else if (key) {
                obj[key] = coerce ? undefined : '';
            }
        });
        return obj;
    }
    App.deparam = deparam;
})(App || (App = {}));
