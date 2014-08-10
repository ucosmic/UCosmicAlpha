/// <reference path="../../../../typediff/mytypes.d.ts" />
Polymer('polymer-closable', {
    closeIt: false,
    closeItChanged: function (oldValue, newValue) {
        if (newValue == true) {
            var that = this;
            this.showHide = "hide";
            setTimeout(function () {
                that.hide = true;
            }, 500);
        } else {
            this.hide = false;
            this.showHide = "show";
        }
    },
    initialize: function (element, height) {
        var onWindowResized = function () {
            var contentHeight = DOM.window.height();
            if (contentHeight < height) {
                element.style.height = (contentHeight - 5) + "px";
            } else {
                element.style.height = '';
            }
        };
        window.onresize = onWindowResized.bind(this);
        onWindowResized();

        $(window).on("resize", function (e) {
            onWindowResized();
            return true;
        });
    }
});
