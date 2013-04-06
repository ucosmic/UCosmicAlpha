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
                if(!vm.isTextValidatableAsync()) {
                    callback(true);
                } else {
                    if(!this._isAwaitingResponse) {
                        var route = App.Routes.WebApi.Identity.Users.validateName(vm.id());
                        this._isAwaitingResponse = true;
                        $.post(route, vm.serializeData()).always(function () {
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
                }
            };
            return UserNameValidator;
        })();        
        new UserNameValidator();
        var User = (function () {
            function User() { }
            return User;
        })();
        Users.User = User;        
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
