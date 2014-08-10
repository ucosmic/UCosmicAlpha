
var pValidation = (function () {
    function pValidation(options) {
        this.message = "";
        this.min = options.min;
        this.value = options.value;
        this.valueCompared = options.valueCompared;
        this.name = options.name;
        this.nameCompared = options.nameCompared;
        this.isRequired = options.isRequired;

        this.pattern = options.pattern;
        this.correctformat = options.correctformat;
    }
    pValidation.prototype.validate = function () {
        var isValid = true;

        if (this.valueCompared && this.value != this.valueCompared && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and ";
            }
            this.message += this.name + " must match " + this.nameCompared;
            isValid = false;
        }
        if (this.min != null && this.min > this.value.length && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and ";
            }
            this.message += this.name + " must be at least " + this.min + " characters long";
            isValid = false;
        }

        if (this.pattern != null && !(new RegExp(this.pattern).test(this.value)) && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and ";
            }
            this.message += this.name + " must be in the correct format " + this.correctformat;
            isValid = false;
        }
        if (this.isRequired != null && this.value.length < 1) {
            this.message += this.name + " is required";
            isValid = false;
        }
        if (!isValid) {
            this.message += ". ";
        } else {
            this.message = "Ok";
        }
        return capitaliseFirstLetter(this.message);
    };
    return pValidation;
})();
