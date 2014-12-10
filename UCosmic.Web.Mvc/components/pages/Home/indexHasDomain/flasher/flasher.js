Polymer('polymer-content-home-has-domain-flasher', {
    linkAdded: { url: "", text: "" },
    isAjaxing: false,
    isEditing: false,
    isInit: false,
    flasherUpdated: 0,
    flasherisdisabledChanged: function () {
        if (!this.isEditing && typeof this.flasherisdisabled != "string") {
            this.update();
        }
        if (this.isInit) {
            this.isEditing = false;
        }
        if (typeof this.flasherisdisabled == "string") {
            this.isInit = true;
            this.isEditing = true;
            this.flasherisdisabled = true;
        }
    },
    attached: function () {
    },
    change: function () {
        this.cancelIsDisabledValue = this.flasherisdisabled;
        this.cancelFlasherTextValue = this.flashertext;
        this.isEditing = true;
        this.$.change.style.display = "none";
        this.$.update.style.display = "inline";
        this.$.cancel.style.display = "inline";
        this.$.flashertext.style.display = "none";
        this.$.flashertextInput.style.display = "block";
    },
    cancel: function () {
        this.isEditing = false;
        this.flasherisdisabled = this.cancelIsDisabledValue;
        this.flashertext = this.cancelFlasherTextValue;
        this.$.change.style.display = "block";
        this.$.update.style.display = "none";
        this.$.cancel.style.display = "none";
        this.$.flashertext.style.display = "block";
        this.$.flashertextInput.style.display = "none";
    },
    update: function () {
        if (this.isAjaxing) {
            return;
        }
        if (this.$.flashertextInput.inputChange()) {
            this.isAjaxing = true;
            this.$.ajax_updateFlasher.method = 'POST';
            this.$.ajax_updateFlasher.contentType = "application/json;charset=UTF-8";
            this.flashertext = this.flashertext.replace(/\r?\n|\r/, " ");
            this.$.ajax_updateFlasher.body = JSON.stringify({
                Text: this.flashertext,
                IsDisabled: this.flasherisdisabled
            });

            this.$.ajax_updateFlasher.go();
        } else {
            this.$.description.inputChange();
            if (this.links.length == 0) {
                this.$.linkMessage.style.display = "block";
            } else {
                this.$.linkMessage.style.display = "none";
            }
        }
    },
    updateFlasherResponse: function (response) {
        if (!response.detail.response.error) {
            this.cancelIsDisabledValue = this.flasherisdisabled;
            this.cancelFlasherTextValue = this.flashertext;
            this.cancel();
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = "Flasher message updated";
            polymerNotification.type = 'success';
            polymerNotification.fadeOutDelay = '5000';
            polymerNotification.bindToElement = this.$.homeFlasherTable;
            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
            this.flasherUpdated += 1;
        } else {
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = response.detail.response.error;
            polymerNotification.type = 'warning';
            polymerNotification.fadeOutDelay = '10000';
            polymerNotification.bindToElement = this.$.homeSectionTable;
            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
        }
        this.isAjaxing = false;
    },
    ajaxError: function (response) {
        var polymerNotification = document.createElement('polymer-notification');
        polymerNotification.message = response.detail.response;
        polymerNotification.type = 'warning';
        polymerNotification.fadeOutDelay = '10000';
        polymerNotification.bindToElement = this.$.homeSectionTable;
        polymerNotification.setAttribute('id', 'myAlert' + Date.now());
        document.body.appendChild(polymerNotification);
        this.isAjaxing = false;
    },
    cancelSection: function () {
        this.cancel += 1;
    }
});
