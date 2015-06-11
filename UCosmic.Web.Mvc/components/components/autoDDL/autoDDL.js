/// <reference path="../../typediff/mytypes.d.ts" />
Polymer('is-auto-ddl', {
    isAjaxing: false,
    selected: "",
    lastSearch: "",
    selectedid: 0,
    position: 1,
    backgroundcolor: "gray",
    highlightcolor: "yellow",
    isChrome: false,
    is_scrolling: false,
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
        var isChromium = window.chrome, vendorName = window.navigator.vendor;
        if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
            this.isChrome = true;
        }
    },
    domReady: function () {
        this.listChangeObserver();
        CoreStyle.list.autoDDL.first = this.backgroundcolor;
    },
    leaveSearch: function (event, detail, sender) {
        var _this = this;
        if (!this.is_scrolling) {
            setTimeout(function () {
                _this.list = [];
            }, 200);
        }
    },
    listChanged: function (oldV, newV) {
        if (newV.length == 1) {
            if (this.selected == newV[0].text) {
                this.list = [];
            }
        }
    },
    selectedKeyPress: function (event, detail, sender) {
        event = event || window.event;
        var charCode = event.keyCode || event.which;
        console.log(charCode);
        var limit = this.list.length;
        if (charCode == 13 || charCode == 9) {
            if (!this.list || this.list.length > 0) {
                var position = this.position - 1;
                this.selected = this.list[position].text;
                this.selectedid = this.list[position]._id;
                this.fire('selected-updated');
                this.fire('search-updated');
                this.position = 1;
                this.list = [];
            }
        }
        else if (charCode == 38) {
            if (this.position == 1) {
                this.position = limit;
            }
            else {
                this.position -= 1;
            }
            this.hoverChange(false, 100);
        }
        else if (charCode == 40) {
            if (this.position == limit) {
                this.position = 1;
            }
            else {
                this.position += 1;
            }
            this.hoverChange(false, 100);
        }
        var x = this.$.itemsContainer.children[1];
        if (x) {
            var a = x.children[this.position];
            this.is_scrolling = true;
            a.focus();
            sender.focus();
        }
    },
    selectedChanged: function (oldV, newV) {
        if (newV == "" && oldV && oldV.length > 0) {
            this.fire('selected-updated');
            this.selected = "";
            this.selectedid = 0;
            this.fire('search-updated');
            this.position = 1;
        }
    },
    select: function (event, detail, sender) {
        this.selectedid = event.target.templateInstance.model.item._id;
        this.selected = event.target.templateInstance.model.item.text;
        this.fire('selected-updated');
        this.list = [];
    },
    fire_search: function () {
        this.is_scrolling = false;
        this.fire('search-updated');
    },
    listSearch: function (event, detail, sender) {
        if (this.selected == "") {
            this.fire('selected-updated');
        }
        else {
            this.fire('search-updated');
        }
    },
    listChangeObserverInner: function () {
        var _this = this;
        var container2 = this.$.itemsContainer.querySelector("#itemsInnerContainer");
        if (container2 != null && this.list.length > 0) {
            var observer2 = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    _this.hoverChange(false, 200);
                });
            });
            observer2.observe(container2, {
                childList: true,
            });
        }
    },
    listChangeObserver: function () {
        var _this = this;
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                _this.hoverChange(false, 200);
                _this.listChangeObserverInner();
            });
        });
        var container = this.$.itemsContainer;
        observer.observe(container, {
            childList: true,
        });
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
});
