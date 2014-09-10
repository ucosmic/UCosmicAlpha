Polymer('polymer-content-home-has-domain-edit-add-link', {
    linkAdded: { url: "", text: "" },
    addedLink: false,
    addLink: function () {
        if (this.$.linkText.inputChange() && this.$.url.inputChange()) {
            this.linkAdded.url = this.url;
            this.linkAdded.text = this.linkText;
            this.addedLink = true;
        } else {
            this.$.linkText.inputChange();
            this.$.url.inputChange();
        }
    }
});
