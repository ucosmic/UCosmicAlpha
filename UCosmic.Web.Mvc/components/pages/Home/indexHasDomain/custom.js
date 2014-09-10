Polymer('polymer-content-home-has-domain-custom', {
    currentlySelectedSection: null,
    ready: function () {
        if (this.homeSections && !this.homeSections.url) {
            var homeSections = JSON.parse(this.homeSections);
            if (!homeSections.length) {
                this.homeSections = [];
                this.homeSections[0] = homeSections;
                if (this.homeSections.length) {
                    this.homeSections = null;
                }
            } else {
                this.homeSections = homeSections;
            }
        }
    },
    deleteSection: function (event, someNumber, element) {
        if (this.isAjaxing) {
            return;
        }
        this.isAjaxing = true;

        this.currentlySelectedSection = event.target.templateInstance.model.section;
        this.currentlySelectedSection.isArchive = 'true';

        this.$.ajax_deleteSection.method = 'DELETE';

        this.$.ajax_deleteSection.url = 'api/home/section?homeSectionId=' + this.currentlySelectedSection.id;

        this.$.ajax_deleteSection.go();
    },
    deleteSectionResponse: function (response) {
        if (!response.detail.response.error) {
            this.homeSections.splice(this.currentlySelectedSection, 1);
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
    }
});
