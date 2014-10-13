
Polymer('polymer-content-home-has-domain-edit', {
    isAjaxing: false,
    links: [],
    addedLink: "",
    addedSection: false,
    sectionAdded: { title: "", description: "", links: { url: "", linkText: "" }, imageUrl: "" },
    ready: function () {
        if (this.isEditing) {
            this.buttonText = "Edit Section";
        } else {
            this.buttonText = "Add Section";
        }
    },
    addEdit: function () {
        if(this.isAjaxing){
            return;
        }
        if (this.$.title.inputChange() &&
            this.$.description.inputChange()
            ) {
            if (this.links.length) {
                //first upload photo
                this.isAjaxing = true;
                this.$.ajax_addSection.method = 'POST';
                this.$.ajax_addSection.contentType = "application/json;charset=UTF-8";
                //var formData = new FormData();

                //formData.append("Title", this.title);
                //formData.append("Description", this.description);
                //formData.append("Links", this.links);

                //formData.append("homeSecion", {
                //    Title: this.title,
                //    Description: this.description,
                //    Links: this.links
                //});

                //this.$.ajax_addSection.body = formData;
                //this.$.ajax_addSection.url = this.$.ajax_addSection.url + '?' + $.param({
                //    homeSection: {
                //        title: this.title,
                //        description: this.description,
                //        links: this.links
                //    }
                //});

                //this.$.ajax_addSection.body = JSON.stringify({
                //    homeSection: {
                //        Title: this.title,
                //        Description: this.description,
                //        Links: this.links
                //    }
                //});
                this.$.ajax_addSection.body = JSON.stringify({
                    Title: this.title,
                    Description: this.description,
                    Links: this.links
                });

                this.$.ajax_addSection.go();
                //look at ajax response
            } else {
                this.$.linkMessage.style.display = "block"
            }
        } else {
            this.$.description.inputChange();
            if (this.links.length == 0) {
                this.$.linkMessage.style.display = "block"
            } else {
                this.$.linkMessage.style.display = "none"
            }
        }
    },
    descriptionChanged: function(){
        this.description = this.description.replace(/\r?\n|\r/g, " ");
    },
    addedLinkChanged: function (oldValue, newValue) {
        if (newValue) {
            this.links.push({ url: this.linkAdded.url, text: this.linkAdded.text })
            this.addedLink = false;
            this.$.linkMessage.style.display = "none"
        }
        //alert(this.link.text);
    },
    deleteLink: function (event, someNumber, element) {
        var myLink = event.target.templateInstance.model.link;
        //var myVideoIndex = this.videos.map(function (e) { return e._id; }).indexOf(element.id);
        this.links = $.grep(this.links, function (value) {
            return value != myLink;
        });
    },
    imageSelected: function (e, detail, sender) {
        var file = this.$.image.files[0];
        if (file.size > 1024 * 1024)
        {
            this.imageMessage = "The image is too large, " + (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB, please upload a smaller image. ';
            this.$.imageMessage.style.display = "block"
            return;
        } else {
            this.$.imageMessage.style.display = "none"
        }
        if (!(file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/gif")){
            this.imageMessage = "The image is not in the correct file type. Please use jpeg, png or gif.";
            this.$.imageMessage.style.display = "block"
            return;
        } else {
            this.$.imageMessage.style.display = "none"
        }


        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.$.image.files[0]);

        oFReader.onload = (oFREvent) => {
            this.$.picture.style.display = "block";
            this.imageSrc = oFREvent.target.result;
        };

        var formData = new FormData();

        formData.append(sender.name, file,
            this.$.image.value || file.name);

        this.$.ajax_addPhoto.body = formData;
        this.$.ajax_addPhoto.method = 'POST';
        // Override default type set by core-ajax.
        // Allow browser to set the mime multipart content type itself. 
        this.$.ajax_addPhoto.contentType = null;
    },
    addPhotoResponse: function (response) {
        //get url from response and post it up with section data

        if (!response.detail.response.error) {
            this.$.linkMessage.style.display = "none";
            this.sectionAdded.title = this.title;
            this.sectionAdded.description = this.description;
            this.sectionAdded.links = this.links;
            this.sectionAdded.hasPhoto = true;
            this.addedSection = true;
            this.title = ""
                this.description = ""
                this.links = [];
            this.imageSrc = "";
            this.$.image.value = ""
            this.$.title.$.input.value = ""
            this.$.picture.style.display = "none";
            this.$.ajax_addPhoto.body = null;

            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = "Your section was added succesfuly";//response.detail.response.message;
            polymerNotification.type = 'success';
            polymerNotification.fadeOutDelay = '5000';
            polymerNotification.bindToElement = this.$.homeSectionTable;
            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
            setTimeout( () => {
                this.cancel += 1
            }, 200);
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
    addSectionResponse: function (response) {

        if (!response.detail.response.error) {
            var sectionId = response.detail.xhr.getResponseHeader("location").substring(30);
            if (this.$.ajax_addPhoto.body) {
                var homeSectionId = sectionId;
                this.$.ajax_addPhoto.url = "/api/home/photo?homeSectionId=" + homeSectionId;
                this.sectionAdded.id = homeSectionId;
                //this.$.ajax_addPhoto.body.append("homeSectionId", "1");//get from response.
                this.$.ajax_addPhoto.go();
                //this.imageSelected = "";
            } else {
                this.$.linkMessage.style.display = "none";
                this.sectionAdded.title = this.title;
                this.sectionAdded.description = this.description;
                this.sectionAdded.links = this.links;
                this.sectionAdded.id = sectionId;
                this.sectionAdded.hasPhoto = false;
                this.addedSection = true;
                this.title = ""
                this.description = ""
                this.links = [];

                var polymerNotification = document.createElement('polymer-notification');
                polymerNotification.message = response.detail.response;
                polymerNotification.type = 'success';
                polymerNotification.fadeOutDelay = '5000';
                polymerNotification.bindToElement = this.$.homeSectionTable;
                polymerNotification.setAttribute('id', 'myAlert' + Date.now());
                document.body.appendChild(polymerNotification);
                setTimeout(() => {
                    this.cancel += 1
                }, 200);
                this.isAjaxing = false;
            }
        } else {
            var polymerNotification = document.createElement('polymer-notification');
            polymerNotification.message = response.detail.response.error;
            polymerNotification.type = 'warning';
            polymerNotification.fadeOutDelay = '10000';
            polymerNotification.bindToElement = this.$.homeSectionTable;
            polymerNotification.setAttribute('id', 'myAlert' + Date.now());
            document.body.appendChild(polymerNotification);
            this.isAjaxing = false;
        }
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
    cancelSection: function (){
        this.cancel += 1;
        this.$.picture.style.display = "none";
        this.imageSrc = "";
        this.imageSelected = "";
        this.links = [];
        this.title = "";
        this.description = "";
    }
}); 