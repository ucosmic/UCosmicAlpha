/// <reference path="../../typediff/mytypes.d.ts" />
// attributes="url,selected,selectedid,list,backgroundcolor,highlightcolor,place_holder_text"
Polymer({
    is: 'is-auto-ddl',
    //behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        //animationConfig: {
        //    value: function () {
        //        return {
        //            'open': {
        //                // provided by neon-animation/animations/scale-up-animation.html
        //                name: 'fade-in-animation',
        //                node: this.$.filter
        //                //, transformOrigin: '100% 0%'// + (this.$.filter.clientWidth - 20)
        //            },
        //            'close': {
        //                // provided by neon-animation-animations/fade-out-animation.html
        //                name: 'fade-out-animation',
        //                node: this.$.filter
        //                //, transformOrigin: '100% 0%'
        //            }
        //        }
        //    }
        //}
        list: {
            type: Array
            , notify: true
            , observer: 'list_changed'
        }
        , fire_ref: {
            type: Object,
            notify: true
            //, observer: 'fire_ref_changed'
        }
        , is_processing: {
            type: Boolean,
            value: false
        }
        , selectedid: {
            type: Number,
            notify: true
            , value: 0
        }
        , selected: {
            type: String,
            notify: true
            , value: ''
        }
        , lastSearch: {
            type: String,
            notify: true
            , value: ''
        }
        , label: {
            type: String,
            notify: true
            , value: ''
        }
        , backgroundcolor: {
            type: String,
            notify: true
            , value: 'gray'
        }
        , highlightcolor: {
            type: String,
            notify: true
            , value: 'yellow'
        }
    },
    selectedid: 0,
    position: 0,
    isChrome: false,
    is_scrolling: false,
    //fadeOutBackground: function (element, duration, callback = null) {
    //    //element.style.display = "block";
    //    //if (this.isChrome) {
    //    var animation = new Animation(element, [
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        { backgroundColor: this.highlightcolor },
    //        { backgroundColor: "transparent" },
    //    ], { duration: duration, fill: 'forwards' });
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', () => {
    //        element.style.backgroundColor = "transparent";
    //        var mythis = this;
    //        if (callback) {
    //            callback();
    //        }
    //    });
    //    //} else {
    //    //    element.style.backgroundColor = "transparent";
    //    //}
    //},
    //fadeInBackground: function (element, duration, position, callback = null) {
    //    //element.style.display = "block";
    //    //if (this.isChrome) {
    //    var animation = new Animation(element, [
    //        { backgroundColor: "transparent" },
    //        { backgroundColor: this.highlightcolor },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //    ], { duration: duration, fill: 'forwards' });
    //    //this.fadePlayer.play(animation);
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', () => {
    //        if (position == this.position) {
    //            element.style.backgroundColor = this.highlightcolor;
    //            var mythis = this;
    //            if (callback) {
    //                callback(position);
    //            }
    //        } else {
    //            //element.style.backgroundColor = "transparent";
    //            this.fadeOutBackground(element, 0);
    //        }
    //    });
    //    //} else {
    //    //    element.style.backgroundColor = "transparent";
    //    //}

    //},
    created: function () {
        var isChromium = window.chrome,
            vendorName = window.navigator.vendor;
        if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
            this.isChrome = true;
        }
    },
    attached: function () {
        this.listChangeObserver();
        //this.$.itemsInnerContainer.style.backgroundColor = this.backgroundcolor;
        //this.$.itemsContainer.querySelector("#itemsInnerContainer").style.backgroundColor = this.backgroundcolor;
        //CoreStyle.list.autoDDL.first = this.backgroundcolor;
    },
    leaveSearch: function (event, detail, sender) {
        if (!this.is_scrolling) {
            setTimeout(() => {
                this.list = [];
            }, 200);
        }
    },
    list_changed: function (newV, oldV) {
        if (newV.length == 1) {
            if (this.selected == newV[0].text) {
                this.list = [];
            }
        }
        if (newV.length > 0) {
            setTimeout(() => {
                this.$.itemsContainer.querySelector("#itemsInnerContainer").style.backgroundColor = this.backgroundcolor;
            }, 200);
        }
    },
    selectedKeyPress: function (event, detail, sender) {
        event = event || window.event;
        var charCode = event.keyCode || event.which;
        console.log(charCode);
        var limit = this.list.length - 1;
        if (charCode == 13 || charCode == 9) {
            if (!this.list || this.list.length > 0) {
                var position = this.position;
                this.selected = this.list[position].text;
                this.selectedid = this.list[position]._id;
                this.fire('selected-updated');
                this.fire('search-updated');
                this.position = 0;
                this.list = [];
            }
        } else if (charCode == 38) {
            if (this.position == 0) {
                this.position = limit
            } else {
                this.position -= 1;
            }
            this.hoverChange(false, 100);
        } else if (charCode == 40) {
            if (this.position == limit) {
                this.position = 0; 
            } else {
                this.position += 1;
            }
            this.hoverChange(false, 100);
        }
        var x = this.$.itemsContainer.children[1]
        if (x) {
            var a = x.children[this.position]
            this.is_scrolling = true;
            a.focus();
            event.target.focus();
        }
    },
    selectedChanged: function (newV, oldV) {
        if (newV == "" && oldV && oldV.length > 0) {
            this.fire('selected-updated');
            this.selected = "";
            this.selectedid = 0;
            this.fire('search-updated');
            this.position = 0;
        }
    },
    select: function (event, detail, sender) {
        var item = this.querySelector("#items").itemForElement(event.target);
        this.selectedid = item._id;
        this.selected = item.text;
        this.fire('selected-updated');
        this.list = [];
        //this.fire('ouch', { msg: 'That hurt!' });//under firing custom events in https://www.polymer-project.org/docs/polymer/polymer.html
    },
    fire_search: function () {
        this.is_scrolling = false;
        this.fire('search-updated');
    },
    listSearch: function (event, detail, sender) {
        if (this.selected == "") {
            this.selectedid = 'all';
            //this.list = [];
            //if (this.lastSearch != "") {
            this.fire('selected-updated');
            //}
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

            var x = 0, elements = this.$.itemsContainer.querySelector("#itemsInnerContainer").children;
            if (elements) {
                //elements = elements.querySelectorAll(".list-item");
                for (x; x < elements.length; x++) {
                    if (elements[x].style.backgroundColor == this.highlightcolor) {
                        elements[x].style.backgroundColor = "transparent";
                        //this.fadeOutBackground(elements[x], 0);
                    };
                }
                elements[this.position].style.backgroundColor = "yellow"; 
                //this.fadeInBackground(elements[this.position], speed, this.position);//,() => {
                //    element.style.display = "block";
                //});
                //this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position].style.backgroundColor = this.highlightcolor;
                //}
            } else {
                setTimeout(() => {
                    if (this.list && this.list.length > 0) {
                        this.hoverChange(newValue, speed)
                    }
                }, 20);
            }
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
        var item = this.querySelector("#items").itemForElement(event.target);
        this.position = _.findIndex(this.list, item);// + 1;
        this.hoverChange(false, 100);
    },
    selectHoverLeave2: function (event, detail, sender) {
        var tg = (window.event) ? event.srcElement : event.target;
        if ((!tg || tg.id != "itemsInnerContainer") && (!sender || sender.id != "itemsInnerContainer")) {
            return;
        } else {
            setTimeout(() => {
                if (this.position == 10) {
                    this.position = 0;
                    this.hoverChange(false, 200);
                }
            }, 100);
            this.position = 0;
            //this.hoverChange(false,200);
        }
    },
    selectHoverLeave: function (event, detail, sender) {
        //this.position = event.target.templateInstance.model.itemI + 1;
        var item = this.querySelector("#items").itemForElement(event.target);
        this.position = _.findIndex(this.list, item);// + 1;
        this.hoverChange(true, 100);
    }
}); 