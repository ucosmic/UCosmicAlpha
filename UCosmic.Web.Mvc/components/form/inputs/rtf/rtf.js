Polymer('polymer-inputs-rtf', {
    errorMessage: "",
    isRTF: false,
    myValue: null,
    ValidationClass: pValidation,
    isValidated: true,
    inputChange: function () {
        var options = {
            isEmail: this.isEmail, value: this.$.input.value, name: this.name, isRequired: this.isRequired,
            valueCompared: this.comparedValue, nameCompared: this.nameCompared, min: this.min }, validation = new this.ValidationClass(options), message = validation.validate();
        if (message == "Ok") {
            this.$.input.style.border = "";
            this.$.inputMessage.style.display = "none";
            this.inputMessage = "";
            return true;
        } else {
            this.$.input.style.border = "2px solid #fa4930";
            this.$.inputMessage.style.display = "block";
            this.inputMessage = message;
            this.isValidated = false;
            return false;
        }
    },
    comparedValueChanged: function (oldValue, newValue) {
        if (newValue == this.$.input.value && newValue) {
            this.inputChange();
        }
    },
    domReady: function () {
        var _this = this;
        this.myPlaceholder = capitaliseFirstLetter(this.name);
        if (this.isRequired) {
            this.$.input.required = true;
        }
        var url = "components/form/inputs/rtf/rtf/rtf.js";
        $.getScript(url, function () {
            $.getScript("components/form/inputs/rtf/rtf/rtf.image.js");
            $.getScript("components/form/inputs/rtf/rtf/rtf.link.js");

            _this.initTinymce();
        });
        url = url.replace(".js", ".css");
        var myThis = this;
        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('href', url);
        document.querySelector("head").appendChild(linkElement);
    },
    initTinymce: function () {
        var _this = this;
        if (this.myValue == "" || !this.$.input) {
            setTimeout(this.initTinymce, 50);
            return;
        }
        this.$.input.style.width = '100%';
        $(this.$.input).wysiwyg({
            initialContent: this.myValue,
            autoSave: true,
            controls: {
                subscript: { visible: false },
                superscript: { visible: false },
                code: { visible: false },
                increaseFontSize: { visible: true },
                decreaseFontSize: { visible: true },
                insertTable: { visible: false }
            }
        }).change(function () {
            _this.myValue = $(_this.$.input).wysiwyg("getContent");
        });
    }
});
