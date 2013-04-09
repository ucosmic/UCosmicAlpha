var ViewModels;
(function (ViewModels) {
    (function (Users) {
        var UserNameValidator = (function () {
            function UserNameValidator() {
                this._ruleName = 'validUserName';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            UserNameValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if(!this._isAwaitingResponse) {
                    var route = App.Routes.WebApi.Identity.Users.validateName(vm.id());
                    this._isAwaitingResponse = true;
                    $.post(route, {
                        name: vm.name()
                    }).always(function () {
                        _this._isAwaitingResponse = false;
                    }).done(function () {
                        callback(true);
                    }).fail(function (xhr) {
                        callback({
                            isValid: false,
                            message: xhr.responseText
                        });
                    });
                }
            };
            return UserNameValidator;
        })();        
        new UserNameValidator();
        var User = (function () {
            function User() {
                var _this = this;
                this.id = ko.observable();
                this.name = ko.observable();
                this.saveSpinner = new ViewModels.Spinner();
                this.name.extend({
                    required: {
                        message: 'Username is required.'
                    },
                    maxLength: 256,
                    validUserName: this
                });
                this.isValidating = ko.computed(function () {
                    return _this.name.isValidating();
                });
                ko.validation.group(this);
            }
            User.prototype.save = function () {
                var _this = this;
                this.saveSpinner.start();
                if(this.isValidating()) {
                    setTimeout(function () {
                        _this.save();
                    }, 50);
                    return false;
                }
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                    this.saveSpinner.stop();
                    return false;
                }
                this.saveSpinner.stop();
            };
            return User;
        })();
        Users.User = User;        
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
