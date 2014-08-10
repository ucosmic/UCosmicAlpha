
//import ElRelativeToEl = require("../ElRelativeToEl");

Polymer('polymer-notification', {
    ready: function () {
        //...
    },
    domReady: function () {
        ElRelativeToEl($(this.bindToElement), $(this.$.pop_text_container_alert));
        
        setTimeout(() => {
            $(this.$.pop_container_alert).fadeOut(1000, () => {
                $('#' + this.id).remove();
            });
        }, this.fadeOutDelay);
    },
    //show: '',
    closeIt: '',
    closeItChanged: function () {
        $('#' + this.id).remove();
        this.hide = true;
        this.closeIt = false;
    },
    hide: false,
    //showChanged: function (oldValue, newValue) {
    //    this.hide = false;
    //    this.show = false;
    //}
});