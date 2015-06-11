/// <reference path="../../typediff/mytypes.d.ts" />
Polymer('is-ddl', {
    isAjaxing: false,
    lastSearch: "",
    selectedid: 0,
    position: 1,
    backgroundcolor: "gray",
    highlightcolor: "yellow",
    isChrome: false,
    list: [],
    fadeOutBackground: function (element, duration, callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var animation = new Animation(element, [
            { backgroundColor: this.highlightcolor },
            { backgroundColor: "transparent" },
        ], { duration: duration, fill: 'forwards' });
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            element.style.backgroundColor = "transparent";
            var mythis = _this;
            if (callback) {
                callback();
            }
        });
    },
    fadeInBackground: function (element, duration, position, callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var animation = new Animation(element, [
            { backgroundColor: "transparent" },
            { backgroundColor: this.highlightcolor },
        ], { duration: duration, fill: 'forwards' });
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            if (position == _this.position) {
                element.style.backgroundColor = _this.highlightcolor;
                var mythis = _this;
                if (callback) {
                    callback(position);
                }
            }
            else {
                _this.fadeOutBackground(element, 0);
            }
        });
    },
    ready: function () {
    },
    domReady: function () {
        CoreStyle.list.DDL.first = this.backgroundcolor;
    },
    hoverChange: function (newValue, speed) {
        var _this = this;
        try {
            var x = 0, elements = this.$.itemsContainer.querySelector("#itemsInnerContainer").children;
            if (elements) {
                for (x; x < elements.length; x++) {
                    if (elements[x].style.backgroundColor == this.highlightcolor) {
                        this.fadeOutBackground(elements[x], 0);
                    }
                    ;
                }
                this.fadeInBackground(elements[this.position], speed, this.position);
            }
            else {
                setTimeout(function () {
                    if (_this.list && _this.list.length > 0) {
                        _this.hoverChange(newValue, speed);
                    }
                }, 20);
            }
        }
        catch (e) {
            setTimeout(function () {
                if (_this.list && _this.list.length > 0) {
                    _this.hoverChange(newValue, speed);
                }
            }, 20);
        }
    },
    selectHover: function (event, detail, sender) {
        this.position = event.target.templateInstance.model.itemI + 1;
        this.hoverChange(false, 100);
    },
    selectHoverLeave2: function (event, detail, sender) {
        var _this = this;
        var tg = (window.event) ? event.srcElement : event.target;
        if (tg.id != "itemsInnerContainer" && sender.id != "itemsInnerContainer") {
            return;
        }
        else {
            setTimeout(function () {
                if (_this.position == 11) {
                    _this.position = 1;
                    _this.hoverChange(false, 200);
                }
            }, 100);
            this.position = 11;
        }
    },
    select: function (event, detail, sender) {
        this.selected = sender.dataset.id;
        this.fire('selected_updated');
    },
});
