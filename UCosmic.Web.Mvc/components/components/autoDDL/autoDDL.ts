﻿/// <reference path="../../typediff/mytypes.d.ts" />

Polymer('is-auto-ddl', {
    isAjaxing: false,
    selected: "",
    lastSearch: "", 
    selectedid: 0,
    position: 1,
    backgroundcolor: "gray",
    highlightcolor: "yellow",
    isChrome: false,
    fadeOutBackground: function (element, duration, callback = null) {
        //element.style.display = "block";
        //if (this.isChrome) {
            var animation = new Animation(element, [
                //{ opacity: "1.0", transform: "scale(1)" },
                //{ opacity: "0", transform: "scale(0)" },
                { backgroundColor: this.highlightcolor },
                { backgroundColor: "transparent" },
            ], { duration: duration, fill: 'forwards' });
            var player = document.timeline.play(animation);
            player.addEventListener('finish',() => {
                element.style.backgroundColor = "transparent";
                var mythis = this;
                if (callback) {
                    callback();
                }
            });
        //} else {
        //    element.style.backgroundColor = "transparent";
        //}
    },
    fadeInBackground: function (element, duration, position, callback = null) {
        //element.style.display = "block";
        //if (this.isChrome) {
            var animation = new Animation(element, [
                { backgroundColor: "transparent" },
                { backgroundColor: this.highlightcolor },
                //{ opacity: "0", transform: "scale(0)" },
                //{ opacity: "1.0", transform: "scale(1)" },
            ], { duration: duration, fill: 'forwards' });
            //this.fadePlayer.play(animation);
            var player = document.timeline.play(animation);
            player.addEventListener('finish',() => {
                if (position == this.position) {
                    element.style.backgroundColor = this.highlightcolor;
                    var mythis = this;
                    if (callback) {
                        callback(position);
                    }
                } else {
                    //element.style.backgroundColor = "transparent";
                    this.fadeOutBackground(element, 0);
                }
            });
        //} else {
        //    element.style.backgroundColor = "transparent";
        //}

    },
    ready: function () {
        var isChromium = window.chrome,
            vendorName = window.navigator.vendor;
        if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
            this.isChrome = true;
        }
    },
    domReady: function () {
        this.listChangeObserver();
        //this.$.itemsContainer.querySelector("#itemsInnerContainer").style.backgroundColor = this.backgroundcolor;
        CoreStyle.list.autoDDL.first = this.backgroundcolor;
    },
    leaveSearch: function (event, detail, sender) {
        setTimeout(() => {
            this.list = [];
        }, 200);
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
        } else if (charCode == 38) {
            if (this.position == 1) {
                this.position = 10
            } else {
                this.position -= 1;
            }
        } else if (charCode == 40) {
            if (this.position == 10) {
                this.position = 1
            } else {
                this.position += 1;
            }
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
        //this.fire('ouch', { msg: 'That hurt!' });//under firing custom events in https://www.polymer-project.org/docs/polymer/polymer.html
    },
    listSearch: function (event, detail, sender) {
        if (this.selected == "") {
            this.list = [];
            if (this.lastSearch != "") {
                this.fire('selected-updated');
            }
        } else {
            this.fire('search-updated');
        }
    },
    listChangeObserverInner: function () {

        var container2 = this.$.itemsContainer.querySelector("#itemsInnerContainer");
        if (container2 != null && this.list.length > 0) {
            var observer2 = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    this.hoverChange(false, 200);
                });
            });
            observer2.observe(container2, {
                childList: true,
            });
        }
    },
    listChangeObserver: function () {
        var observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.hoverChange(false, 200);
                this.listChangeObserverInner();
            });
        });
        var container = this.$.itemsContainer;
        observer.observe(container, {
            //attributes: true,
            childList: true,
            //characterData: true
        });
    },

    //    this.fadeOut(this.$.changePage, 500);
    //this.fadeOut(this.$.changePage2, 500);
    //this.fadeIn(this.$.core_card_content, 200,() => {

    //    this.$.core_card_content.style.display = "block";
    //});
    hoverChange: function (newValue, speed) {
        try {
            //if (newValue) {
            //    var element = this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position];
            //    this.fadeOutBackground(element, speed);//,() => {
            //    //this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position].style.backgroundColor = "";
            //} else {
            //var element = this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position];

            var x = 0, element = this.$.itemsContainer.querySelector("#itemsInnerContainer").children;
            for (x; x < element.length; x++) {
                if (element[x].style.backgroundColor == this.highlightcolor) {
                    //element[x].style.backgroundColor = "transparent"
                    this.fadeOutBackground(element[x], 0);
                };
            }
            this.fadeInBackground(element[this.position], speed, this.position);//,() => {
            //    element.style.display = "block";
            //});
            //this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position].style.backgroundColor = this.highlightcolor;
            //}
        } catch (e) {
            setTimeout(() => {
                if (this.list && this.list.length > 0) {
                    this.hoverChange(newValue, speed)
                }
            }, 20);
        }
    },
    selectHover: function (event, detail, sender) {
        //var x = 0, parent = sender.parentElement.children;
        //for (x; x < parent.length; x++) {
        //    parent[x].style.backgroundColor = "";
        //}
        this.position = event.target.templateInstance.model.itemI + 1;
        this.hoverChange(false, 100);
    },
    selectHoverLeave2: function (event, detail, sender) {
        var tg = (window.event) ? event.srcElement : event.target;
        if (tg.id != "itemsInnerContainer" && sender.id != "itemsInnerContainer") {
            return;
        } else {
            setTimeout(() => {
                if (this.position == 11) {
                    this.position = 1;
                    this.hoverChange(false, 200);
                }
            }, 100);
            this.position = 11;
            //this.hoverChange(false,200);
        }
    },
    //selectHoverLeave: function (event, detail, sender) {
    //    this.position = event.target.templateInstance.model.itemI + 1;
    //    this.hoverChange(true, 100);
    //}
}); 