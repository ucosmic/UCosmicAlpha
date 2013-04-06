/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.Users {

    class UserNameValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validUserName';
        private _isAwaitingResponse: bool = false;
        async: bool = true;
        message: string =  'error';
        validator(val: string, vm: any, callback: KnockoutValidationAsyncCallback) {
            if (!vm.isTextValidatableAsync()) {
                callback(true);
            }
            else if (!this._isAwaitingResponse) {
                var route = App.Routes.WebApi.Identity.Users
                    .validateName(vm.id());
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData())
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
        constructor () {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new UserNameValidator();

    export class User {


    }
}