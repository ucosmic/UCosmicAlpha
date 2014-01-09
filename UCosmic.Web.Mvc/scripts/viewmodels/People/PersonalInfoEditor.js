var People;
(function (People) {
    (function (ViewModels) {
        var PersonalInfoEditor = (function () {
            function PersonalInfoEditor(personId) {
                this.kendoHasLoaded = ko.observable(false);
                this.hasPhoto = ko.observable();
                this.photoUploadError = ko.observable();
                this.photoSrc = ko.observable(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                this.photoUploadSpinner = new App.Spinner({ delay: 400 });
                this.photoDeleteSpinner = new App.Spinner({ delay: 400 });
                this.isDisplayNameDerived = ko.observable();
                this.displayName = ko.observable();
                this._userDisplayName = '';
                this.personId = 0;
                this.salutation = ko.observable();
                this.firstName = ko.observable();
                this.middleName = ko.observable();
                this.lastName = ko.observable();
                this.suffix = ko.observable();
                this.defaultEstablishmentHasCampuses = ko.observable(false);
                this.gender = ko.observable();
                this.isActive = ko.observable(undefined);
                this.$photo = $("#photo");
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = $("#salutation");
                this.$nameSuffix = $("#suffix");
                this.$edit_personal_info_dialog = $("#edit_personal_info_dialog");
                this.isEditMode = ko.observable(false);
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.startInEdit = ko.observable(false);
                this.startTabName = ko.observable("Activities");
                this.personId2 = personId;
            }
            PersonalInfoEditor.prototype.load = function (startTab) {
                if (typeof startTab === "undefined") { startTab = ''; }
                var _this = this;
                if (this._loadPromise)
                    return this._loadPromise;
                this._loadPromise = $.Deferred();

                var viewModelPact = $.Deferred();
                $.get('/api/user/person').done(function (data, textStatus, jqXHR) {
                    viewModelPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

                viewModelPact.done(function (viewModel) {
                    ko.mapping.fromJS(viewModel, { ignore: "id" }, _this);
                    _this.personId = viewModel.id;
                    _this._originalValues = viewModel;
                    _this._setupValidation();
                    _this._setupKendoWidgets();
                    _this._setupDisplayNameDerivation();
                    _this._setupCardComputeds();
                    _this._loadPromise.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this._loadPromise.reject(xhr, textStatus, errorThrown);
                });

                return this._loadPromise;
            };

            PersonalInfoEditor.prototype.startEditing = function () {
                if (this.kendoHasLoaded()) {
                    this.isEditMode(true);
                    this.$edit_personal_info_dialog.data("kendoWindow").open().title("Personal Information");
                }
            };

            PersonalInfoEditor.prototype.stopEditing = function () {
                this.isEditMode(false);
            };

            PersonalInfoEditor.prototype.cancelEditing = function () {
                this.$edit_personal_info_dialog.data("kendoWindow").close();
                ko.mapping.fromJS(this._originalValues, {}, this);
                this.stopEditing();
            };

            PersonalInfoEditor.prototype.saveInfo = function () {
                var _this = this;
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                } else {
                    var apiModel = ko.mapping.toJS(this);

                    this.saveSpinner.start();

                    $.ajax({
                        url: '/api/user/person',
                        type: 'PUT',
                        data: apiModel
                    }).done(function (responseText, statusText, xhr) {
                        App.flasher.flash(responseText);
                        _this.stopEditing();
                        _this.$edit_personal_info_dialog.data("kendoWindow").close();
                    }).fail(function () {
                    }).always(function () {
                        _this.saveSpinner.stop();
                    });
                }
            };

            PersonalInfoEditor.prototype.startDeletingPhoto = function () {
                var _this = this;
                if (this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
                    this.$confirmPurgeDialog.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmPurgeDialog.dialog('close');
                                    _this._deletePhoto();
                                }
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmPurgeDialog.dialog('close');
                                    _this.photoDeleteSpinner.stop();
                                },
                                'data-css-link': true
                            }
                        ],
                        zIndex: 10004
                    });
                } else if (confirm('Are you sure you want to delete your profile photo?')) {
                    this._deletePhoto();
                }
            };

            PersonalInfoEditor.prototype._deletePhoto = function () {
                var _this = this;
                this.photoDeleteSpinner.start();
                this.photoUploadError(undefined);
                $.ajax({
                    url: App.Routes.WebApi.My.Photo.del(),
                    type: 'DELETE'
                }).always(function () {
                    _this.photoDeleteSpinner.stop();
                }).done(function (response, statusText, xhr) {
                    if (typeof response === 'string')
                        App.flasher.flash(response);
                    _this.hasPhoto(false);
                    _this.photoSrc(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                }).fail(function () {
                    _this.photoUploadError(PersonalInfoEditor.photoUploadUnexpectedErrorMessage);
                });
            };

            PersonalInfoEditor.prototype._setupValidation = function () {
                this.displayName.extend({
                    required: {
                        message: 'Display name is required.'
                    },
                    maxLength: 200
                });

                this.salutation.extend({
                    maxLength: 50
                });

                this.firstName.extend({
                    maxLength: 100
                });

                this.middleName.extend({
                    maxLength: 100
                });

                this.lastName.extend({
                    maxLength: 100
                });

                this.suffix.extend({
                    maxLength: 50
                });

                ko.validation.group(this);
            };

            PersonalInfoEditor.prototype._setupKendoWidgets = function () {
                var _this = this;
                this.$nameSalutation.kendoComboBox({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.People.Names.Salutations.get()
                            }
                        }
                    })
                });
                this.$nameSuffix.kendoComboBox({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.People.Names.Suffixes.get()
                            }
                        }
                    })
                });

                this.$photo.kendoUpload({
                    multiple: false,
                    showFileList: false,
                    localization: {
                        select: 'Choose a photo to upload...'
                    },
                    async: {
                        saveUrl: App.Routes.WebApi.My.Photo.post()
                    },
                    select: function (e) {
                        _this.photoUploadSpinner.start();
                        $.ajax({
                            type: 'POST',
                            async: false,
                            url: App.Routes.WebApi.My.Photo.validate(),
                            data: {
                                name: e.files[0].name,
                                length: e.files[0].size
                            }
                        }).done(function () {
                            _this.photoUploadError(undefined);
                        }).fail(function (xhr) {
                            _this.photoUploadError(xhr.responseText);
                            e.preventDefault();
                            _this.photoUploadSpinner.stop();
                        });
                    },
                    complete: function () {
                        _this.photoUploadSpinner.stop();
                    },
                    success: function (e) {
                        if (e.operation == 'upload') {
                            if (e.response && e.response.message) {
                                App.flasher.flash(e.response.message);
                            }
                            _this.hasPhoto(true);
                            _this.photoSrc(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                        }
                    },
                    error: function (e) {
                        if (e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000) {
                            _this.photoUploadError(e.XMLHttpRequest.responseText);
                        } else {
                            _this.photoUploadError(PersonalInfoEditor.photoUploadUnexpectedErrorMessage);
                        }
                    }
                });
                var self = this, kacSelect;
                this.$edit_personal_info_dialog.kendoWindow({
                    width: 550,
                    open: function () {
                        $("html, body").css("overflow", "hidden");
                        _this.isEditMode(true);
                    },
                    close: function () {
                        $("html, body").css("overflow", "");
                        _this.isEditMode(false);
                    },
                    maxHeight: 500,
                    visible: false,
                    draggable: false,
                    resizable: false
                });
                this.$edit_personal_info_dialog.parent().addClass("profile-kendo-window");

                var dialog = this.$edit_personal_info_dialog.data("kendoWindow");
                dialog.center();
                this.kendoHasLoaded(true);
            };

            PersonalInfoEditor.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this.displayName.subscribe(function (newValue) {
                    if (!_this.isDisplayNameDerived()) {
                        _this._userDisplayName = newValue;
                    }
                });

                ko.computed(function () {
                    if (_this.isDisplayNameDerived()) {
                        var mapSource = {
                            id: _this.personId,
                            isDisplayNameDerived: _this.isDisplayNameDerived(),
                            displayName: _this.displayName(),
                            salutation: _this.salutation(),
                            firstName: _this.firstName(),
                            middleName: _this.middleName(),
                            lastName: _this.lastName(),
                            suffix: _this.suffix()
                        };
                        var data = ko.mapping.toJS(mapSource);

                        $.ajax({
                            url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                            type: 'GET',
                            cache: false,
                            data: data
                        }).done(function (result) {
                            _this.displayName(result);
                        });
                    } else {
                        if (!_this._userDisplayName)
                            _this._userDisplayName = _this.displayName();

                        _this.displayName(_this._userDisplayName);
                    }
                }).extend({ throttle: 400 });
            };

            PersonalInfoEditor.prototype._setupCardComputeds = function () {
                var _this = this;
                this.genderText = ko.computed(function () {
                    var genderCode = _this.gender();
                    if (genderCode === 'M')
                        return 'Male';
                    if (genderCode === 'F')
                        return 'Female';
                    if (genderCode === 'P')
                        return 'Gender Undisclosed';
                    return 'Gender Unknown';
                });

                this.isActiveText = ko.computed(function () {
                    return _this.isActive() ? 'Active' : 'Inactive';
                });
            };

            PersonalInfoEditor.prototype.deleteProfile = function (data, event) {
                var me = this;
                $("#confirmProfileDeleteDialog").dialog({
                    width: 300,
                    height: 200,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    buttons: {
                        "Delete": function () {
                            $.ajax({
                                async: false,
                                type: "DELETE",
                                url: App.Routes.WebApi.People.del(me.personId),
                                success: function (data, statusText, jqXHR) {
                                    alert(jqXHR.statusText);
                                },
                                error: function (jqXHR, statusText, errorThrown) {
                                    alert(statusText);
                                },
                                complete: function (jqXHR, statusText) {
                                    $("#confirmProfileDeleteDialog").dialog("close");
                                }
                            });
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            };
            PersonalInfoEditor.photoUploadUnexpectedErrorMessage = 'UCosmic experienced an unexpected error managing your photo, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.';
            return PersonalInfoEditor;
        })();
        ViewModels.PersonalInfoEditor = PersonalInfoEditor;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
