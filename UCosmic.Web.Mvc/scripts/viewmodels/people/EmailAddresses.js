var ViewModels;
(function (ViewModels) {
    (function (People) {
        var EmailAddresses = (function () {
            function EmailAddresses() { }
            return EmailAddresses;
        })();
        People.EmailAddresses = EmailAddresses;        
    })(ViewModels.People || (ViewModels.People = {}));
    var People = ViewModels.People;
})(ViewModels || (ViewModels = {}));
