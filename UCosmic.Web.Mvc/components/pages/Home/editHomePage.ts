/// <reference path="../../typediff/mytypes.d.ts" />

Polymer('polymer-content-edit-home-page', {
    //isEditing: false,
    cancel: 0,
    //homeSections: [],
    addedSection: "",
    ready: function () {
        //create array with what is sent from server
        //this.homeSections = $.parseJSON(this.homeSections);
        if (this.notification) {
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = "testing";
            polymerNotification.type = 'notify';
            polymerNotification.fadeOutDelay = '10000';
            polymerNotification.bindToElement = $("header > .container > .content");
            //polymerNotification.bindToElement = $("header > .container > .content");
            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
        }
        if (this.homeSections && !this.homeSections[0].title) {
            var homeSections = JSON.parse(this.homeSections);
            if (!homeSections.length) {
                this.homeSections = [];
                this.homeSections[0] = homeSections;
                if (this.homeSections.length){
                    this.homeSections = null;
                } 
            } else {
                this.homeSections = homeSections;
            }
        }
    },
    addSection: function (e) {
        //alert("test");
        //this.isEditing = false;
        this.$.sectionEditor.style.display = 'block';
        this.$.addNewSection.style.display = 'none';
    },
    addedSectionChanged: function (oldValue, newValue) {
        if (newValue) {
            this.addedSection = false;
            if (!this.homeSections || this.homeSections.length == 0) {
                this.homeSections = [];
                this.homeSections[0] = { title: this.sectionAdded.title, description: this.sectionAdded.description, links: this.sectionAdded.links, id: this.sectionAdded.id, hasPhoto: this.sectionAdded.hasPhoto };
            } else {
                this.homeSections.push({ title: this.sectionAdded.title, description: this.sectionAdded.description, links: this.sectionAdded.links, id: this.sectionAdded.id, hasPhoto: this.sectionAdded.hasPhoto })
            }
        }
        //alert(this.link.text);
    },
    cancelChanged: function (oldValue, newValue) {
        this.$.sectionEditor.style.display = 'none';
        this.$.addNewSection.style.display = 'block';        
    },
}); 