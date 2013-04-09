/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />

module ViewModels.Users {

    class UserNameValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validUserName';
        private _isAwaitingResponse: bool = false;
        async: bool = true;
        message: string = 'error';
        validator(val: string, vm: User, callback: KnockoutValidationAsyncCallback) {
            if (!this._isAwaitingResponse) {
                var route = App.Routes.WebApi.Identity.Users
                    .validateName(vm.id());
                this._isAwaitingResponse = true;
                $.post(route, { name: vm.name() })
                .always((): void => {
                    this._isAwaitingResponse = false;
                })
                .done((): void => {
                    callback(true);
                })
                .fail((xhr: JQueryXHR): void => {
                    callback({ isValid: false, message: xhr.responseText });
                });
            }
        }
        constructor() {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new UserNameValidator();

    export class User implements KnockoutValidationGroup {

        id: KnockoutObservableNumber = ko.observable();
        name: KnockoutObservableString = ko.observable();

        saveSpinner = new Spinner({ delay: 200, isVisible: false });
        errorMessage: KnockoutObservableString = ko.observable();

        isValid: () => bool;
        errors: KnockoutValidationErrors;
        isValidating: KnockoutComputed;

        constructor() {

            this.name.extend({
                required: {
                    message: 'Username is required.'
                },
                maxLength: 256,
                validUserName: this
            });

            this.isValidating = ko.computed((): bool => {
                return this.name.isValidating();
            });

            ko.validation.group(this);
        }

        save(): bool {

            this.saveSpinner.start();

            if (this.isValidating()) {
                setTimeout((): bool => { this.save(); }, 50);
                return false;
            }

            if (!this.isValid()) { // validate
                this.errors.showAllMessages();
                this.saveSpinner.stop();
                return false;
            }

            var url = App.Routes.WebApi.Identity.Users.post();
            var data = {
                name: this.name()
            };

            $.post(url, data)
            .done((response: string, statusText: string, xhr: JQueryXHR): void {
                // redirect to search
                window.location.href = App.Routes.Mvc.Identity.Users
                    .created(xhr.getResponseHeader('Location'));
            })
            .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                this.errorMessage('An unexpected error occurred while trying to create this user.');
            });

            this.saveSpinner.stop();
        }
    }
}