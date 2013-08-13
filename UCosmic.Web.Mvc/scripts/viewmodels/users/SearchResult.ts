/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../PagedSearch.ts" />
/// <reference path="../Flasher.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="Search.ts" />

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
        personDisplayName: KnockoutObservable<string>;
        roles: KnockoutObservableArray<any>;
        roleOptions: KnockoutObservableArray<any> = ko.observableArray();
        roleOptionsCaption: KnockoutObservable<string> = ko.observable('[Loading...]');
        selectedRoleOption: KnockoutObservable<number> = ko.observable();
        roleToRevoke: KnockoutObservable<number> = ko.observable();
        $roleSelect: KnockoutObservable<JQuery> = ko.observable();
        isRoleGrantDisabled: KnockoutComputed<boolean>;
        roleSpinner = new App.Spinner({ delay: 0, isVisible: true });
        isRevokeError: KnockoutObservable<boolean> = ko.observable();
        revokeErrorText: KnockoutObservable<string> = ko.observable();
        isGrantError: KnockoutObservable<boolean> = ko.observable();
        grantErrorText: KnockoutObservable<string> = ko.observable();

        $menu: KnockoutObservable<JQuery> = ko.observable();
        isEditingRoles: KnockoutObservable<boolean> = ko.observable(false);

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

        private _pullRoleOptions(): JQueryDeferred {
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

        pullRoleGrants(): JQueryDeferred {
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
                this._owner.impersonateUserName(this.name());
                $(form).submit();
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
            var me = this;
            $( "#confirmUserDeleteDialog" ).dialog( {
                width: 300,
                height: 200,
                modal: true,
                resizable: false,
                draggable: false,
                buttons: {
                    "Delete": function () {
                        $.ajax( {
                            async: false,
                            type: "DELETE",
                            url: App.Routes.WebApi.Identity.Users.del( me.id() ),
                            success: function ( data: any, statusText: string, jqXHR: JQueryXHR ) {
                                if ( statusText !== "success" ) {
                                    alert( jqXHR.statusText );
                                }
                            },
                            error: function ( jqXHR, statusText, errorThrown ) {                               
                                alert( statusText );
                            },
                            complete:  function( jqXHR, statusText ) {
                                $( "#confirmUserDeleteDialog" ).dialog( "close" );
                                window.location.reload();
                            }
                        } );
                    },

                    "Cancel": function () {
                        $( "#confirmUserDeleteDialog" ).dialog( "close" );
                    }
                }
            } );
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