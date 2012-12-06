var App;
(function (App) {
    var WindowScroller = (function () {
        function WindowScroller() { }
        WindowScroller.scrollTopTrackerId = '#scroll_top_tracker';
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
    $(window).on('scroll', function () {
        var windowScrollTop = $(window).scrollTop();
        $(WindowScroller.scrollTopTrackerId).val(windowScrollTop);
    });
})(App || (App = {}));

