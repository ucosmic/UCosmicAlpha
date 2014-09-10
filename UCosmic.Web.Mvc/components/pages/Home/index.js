Polymer('polymer-content-home-index', {
    ready: function () {
        if (this.notification) {
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = "testing";
            polymerNotification.type = 'notify';
            polymerNotification.fadeOutDelay = '10000';
            polymerNotification.bindToElement = $("header > .container > .content");

            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
        }
    }
});
