


Polymer('is-popup', {
    content: "",
    domReady: function () {
        this.addEventListener('dragstart', this.drag_start, false);
        document.body.addEventListener('dragover', this.drag_over, false);
        document.body.addEventListener('drop', this.drop, false); 
        this.style.position = "absolute";
        this.setAttribute('draggable', 'true');
    },
    close: function(event){
        event.target.parentElement.parentNode.host.remove();
        this.fire('close');
    },
    current_draggable: {},
    drag_start: function (event) {
        var style = window.getComputedStyle(event.target, null),
            myThis: any = document.querySelector("is-page-summary-map");
        event.dataTransfer.setData("text/plain",
            (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
        myThis.current_draggable = event.target;
    },
    drag_over: function (event) {
        event.preventDefault();
        return false;
    },
    drop: function (event) {
        var offset = event.dataTransfer.getData("text/plain").split(','),
            myThis: any = document.querySelector("is-page-summary-map"),
            dm = myThis.current_draggable;
        dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
        dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
        event.preventDefault();
        return false;
    },
}); 