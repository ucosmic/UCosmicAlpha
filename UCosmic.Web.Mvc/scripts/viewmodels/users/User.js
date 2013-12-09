var ViewModels;
(function (ViewModels) {
    (function (Users) {
        var User = (function () {
            function User() {
                this.id = ko.observable();
                this.name = ko.observable();
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.errorMessage = ko.observable();
                this.isWarned = ko.observable(sessionStorage.getItem('UserCreateFormIsWarned') || false);
                this.name.extend({
                    required: {
                        message: 'Username is required.'
                    },
                    maxLength: 256,
                    validUserName: this
                });

                ko.validation.group(this);
            }
            User.prototype.acceptWarning = function () {
                this.isWarned(true);
                sessionStorage.setItem('UserCreateFormIsWarned', this.isWarned().toString());
            };

            User.prototype.save = function () {
                var _this = this;
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                    return false;
                }

                this.saveSpinner.start();

                $.ajax({
                    type: "POST",
                    async: false,
                    url: App.Routes.WebApi.Identity.Users.validateName(this.id()),
                    data: { name: this.name() },
                    success: function (data, textStatus, jqXhr) {
                        _this.errorMessage(null);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.errorMessage(jqXhr.responseText);
                    }
                });

                if (this.errorMessage() != null) {
                    this.saveSpinner.stop();
                    return;
                }

                $.ajax({
                    type: "POST",
                    async: true,
                    url: App.Routes.WebApi.Identity.Users.post(),
                    data: { name: this.name() },
                    success: function (data, textStatus, jqXhr) {
                        window.location.href = App.Routes.Mvc.Identity.Users.created({ location: jqXhr.getResponseHeader('Location') });
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.errorMessage('An unexpected error occurred while trying to create this user.');
                    },
                    complete: function (jqXhr, textStatus) {
                        _this.saveSpinner.stop();
                    }
                });
            };
            return User;
        })();
        Users.User = User;
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
