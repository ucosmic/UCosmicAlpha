var App;
(function (App) {
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
        }
        Object.defineProperty(WindowScroller, "top", {
            get: function () {
                return $(window).scrollTop();
            },
            set: function (value) {
                $(window).scrollTop(value);
            },
            enumerable: true,
            configurable: true
        });
        WindowScroller.restoreTop = function restoreTop() {
            $(window).scrollTop($(WindowScroller.scrollTopTrackerId).val());
        }
        return WindowScroller;
    })();
    App.WindowScroller = WindowScroller;    
    App.WindowScroller.init();
    var SidebarFixedScroller = (function () {
        function SidebarFixedScroller() { }
        SidebarFixedScroller.init = function init() {
            $('[data-fixed-scroll=root]').each(function () {
                var $window = $(window);
                var $root = $(this);
                var $content = $root.find('[data-fixed-scroll=content]');
                var $anchor = $root.find('[data-fixed-scroll=anchor]');
                var contentWidth = $content.width();
                var update = function () {
                    var windowScrollTop = $window.scrollTop();
                    var anchorOffsetTop = $anchor.offset().top;

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
                    } else {
                        if(windowScrollTop <= anchorOffsetTop) {
                            $content.css({
                                position: 'relative',
                                top: '',
                                bottom: ''
                            });
                        }
                    }
                };

                $window.scroll(update).resize(update);
                update();
            });
        }
        return SidebarFixedScroller;
    })();    
    SidebarFixedScroller.init();
})(App || (App = {}));

