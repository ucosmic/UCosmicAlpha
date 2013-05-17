define(["require", "exports"], function(require, exports) {
    var WindowScroller = (function () {
        function WindowScroller() { }
        WindowScroller.scrollTopTrackerId = '#scroll_top_tracker';
        WindowScroller.init = function init() {
            var trackTop = function () {
                var windowScrollTop = $(window).scrollTop();
                $(WindowScroller.scrollTopTrackerId).val(windowScrollTop);
            };
            $(window).off('scroll', trackTop);
            $(window).on('scroll', trackTop);
        };
        WindowScroller.getTop = function getTop() {
            return $(window).scrollTop();
        };
        WindowScroller.setTop = function setTop(value) {
            $(window).scrollTop(value);
        };
        WindowScroller.restoreTop = function restoreTop() {
            $(window).scrollTop($(WindowScroller.scrollTopTrackerId).val());
        };
        return WindowScroller;
    })();
    exports.WindowScroller = WindowScroller;    
    $(function () {
        WindowScroller.init();
    });
    var SidebarFixedScroller = (function () {
        function SidebarFixedScroller() { }
        SidebarFixedScroller.init = function init() {
            $('[data-fixed-scroll=root]').each(function () {
                var $window = $(window), $root = $(this), $content = $root.find('[data-fixed-scroll=content]'), $anchor = $root.find('[data-fixed-scroll=anchor]'), contentWidth = $content.width(), update = function () {
                    var windowScrollTop = $window.scrollTop(), anchorOffsetTop = $anchor.offset().top;
                    if(windowScrollTop > anchorOffsetTop) {
                        $content.css({
                            position: 'fixed',
                            width: contentWidth
                        });
                        if($content.height() > $window.height()) {
                            $content.css({
                                top: '',
                                bottom: '0px'
                            });
                        } else {
                            $content.css({
                                top: '0px',
                                bottom: ''
                            });
                        }
                    } else if(windowScrollTop <= anchorOffsetTop) {
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
    (function (Obtruders) {
        function autosize(selector) {
            if($.fn.autosize) {
                $(selector).find('textarea[data-autosize]').autosize();
            }
        }
        Obtruders.autosize = autosize;
        function placeholder(selector) {
            if($.fn.placeholder) {
                $(selector).find('input[placeholder], textarea[placeholder]').placeholder();
            }
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
    })(exports.Obtruders || (exports.Obtruders = {}));
    var Obtruders = exports.Obtruders;
    var Obtruder = (function () {
        function Obtruder() { }
        Obtruder.obtrude = function obtrude(selector, obtruders) {
            var obtruder;
            obtruders = obtruders || Obtruders;
            for(obtruder in obtruders) {
                if(obtruders.hasOwnProperty(obtruder)) {
                    if(typeof obtruders[obtruder] === 'function') {
                        obtruders[obtruder].apply(this, Array.prototype.slice.call(arguments, 0, 1) || document);
                    }
                    if(typeof obtruders[obtruder] === 'object') {
                        Obtruder.obtrude(selector, obtruders[obtruder]);
                    }
                }
            }
        };
        return Obtruder;
    })();
    exports.Obtruder = Obtruder;    
    $(function () {
        Obtruder.obtrude(document);
    });
})
