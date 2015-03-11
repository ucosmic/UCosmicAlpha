module ViewModels.Users {


    export class User implements KnockoutValidationGroup {

        id = ko.observable<number>();
        name = ko.observable<string>();
        password = ko.observable<string>();
        username = ko.observable<string>();

        saveSpinner = new App.Spinner({ delay: 200, });
        errorMessage = ko.observable<string>();

        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        //isValidating: KnockoutComputed<boolean>;

        isWarnedSSO = ko.observable<boolean>(sessionStorage.getItem('UserCreateFormIsWarnedSSO') || false);
        isWarnedNotSSO = ko.observable<boolean>(sessionStorage.getItem('UserCreateFormIsWarnedNotSSO') || false);

        acceptWarningSSO(): void {
            this.isWarnedSSO(true);
            sessionStorage.setItem('UserCreateFormIsWarnedSSO', this.isWarnedSSO().toString());
        }
        acceptWarningNotSSO(): void {
            this.isWarnedNotSSO(true);
            sessionStorage.setItem('UserCreateFormIsWarnedNotSSO', this.isWarnedNotSSO().toString());
        }

        constructor() {

            this.name.extend({
                required: {
                    message: 'Username is required.'
                },
                maxLength: 256,
                validUserName: this
            });

            ko.validation.group(this);
        }

        isAjaxing = false;

        createUserNotSSO() {
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
                    })
                    .fail((response, statusText, xhr) => {
                        this.errorMessage(xhr.responseText); 
                    })
                    .always((response, statusText, xhr) => {
                        this.isAjaxing = false;
                        this.saveSpinner.stop();
                    });
            }
        }

        save(): boolean {

            if (!this.isValid()) { // validate
                this.errors.showAllMessages();
                return false;
            }

            this.saveSpinner.start();

            $.ajax({
                type: "POST",
                async: false,
                url: App.Routes.WebApi.Identity.Users.validateName(this.id()),
                data: { name: this.name() },
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void =>
                { this.errorMessage(null); },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void =>
                { this.errorMessage(jqXhr.responseText); },
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
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                    window.location.href = App.Routes.Mvc.Identity.Users.created({ location: jqXhr.getResponseHeader('Location') });
                },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.errorMessage('An unexpected error occurred while trying to create this user.');
                },
                complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                    this.saveSpinner.stop();
                }
            });
        }
    }
}