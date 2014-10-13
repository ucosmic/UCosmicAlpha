/// <reference path="../../typediff/mytypes.d.ts" />

Polymer('polymer-content-home-index', {
    ready: function () {
        //if (this.notification) {
        //    var polymerNotification = document.createElement('polymer-notification');
        //    polymerNotification.message = "testing";
        //    polymerNotification.type = 'notify';
        //    polymerNotification.fadeOutDelay = '10000';
        //    polymerNotification.bindToElement = $("header > .container > .content");
        //    //polymerNotification.bindToElement = $("header > .container > .content");
        //    polymerNotification.setAttribute('id', 'myAlert' + Date.now());
        //    document.body.appendChild(polymerNotification);
        //}
        //if (!this.flasherisdisabled) {
        //    var polymerNotification = document.createElement('polymer-notification');
        //    polymerNotification.message = this.flashertext;
        //    polymerNotification.type = 'notify';
        //    polymerNotification.fadeOutDelay = '10000';
        //    polymerNotification.bindToElement = $("header > .container > .content");
        //    //polymerNotification.bindToElement = $("header > .container > .content");
        //    polymerNotification.setAttribute('id', 'myAlert' + Date.now());
        //    document.body.appendChild(polymerNotification);
        //}
        if (!this.flasherisdisabled) {
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = this.flashertext;
            polymerNotification.type = 'notify';
            polymerNotification.fadeOutDelay = '10000';
            polymerNotification.bindToElement = $("header > .container > .content");
            polymerNotification.style.fontSize = "1.25em";
            polymerNotification.mustClose = true;
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
}); 