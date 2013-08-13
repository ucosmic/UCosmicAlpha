var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../Spinner.ts" />
    (function (Users) {
        //class UserNameValidator implements KnockoutValidationAsyncRuleDefinition {
        //    private _ruleName: string = 'validUserName';
        //    private _isAwaitingResponse: boolean = false;
        //    async: boolean = true;
        //    message: string = 'error';
        //    validator(val: string, vm: User, callback: KnockoutValidationAsyncCallback) {
        //        if (!this._isAwaitingResponse) {
        //            var route = App.Routes.WebApi.Identity.Users.validateName(vm.id());
        //            this._isAwaitingResponse = true;
        //            $.post(route, { name: vm.name() })
        //            .always((): void => {
        //                this._isAwaitingResponse = false;
        //            })
        //            .done((): void => {
        //                callback(true);
        //            })
        //            .fail((xhr: JQueryXHR): void => {
        //                callback({ isValid: false, message: xhr.responseText });
        //            });
        //        }
        //    }
        //    constructor() {
        //        ko.validation.rules[this._ruleName] = this;
        //        ko.validation.addExtender(this._ruleName);
        //    }
        //}
        //new UserNameValidator();
        var User = (function () {
            //isValidating: KnockoutComputed<boolean>;
            function User() {
                this.id = ko.observable();
                this.name = ko.observable();
                this.saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this.errorMessage = ko.observable();
                this.name.extend({
                    required: {
                        message: 'Username is required.'
                    },
                    maxLength: 256,
                    validUserName: this
                });

                //this.isValidating = ko.computed((): boolean => {
                //    return this.name.isValidating();
                //});
                ko.validation.group(this);
            }
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

                //if (this.isValidating()) {
                //    setTimeout((): boolean => { this.save(); }, 50);
                //    return false;
                //}
                //var url = App.Routes.WebApi.Identity.Users.post();
                //var data = {
                //    name: this.name()
                //};
                //$.post(url, data)
                //.done((response: string, statusText: string, xhr: JQueryXHR): void => {
                //    // redirect to search
                //    window.location.href = App.Routes.Mvc.Identity.Users.created({ location: xhr.getResponseHeader('Location') });
                //})
                //.fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                //    this.errorMessage('An unexpected error occurred while trying to create this user.');
                //});
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
