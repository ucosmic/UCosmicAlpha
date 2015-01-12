var ViewModels;
(function (ViewModels) {
    var Users;
    (function (Users) {
        var User = (function () {
            function User() {
                this.id = ko.observable();
                this.name = ko.observable();
                this.password = ko.observable();
                this.username = ko.observable();
                this.saveSpinner = new App.Spinner({ delay: 200, });
                this.errorMessage = ko.observable();
                this.isWarnedSSO = ko.observable(sessionStorage.getItem('UserCreateFormIsWarnedSSO') || false);
                this.isWarnedNotSSO = ko.observable(sessionStorage.getItem('UserCreateFormIsWarnedNotSSO') || false);
                this.isAjaxing = false;
                this.name.extend({
                    required: {
                        message: 'Username is required.'
                    },
                    maxLength: 256,
                    validUserName: this
                });
                ko.validation.group(this);
            }
            User.prototype.acceptWarningSSO = function () {
                this.isWarnedSSO(true);
                sessionStorage.setItem('UserCreateFormIsWarnedSSO', this.isWarnedSSO().toString());
            };
            User.prototype.acceptWarningNotSSO = function () {
                this.isWarnedNotSSO(true);
                sessionStorage.setItem('UserCreateFormIsWarnedNotSSO', this.isWarnedNotSSO().toString());
            };
            User.prototype.createUserNotSSO = function () {
                var _this = this;
                if (!this.isAjaxing) {
                    this.isAjaxing = true;
                    this.saveSpinner.start();
                    $.post('/api/users/', {
                        id: null,
                        name: this.username() + '&' + this.password(),
                        personDisplayName: null,
                        isRegistered: false,
                        roles: null
                    }).done(function (response, statusText, xhr) {
                        alert('User create successfully');
                        location.href = '/users/';
                    }).fail(function (response, statusText, xhr) {
                        _this.errorMessage(xhr.responseText);
                    }).always(function (response, statusText, xhr) {
                        _this.isAjaxing = false;
                        _this.saveSpinner.stop();
                    });
                }
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
                    },
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
    })(Users = ViewModels.Users || (ViewModels.Users = {}));
})(ViewModels || (ViewModels = {}));
