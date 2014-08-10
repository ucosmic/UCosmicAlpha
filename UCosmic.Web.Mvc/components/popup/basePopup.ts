/// <reference path="../typediff/mytypes.d.ts" />

Polymer('polymer-basePopup', {

    closeIt: false,
    closeItChanged: function (oldValue, newValue) {
        if (newValue == true) {
            var that = this;
            this.showHide = "hide";
            setTimeout(function () { that.hide = true; }, 500);
        } else {
            this.hide = false;
            this.showHide = "show";
        }
    },
    initialize: function (element, height) {
        var onWindowResized = () => {
            var contentHeight = $("window").height();
            if (contentHeight < height) {
                element.style.height = (contentHeight - 5) + "px";
            }
            else {
                element.style.height = '';
            }
        };
        //window.onresize = onWindowResized.bind(this);
        onWindowResized();


        $(window).on("resize", (e) => {
            onWindowResized();
            return true;
        })
    },
});