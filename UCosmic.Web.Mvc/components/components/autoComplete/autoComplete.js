/// <reference path="../../typediff/mytypes.d.ts" />
//class activityCount{
//    locationCount: number;
//    type: string;
//    typeCount: number;
//    constructor(type: string = "", typeCount: number = 0, locationCount: number = 0){
//        this.type = type;
//        this.typeCount = typeCount;
//        this.locationCount = locationCount;    }
Polymer('is-auto-complete', {
    isAjaxing: false,
    selected: "",
    lastSearch: "",
    selectedid: 0,
    ajaxUrl: "",
    ready: function () {
    },
    getTextWidth: function (text, font) {
        var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
    },
    listChanged: function (oldValue, newValue) {
        var myArray = JSON.parse(JSON.stringify(newValue));
        if (myArray && myArray.length > 0) {
            this.firstItemInList = myArray[0];
            this.secondToN_list = myArray;
            this.secondToN_list.splice(0, 1);
        }
        else {
            this.firstItemInList = undefined;
            this.secondToN_list = [];
        }
    },
    leaveSearch: function (event, detail, sender) {
        setTimeout(function () {
        }, 200);
    },
    select: function (event, detail, sender) {
        this.selectedid = sender.getAttribute('data-id');
        this.selected = sender.textContent || sender.innerText || "";
        this.fire('selected-updated');
        this.list = [];
    },
    selectFirstItemInList: function (event, detail, sender) {
        this.selectedid = sender.getAttribute('data-id');
        this.selected = this.selected + sender.textContent || sender.innerText || "";
        this.fire('selected-updated');
        this.list = [];
    },
    listSearch: function (event, detail, sender) {
        if (this.selected == "") {
            this.list = [];
            if (this.lastSearch != "") {
                this.fire('selected-updated');
            }
        }
        else {
            this.fire('search-updated');
        }
    },
    checkToSeeIfValueChanged: function (left) {
        var _this = this;
        var firstItemInListItem = this.$.firstItemInListContainer.querySelector("#firstItemInListItem");
        if (firstItemInListItem) {
            firstItemInListItem.style.left = (left).toString() + "px";
            this.firstItemInListText = this.firstItemInList.text.substring(this.selected.length);
            if ((this.selected + this.firstItemInListText).toLowerCase() == this.firstItemInList.text.toLowerCase()) {
                this.fire('selected-updated');
            }
        }
        else {
            setTimeout(function () {
                _this.checkToSeeIfValueChanged(left);
            }, 20);
        }
    },
    selectedChanged: function (oldValue, newValue) {
        if (newValue == "") {
            this.checkToSeeIfValueChanged(0);
        }
        else {
            var elem = this.$.selectedInput;
            var font = window.getComputedStyle(elem, null).getPropertyValue("font");
            var left = this.getTextWidth(newValue, font);
            this.checkToSeeIfValueChanged(left);
        }
    },
});
