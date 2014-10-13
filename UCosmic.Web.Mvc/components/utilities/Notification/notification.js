Polymer('polymer-notification', {
    ready: function () {
    },
    domReady: function () {
        var _this = this;
        if (!this.mustClose) {
            ElRelativeToEl($(this.bindToElement), $(this.$.pop_text_container_alert));
            setTimeout(function () {
                $(_this.$.pop_container_alert).fadeOut(1000, function () {
                    $('#' + _this.id).remove();
                });
            }, this.fadeOutDelay);
            this.$.closeHeader.style.display = "none";
        } else {
            this.$.closeHeader.style.display = "block";
            ElRelativeToEl($(this.bindToElement), $(this.$.pop_text_container_alert));
            this.$.pop_text_container_alert.style.top = "200px";
        }
    },
    closeIt: '',
    closeItChanged: function () {
        $('#' + this.id).remove();
        this.hide = true;
        this.closeIt = false;
    },
    hide: false
});
