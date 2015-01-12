Polymer('polymer-basePopup', {
    closeIt: false,
    closeItChanged: function (oldValue, newValue) {
        if (newValue == true) {
            var that = this;
            this.showHide = "hide";
            setTimeout(function () {
                that.hide = true;
            }, 500);
        }
        else {
            this.hide = false;
            this.showHide = "show";
        }
    },
    initialize: function (element, height) {
        var onWindowResized = function () {
            var contentHeight = $("window").height();
            if (contentHeight < height) {
                element.style.height = (contentHeight - 5) + "px";
            }
            else {
                element.style.height = '';
            }
        };
        onWindowResized();
        $(window).on("resize", function (e) {
            onWindowResized();
            return true;
        });
    },
});
