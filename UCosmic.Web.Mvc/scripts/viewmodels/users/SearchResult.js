var ViewModels;
(function (ViewModels) {
    var Users;
    (function (Users) {
        var RoleGrantValidator = (function () {
            function RoleGrantValidator() {
                this._ruleName = 'validRoleGrant';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            RoleGrantValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if (!vm.selectedRoleOption()) {
                    callback(true);
                    return;
                }
                if (!this._isAwaitingResponse) {
                    var route = App.Routes.WebApi.Identity.Users.Roles.validateGrant(vm.id(), vm.selectedRoleOption());
                    this._isAwaitingResponse = true;
                    $.post(route).always(function () {
                        _this._isAwaitingResponse = false;
                    }).done(function () {
                        callback(true);
                    }).fail(function (xhr) {
                        callback({ isValid: false, message: xhr.responseText });
                    });
                }
            };
            return RoleGrantValidator;
        })();
        new RoleGrantValidator();
        var RoleRevokeValidator = (function () {
            function RoleRevokeValidator() {
                this._ruleName = 'validRoleRevoke';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            RoleRevokeValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if (!vm.roleToRevoke()) {
                    callback(true);
                    return;
                }
                if (!this._isAwaitingResponse) {
                    var route = App.Routes.WebApi.Identity.Users.Roles.validateRevoke(vm.id(), vm.roleToRevoke());
                    this._isAwaitingResponse = true;
                    $.post(route).always(function () {
                        _this._isAwaitingResponse = false;
                    }).done(function () {
                        callback(true);
                    }).fail(function (xhr) {
                        callback({ isValid: false, message: xhr.responseText });
                    });
                }
            };
            return RoleRevokeValidator;
        })();
        new RoleRevokeValidator();
        var SearchResult = (function () {
            function SearchResult(values, owner) {
                var _this = this;
                this.roleOptions = ko.observableArray();
                this.roleOptionsCaption = ko.observable('[Loading...]');
                this.selectedRoleOption = ko.observable();
                this.roleToRevoke = ko.observable();
                this.$roleSelect = ko.observable();
                this.deleteSpinner = new App.Spinner();
                this.roleSpinner = new App.Spinner({ delay: 0, isVisible: true });
                this.isRevokeError = ko.observable();
                this.revokeErrorText = ko.observable();
                this.isGrantError = ko.observable();
                this.grantErrorText = ko.observable();
                this.$menu = ko.observable();
                this.isEditingRoles = ko.observable(false);
                this._owner = owner;
                var userMapping = {
                    roles: {
                        create: function (options) {
                            return new ViewModels.Users.RoleGrant(options.data, _this);
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
            SearchResult.prototype._setupPhotoComputeds = function () {
                var _this = this;
                this.photoSrc = ko.computed(function () {
                    return App.Routes.WebApi.People.Photo.get(_this.personId(), { maxSide: 100 });
                });
            };
            SearchResult.prototype._setupNamingComputeds = function () {
                var _this = this;
                this.hasUniqueDisplayName = ko.computed(function () {
                    return _this.name() !== _this.personDisplayName();
                });
            };
            SearchResult.prototype._setupRoleGrantComputeds = function () {
                var _this = this;
                this.hasGrants = ko.computed(function () {
                    return _this.roles().length > 0;
                });
                this.hasNoGrants = ko.computed(function () {
                    return !_this.hasGrants();
                });
                this.isRoleGrantDisabled = ko.computed(function () {
                    return _this.roleSpinner.isVisible() || !_this.selectedRoleOption();
                });
                this.selectedRoleOption.subscribe(function (newValue) {
                    if (newValue && typeof (newValue) === 'string') {
                        _this.selectedRoleOption(parseInt(newValue));
                    }
                });
            };
            SearchResult.prototype._setupMenuSubscription = function () {
                this.$menu.subscribe(function (newValue) {
                    if (newValue && newValue.length) {
                        newValue.kendoMenu();
                    }
                });
            };
            SearchResult.prototype._setupValidation = function () {
                var _this = this;
                this.selectedRoleOption.extend({
                    validRoleGrant: this
                });
                this.roleToRevoke.extend({
                    validRoleRevoke: this
                });
                this.isValidating = ko.computed(function () {
                    return _this.selectedRoleOption.isValidating() || _this.roleToRevoke.isValidating();
                });
                this.selectedRoleOption.subscribe(function (newValue) {
                    _this.roleToRevoke(undefined);
                });
                ko.validation.group(this);
            };
            SearchResult.prototype._pullRoleOptions = function () {
                var _this = this;
                this.selectedRoleOption(undefined);
                this.roleSpinner.start();
                var deferred = $.Deferred();
                var queryParameters = {
                    pageSize: Math.pow(2, 32) / 2 - 1,
                    orderBy: 'name-asc'
                };
                $.get(App.Routes.WebApi.Identity.Roles.get(), queryParameters).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.roleSpinner.stop();
                });
                return deferred;
            };
            SearchResult.prototype._loadRoleOptions = function (results) {
                ko.mapping.fromJS(results.items, {}, this.roleOptions);
                this.roleOptionsCaption('[Select access to grant...]');
                this._syncRoleOptions();
                if (this.$roleSelect && this.$roleSelect().length) {
                    var roleOptions = this.roleOptions();
                    var roleData = [];
                    roleData.push({
                        name: this.roleOptionsCaption()
                    });
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
                        template: '#if (data.id) {# <div><strong>${ data.name }</strong></div>\r\n' + '#} else {#<div>${ data.name }</div>\r\n #}#' + '#if (data.description) {# <div><small>${ data.description }</small></div> #}#'
                    });
                }
            };
            SearchResult.prototype._syncRoleOptions = function () {
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
            };
            SearchResult.prototype.pullRoleGrants = function () {
                var _this = this;
                this.roleSpinner.start();
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Identity.Users.Roles.get(this.id())).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.roleSpinner.stop();
                });
                return deferred;
            };
            SearchResult.prototype.loadRoleGrants = function (results) {
                var _this = this;
                var grantMapping = {
                    create: function (options) {
                        return new ViewModels.Users.RoleGrant(options.data, _this);
                    }
                };
                ko.mapping.fromJS(results, grantMapping, this.roles);
            };
            SearchResult.prototype.impersonate = function () {
                var form = this._owner.impersonateForm;
                if (form) {
                    this._owner.impersonateUserName(this.name());
                    $(form).submit();
                }
            };
            SearchResult.prototype.showRoleEditor = function () {
                var _this = this;
                this.isEditingRoles(true);
                this._pullRoleOptions().done(function (response) {
                    _this._loadRoleOptions(response);
                });
            };
            SearchResult.prototype.hideRoleEditor = function () {
                this.roleToRevoke(undefined);
                this.isEditingRoles(false);
            };
            SearchResult.prototype.grantRole = function () {
                var _this = this;
                this.roleSpinner.start();
                this.roleToRevoke(undefined);
                if (this.isValidating()) {
                    setTimeout(function () {
                        _this.grantRole();
                    }, 50);
                    return;
                }
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                    this.roleSpinner.stop();
                    return;
                }
                var url = App.Routes.WebApi.Identity.Users.Roles.put(this.id(), this.selectedRoleOption());
                $.ajax({
                    url: url,
                    type: 'PUT'
                }).done(function (response, textStatus, xhr) {
                    App.flasher.flash(response);
                    _this.roleOptions.remove(function (item) {
                        return item.id() == _this.selectedRoleOption();
                    });
                    _this.pullRoleGrants().done(function (response) {
                        _this.loadRoleGrants(response);
                        _this._pullRoleOptions().done(function (response) {
                            _this._loadRoleOptions(response);
                        });
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this.isGrantError(true);
                    _this.grantErrorText('An unexpected error occurred while trying to grant access.');
                    _this.roleSpinner.stop();
                });
            };
            SearchResult.prototype.revokeRole = function (roleId) {
                var _this = this;
                this.roleSpinner.start();
                this.roleToRevoke(roleId);
                if (this.isValidating()) {
                    setTimeout(function () {
                        _this.revokeRole(roleId);
                    }, 50);
                    return;
                }
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                    this.roleSpinner.stop();
                    return;
                }
                var url = App.Routes.WebApi.Identity.Users.Roles.del(this.id(), roleId);
                $.ajax({
                    url: url,
                    type: 'DELETE'
                }).done(function (response, textStatus, xhr) {
                    App.flasher.flash(response);
                    _this.roleToRevoke(undefined);
                    _this.pullRoleGrants().done(function (response) {
                        _this.loadRoleGrants(response);
                        _this._pullRoleOptions().done(function (response) {
                            _this._loadRoleOptions(response);
                        });
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this.isRevokeError(true);
                    _this.grantErrorText('An unexpected error occurred while trying to revoke access.');
                    _this.roleSpinner.stop();
                });
            };
            SearchResult.prototype.dismissError = function () {
                this.isRevokeError(false);
                this.revokeErrorText(undefined);
                this.isGrantError(false);
                this.grantErrorText(undefined);
            };
            SearchResult.prototype.deleteUser = function () {
                var _this = this;
                var disableButtons = function (disable) {
                    if (disable === void 0) { disable = true; }
                    if (disable) {
                        _this.$confirmPurgeDialog.parents('.ui-dialog').find('button').attr('disabled', 'disabled');
                    }
                    else {
                        _this.$confirmPurgeDialog.parents('.ui-dialog').find('button').removeAttr('disabled');
                    }
                };
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                _this.deleteSpinner.start();
                                disableButtons();
                                $.ajax({
                                    type: "DELETE",
                                    url: App.Routes.WebApi.Identity.Users.del(_this.id()),
                                }).done(function () {
                                    _this._owner._pullResults().done(function (response) {
                                        _this._owner._loadResults(response);
                                        _this.$confirmPurgeDialog.dialog('close');
                                    });
                                }).fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to delete this user', true);
                                }).always(function () {
                                    _this.deleteSpinner.stop();
                                    disableButtons(false);
                                });
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                            },
                            'data-css-link': true
                        },
                    ],
                });
            };
            return SearchResult;
        })();
        Users.SearchResult = SearchResult;
        var RoleGrant = (function () {
            function RoleGrant(values, owner) {
                this._owner = owner;
                ko.mapping.fromJS(values, {}, this);
            }
            RoleGrant.prototype.revokeRole = function () {
                var _this = this;
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm revoke',
                            click: function () {
                                _this._owner.revokeRole(_this.id());
                                _this.$confirmPurgeDialog.dialog('close');
                            }
                        },
                        {
                            text: 'No, cancel revoke',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };
            return RoleGrant;
        })();
        Users.RoleGrant = RoleGrant;
    })(Users = ViewModels.Users || (ViewModels.Users = {}));
})(ViewModels || (ViewModels = {}));
