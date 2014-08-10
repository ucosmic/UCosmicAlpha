Polymer('polymer-inputs-required', {
    errorMessage: "",
    myValue: null,
    ValidationClass: pValidation,
    isValidated: true,
    inputChange: function () {
        var options = {
            value: this.$.input.value, name: this.name, isRequired: this.isRequired,
            valueCompared: this.comparedValue, nameCompared: this.nameCompared, min: this.min, isAlphaNumeric: this.isAlphaNumeric,
            max: this.mymaxlength, pattern: this.mypattern, correctformat: this.correctformat }, validation = new this.ValidationClass(options), message = validation.validate();
        if (message == "Ok") {
            this.$.input.style.border = "";
            this.$.input2.style.border = "";
            this.$.inputMessage.style.display = "none";
            this.inputMessage = "";
            return true;
        } else {
            this.$.input.style.border = "2px solid #fa4930";
            this.$.input2.style.border = "2px solid #fa4930";
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
    ready: function () {
        this.myPlaceholder = capitaliseFirstLetter(this.name);
        if (this.isRequired) {
            this.$.input.required = true;
            this.$.input2.required = true;
        }
    }
});
