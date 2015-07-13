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

    },
    domReady: function () {
        //this.listChangeObserver();
        //this.$.itemsContainer.querySelector("#itemsInnerContainer").style.backgroundColor = this.backgroundcolor;
        CoreStyle.list.DDL.first = this.backgroundcolor;
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
                        //element[x].style.backgroundColor = "transparent"
                        this.fadeOutBackground(elements[x], 0);
                    };
                }
                this.fadeInBackground(elements[this.position], speed, this.position);//,() => {
            //    element.style.display = "block";
            //});
            //this.$.itemsContainer.querySelector("#itemsInnerContainer").children[this.position].style.backgroundColor = this.highlightcolor;
            //}
            }else{
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
    select: function (event, detail, sender) {
        this.selected = sender.dataset.id;
        this.fire('selected_updated');
    },
    //selectHoverLeave: function (event, detail, sender) {
    //    this.position = event.target.templateInstance.model.itemI + 1;
    //    this.hoverChange(true, 100);
    //}
}); 