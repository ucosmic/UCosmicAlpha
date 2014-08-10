//file:///C:/Users/Tim/sharedBlackAMD/mylivechurch/public/components/test.html?username=askldjf%40asd.adsf&Remember=true

interface validationOptions {
    value: string;
    valueCompared?: string;
    isEmail?: boolean;
    isAlphaNumeric?: boolean;
    min?: number;
    name: string;
    nameCompared?: string;
    isRequired?: string;
    pattern?: string;
    correctformat?: string;
}
//var capitaliseFirstLetter;//so I can use with typescript

class pValidation {
    constructor(options: validationOptions) {
        //this.isEmail = options.isEmail;
        this.min = options.min;
        this.value = options.value;
        this.valueCompared = options.valueCompared;
        this.name = options.name;
        this.nameCompared = options.nameCompared;
        this.isRequired = options.isRequired;
        //this.isAlphaNumeric = options.isAlphaNumeric;
        this.pattern = options.pattern;
        this.correctformat = options.correctformat;
    }
    isRequired: string;
    //isEmail: boolean;
    //isAlphaNumeric: boolean
    min: number;
    value: string;
    valueCompared: string;
    name: string;
    nameCompared: string;
    message: string = "";
    pattern: string;
    correctformat: string;

    //validateEmail(email) {
    //    var re = /\S+@\S+\.\S+/;
    //    return re.test(email);
    //}
    

    validate():string {
        var isValid = true;
        //if (this.isEmail && !this.validateEmail(this.value) && this.value.length > 0) {
        //    this.message = this.name + " is not a valid email"
        //    isValid = false;
        //}
        if (this.valueCompared && this.value != this.valueCompared && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and "
            }
            this.message += this.name + " must match " + this.nameCompared;
            isValid = false;
        }
        if (this.min != null && this.min > this.value.length && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and "
            }
            this.message += this.name + " must be at least " + this.min + " characters long";
            isValid = false;
        }
        //if (this.isAlphaNumeric != null && !(/[^a-zA-Z0-9]/.test(this.value))) {
        //    if (!isValid) {
        //        this.message += ", and "
        //    }
        //    this.message += this.name + " must be alphanumeric characters only";
        //    isValid = false;
        //}
        if (this.pattern != null && !(new RegExp(this.pattern).test(this.value)) && this.value.length > 0) {
            if (!isValid) {
                this.message += ", and "
            }
            this.message += this.name + " must be in the correct format " + this.correctformat;
            isValid = false;
        }
        if (this.isRequired != null && this.value.length < 1) {
            //if (!isValid) {//will never hit here
            //    this.message += ", and "
            //}
            this.message += this.name + " is required";
            isValid = false;
        }
        if (!isValid) {
            this.message += ". "
            } else {
            this.message = "Ok";
            }
        return capitaliseFirstLetter(this.message);
    }
}