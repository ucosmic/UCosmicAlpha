module ViewModels.Users {

    class RoleGrantValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validRoleGrant';
        private _isAwaitingResponse: boolean = false;
        async: boolean = true;
        message: string = 'error';
        validator(val: string, vm: SearchResult, callback: KnockoutValidationAsyncCallback) {
            if (!vm.selectedRoleOption()) {
                callback(true);
                return;
            }
            if (!this._isAwaitingResponse) {
                var route = App.Routes.WebApi.Identity.Users.Roles
                    .validateGrant(vm.id(), vm.selectedRoleOption());
                this._isAwaitingResponse = true;
                $.post(route)
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
    new RoleGrantValidator();

    class RoleRevokeValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validRoleRevoke';
        private _isAwaitingResponse: boolean = false;
        async: boolean = true;
        message: string = 'error';
        validator(val: string, vm: SearchResult, callback: KnockoutValidationAsyncCallback) {
            if (!vm.roleToRevoke()) {
                callback(true);
                return;
            }
            if (!this._isAwaitingResponse) {
                var route = App.Routes.WebApi.Identity.Users.Roles
                    .validateRevoke(vm.id(), vm.roleToRevoke());
                this._isAwaitingResponse = true;
                $.post(route)
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
    new RoleRevokeValidator();

    export class SearchResult implements KnockoutValidationGroup {
        private _owner: Search;
        id: KnockoutObservable<number>;
        personId: KnockoutObservable<number>;
        name: KnockoutObservable<string>;
        email: KnockoutObservable<string>;
        personDisplayName: KnockoutObservable<string>;
        roles: KnockoutObservableArray<any>;
        roleOptions = ko.observableArray<any>();
        roleOptionsCaption = ko.observable<string>('[Loading...]');
        selectedRoleOption = ko.observable<number>();
        roleToRevoke = ko.observable<number>();
        $roleSelect = ko.observable<JQuery>();
        $confirmPurgeDialog: JQuery;
        deleteSpinner = new App.Spinner();
        isRoleGrantDisabled: KnockoutComputed<boolean>;
        roleSpinner = new App.Spinner({ delay: 0, isVisible: true });
        isRevokeError = ko.observable<boolean>();
        revokeErrorText = ko.observable<string>();
        isGrantError = ko.observable<boolean>();
        grantErrorText = ko.observable<string>();

        $menu = ko.observable<JQuery>();
        isEditingRoles = ko.observable<boolean>(false);

        hasGrants: KnockoutComputed<boolean>;
        hasNoGrants: KnockoutComputed<boolean>;
        hasUniqueDisplayName: KnockoutComputed<boolean>;
        photoSrc: KnockoutComputed<string>;

        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        isValidating: KnockoutComputed<boolean>;

        constructor(values: any, owner: Search) {
            this._owner = owner;

            // map api data to observables
            var userMapping = {
                roles: {
                    create: (options: any): RoleGrant => {
                        return new ViewModels.Users.RoleGrant(options.data, this);
                    }
                }
            };
            ko.mapping.fromJS(values, userMapping, this);

            this._setupPhotoComputeds();
            this._setupNamingComputeds();
            this._setupRoleGrantComputeds();
            this._setupMenuSubscription();
            this._setupValidation();
        }

        private _setupPhotoComputeds(): void {
            this.photoSrc = ko.computed((): string => {
                return App.Routes.WebApi.People.Photo.get(this.personId(), { maxSide: 100 });
            });
        }

        private _setupNamingComputeds(): void {
            this.hasUniqueDisplayName = ko.computed((): boolean => {
                return this.name() !== this.personDisplayName();
            });
        }

        private _setupRoleGrantComputeds(): void {
            this.hasGrants = ko.computed((): boolean => {
                return this.roles().length > 0;
            });
            this.hasNoGrants = ko.computed((): boolean => {
                return !this.hasGrants();
            });
            this.isRoleGrantDisabled = ko.computed((): boolean => {
                return this.roleSpinner.isVisible() || !this.selectedRoleOption();
            });
            this.selectedRoleOption.subscribe((newValue: any): void => {
                // make sure this is an int, not a string
                if (newValue && typeof (newValue) === 'string') {
                    this.selectedRoleOption(parseInt(newValue));
                }
            });
        }

        private _setupMenuSubscription(): void {
            this.$menu.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length) {
                    newValue.kendoMenu();
                }
            });
        }

        private _setupValidation(): void {

            this.selectedRoleOption.extend({
                validRoleGrant: this
            });

            this.roleToRevoke.extend({
                validRoleRevoke: this
            });

            this.isValidating = ko.computed((): boolean => {
                return this.selectedRoleOption.isValidating()
                    || this.roleToRevoke.isValidating();
            });

            this.selectedRoleOption.subscribe((newValue: number): void => {
                this.roleToRevoke(undefined);
            });

            ko.validation.group(this);
        }

        private _pullRoleOptions(): JQueryDeferred<any[]> {
            this.selectedRoleOption(undefined);
            this.roleSpinner.start();
            var deferred = $.Deferred();
            var queryParameters = {
                pageSize: Math.pow(2, 32) / 2 - 1, // equivalent to int.MaxValue
                orderBy: 'name-asc'
            };
            $.get(App.Routes.WebApi.Identity.Roles.get(), queryParameters)
                .done((response: any[], statusText: string, xhr: JQueryXHR): void => {
                    deferred.resolve(response, statusText, xhr);
                })
                .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    deferred.reject(xhr, statusText, errorThrown);
                })
                .always((): void => {
                    this.roleSpinner.stop();
                });
            return deferred;
        }

        private _loadRoleOptions(results: any): void {
            ko.mapping.fromJS(results.items, {}, this.roleOptions);
            this.roleOptionsCaption('[Select access to grant...]');
            this._syncRoleOptions();
            if (this.$roleSelect && this.$roleSelect().length) {
                var roleOptions: any[] = this.roleOptions();
                var roleData = [];
                roleData.push({
                    name: this.roleOptionsCaption()
                })
                for (var i = 0; i < roleOptions.length; i++) {
                    roleData.push({
                        id: roleOptions[i].id(),
                        name: roleOptions[i].name(),
                        description: roleOptions[i].description()
                    });
                }
                this.$roleSelect().kendoDropDownList({
                    height: 300,
                    dataSource: roleData,
                    dataTextField: 'name',
                    dataValueField: 'id',
                    template: '#if (data.id) {# <div><strong>${ data.name }</strong></div>\r\n' +
                    '#} else {#<div>${ data.name }</div>\r\n #}#' +
                    '#if (data.description) {# <div><small>${ data.description }</small></div> #}#'

                });
            }
        }

        private _syncRoleOptions(): void {
            // remove roles that have already been granted
            for (var i = 0; i < this.roleOptions().length; i++) {
                var option = this.roleOptions()[i];
                for (var ii = 0; ii < this.roles().length; ii++) {
                    var grant = this.roles()[ii];
                    if (option.id() == grant.id()) {
                        if (i === 0) {
                            this.roleOptions.shift();
                        }
                        else if (i == this.roleOptions().length) {
                            this.roleOptions.pop();
                        }
                        else {
                            this.roleOptions.splice(i, 1);
                        }
                        i = -1;
                    }
                }
            }
        }

        pullRoleGrants(): JQueryDeferred<any[]> {
            this.roleSpinner.start();
            var deferred = $.Deferred();
            $.get(App.Routes.WebApi.Identity.Users.Roles.get(this.id()))
                .done((response: any[], statusText: string, xhr: JQueryXHR): void => {
                    deferred.resolve(response, statusText, xhr);
                })
                .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    deferred.reject(xhr, statusText, errorThrown);
                })
                .always((): void => {
                    this.roleSpinner.stop();
                });
            return deferred;
        }

        loadRoleGrants(results: any): void {
            var grantMapping = {
                create: (options: any): RoleGrant => {
                    return new ViewModels.Users.RoleGrant(options.data, this);
                }
            };
            ko.mapping.fromJS(results, grantMapping, this.roles);
        }

        impersonate(): void {
            var form = this._owner.impersonateForm;
            if (form) {
                //
                function sendMessage(message) {
                    // This wraps the message posting/response in a promise, which will
                    // resolve if the response doesn't contain an error, and reject with
                    // the error if it does. If you'd prefer, it's possible to call
                    // controller.postMessage() and set up the onmessage handler
                    // independently of a promise, but this is a convenient wrapper.
                    return new Promise(function (resolve, reject) {
                        var messageChannel = new MessageChannel();
                        messageChannel.port1.onmessage = function (event) {
                            if (event.data.error) {
                                reject(event.data.error);
                            } else {
                                resolve(event.data);
                            }
                        };

                        // https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
                        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
                    });
                }
                sendMessage('delete cache');
                var my_this = this;
                setTimeout(function () {
                    my_this._owner.impersonateUserName(my_this.email());
                    $(form).submit();
                }, 500)
            }
        }

        showRoleEditor(): void {
            this.isEditingRoles(true);
            this._pullRoleOptions()
                .done((response: any[]): void => {
                    this._loadRoleOptions(response);
                });
        }
        hideRoleEditor(): void {
            this.roleToRevoke(undefined);
            this.isEditingRoles(false);
        }

        grantRole(): void {
            this.roleSpinner.start();
            this.roleToRevoke(undefined);

            if (this.isValidating()) {
                setTimeout((): void => { this.grantRole(); }, 50);
                return;
            }

            if (!this.isValid()) { // validate
                this.errors.showAllMessages();
                this.roleSpinner.stop();
                return;
            }

            var url = App.Routes.WebApi.Identity.Users.Roles.put(this.id(), this.selectedRoleOption());
            $.ajax({
                url: url,
                type: 'PUT'
            })
                .done((response: string, textStatus: string, xhr: JQueryXHR): void => {
                    App.flasher.flash(response);
                    this.roleOptions.remove((item: any): boolean => {
                        return item.id() == this.selectedRoleOption();
                    });
                    this.pullRoleGrants()
                        .done((response: any[]): void => {
                            this.loadRoleGrants(response);
                            this._pullRoleOptions()
                                .done((response: any[]): void => {
                                    this._loadRoleOptions(response);
                                });
                        });
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.isGrantError(true);
                    this.grantErrorText('An unexpected error occurred while trying to grant access.');
                    this.roleSpinner.stop();
                });
        }

        revokeRole(roleId: number): void {
            this.roleSpinner.start();

            this.roleToRevoke(roleId);

            if (this.isValidating()) {
                setTimeout((): void => { this.revokeRole(roleId); }, 50);
                return;
            }

            if (!this.isValid()) { // validate
                this.errors.showAllMessages();
                this.roleSpinner.stop();
                return;
            }

            var url = App.Routes.WebApi.Identity.Users.Roles.del(this.id(), roleId);
            $.ajax({
                url: url,
                type: 'DELETE'
            })
                .done((response: string, textStatus: string, xhr: JQueryXHR): void => {
                    App.flasher.flash(response);
                    this.roleToRevoke(undefined);
                    this.pullRoleGrants()
                        .done((response: any[]): void => {
                            this.loadRoleGrants(response);
                            this._pullRoleOptions()
                                .done((response: any[]): void => {
                                    this._loadRoleOptions(response);
                                });
                        });
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.isRevokeError(true);
                    this.grantErrorText('An unexpected error occurred while trying to revoke access.');
                    this.roleSpinner.stop();
                });
        }

        dismissError(): void {
            this.isRevokeError(false);
            this.revokeErrorText(undefined);
            this.isGrantError(false);
            this.grantErrorText(undefined);
        }

        deleteUser(): void {

            var disableButtons = (disable: boolean = true): void => {
                if (disable) {
                    this.$confirmPurgeDialog.parents('.ui-dialog').find('button').attr('disabled', 'disabled');
                } else {
                    this.$confirmPurgeDialog.parents('.ui-dialog').find('button').removeAttr('disabled');
                }
            }

            this.$confirmPurgeDialog.dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: 'Yes, confirm delete',
                        click: (): void => {
                            // disable the button & show spinner
                            this.deleteSpinner.start();
                            disableButtons();
                            $.ajax({
                                //async: false,
                                type: "DELETE",
                                url: App.Routes.WebApi.Identity.Users.del(this.id()),
                            })
                                .done((): void => {
                                    this._owner._pullResults().done((response: any[]): void => {
                                        this._owner._loadResults(response);
                                        this.$confirmPurgeDialog.dialog('close');
                                    });
                                })
                                .fail((xhr: JQueryXHR): void => {
                                    App.Failures.message(xhr, 'while trying to delete this user', true);
                                })
                                .always((): void => {
                                    this.deleteSpinner.stop();
                                    disableButtons(false);
                                });
                        }

                    },
                    {
                        text: 'No, cancel delete',
                        click: (): void => {
                            this.$confirmPurgeDialog.dialog('close');
                        },
                        'data-css-link': true
                    },
                ],
            });
        }
    }

    export class RoleGrant {
        private _owner: SearchResult;
        id: KnockoutObservable<number>;
        $confirmPurgeDialog: JQuery;

        constructor(values: any, owner: SearchResult) {
            this._owner = owner;

            // map api data to observables
            ko.mapping.fromJS(values, {}, this);
        }

        revokeRole(): void {
            this.$confirmPurgeDialog.dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: 'Yes, confirm revoke',
                        click: (): void => {
                            this._owner.revokeRole(this.id());
                            this.$confirmPurgeDialog.dialog('close');
                        }
                    },
                    {
                        text: 'No, cancel revoke',
                        click: (): void => {
                            this.$confirmPurgeDialog.dialog('close');
                        },
                        'data-css-link': true
                    }
                ]
            });
        }
    }
}