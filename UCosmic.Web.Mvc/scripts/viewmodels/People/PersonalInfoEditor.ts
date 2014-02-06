module People.ViewModels {


    export class PersonalInfoEditor implements KnockoutValidationGroup {
        //#region Properties
        private _originalValues: ApiModels.IServerProfileApiModel;

        kendoHasLoaded = ko.observable<boolean>(false);
        hasPhoto = ko.observable<boolean>();
        photoUploadError = ko.observable<string>();
        static photoUploadUnexpectedErrorMessage = 'UCosmic experienced an unexpected error managing your photo, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.';
        photoSrc = ko.observable<string>(
            App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
        photoUploadSpinner = new App.Spinner({ delay: 400 });
        photoDeleteSpinner = new App.Spinner({ delay: 400 });

        isDisplayNameDerived = ko.observable<boolean>();
        displayName = ko.observable<string>();
        private _userDisplayName: string = '';

        campuses: any[];
        colleges: any[];
        departments: any[];

        personId: number = 0;
        personId2: number;

        salutation = ko.observable<string>();
        firstName = ko.observable<string>();
        middleName = ko.observable<string>();
        lastName = ko.observable<string>();
        suffix = ko.observable<string>();
        preferredTitle = ko.observable<string>()
        DefaultAffiliationEstablishmentId: number;

        defaultEstablishmentHasCampuses = ko.observable<boolean>(false);

        gender = ko.observable<string>();
        isActive = ko.observable<boolean>(undefined);
        genderText: () => string;
        isActiveText: () => string;

        $photo = $("#photo");
        $facultyRanks = ko.observable<JQuery>();
        $nameSalutation = $("#salutation");
        $nameSuffix = $("#suffix")
        $editSection: JQuery;
        $confirmPurgeDialog: JQuery;
        $edit_personal_info_dialog = $("#edit_personal_info_dialog");


        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        isEditMode = ko.observable<boolean>(false);
        saveSpinner = new App.Spinner({ delay: 200, });

        startInEdit = ko.observable<boolean>(false);
        startTabName = ko.observable<string>("Activities");
        
        //#endregion
        //#region Construction

        constructor(model) {
            this.personId2 = model.personId;
            this.model = model
            this.DefaultAffiliationEstablishmentId = model.DefaultAffiliationEstablishmentId;
        }
        model
        //#endregion
        //#region Personal Information

        private _loadPromise: JQueryDeferred<any>;
        load(startTab: string = ''): JQueryPromise<any> {
            if (this._loadPromise) return this._loadPromise;
            this._loadPromise = $.Deferred();

            var viewModelPact = $.Deferred();
            $.get('/api/user/person') // todo: button this up
                .done((data: ApiModels.IServerProfileApiModel, textStatus: string, jqXHR: JQueryXHR): void => {
                    viewModelPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

            // only process after both requests have been resolved
            viewModelPact.done((viewModel: ApiModels.IServerProfileApiModel): void => {
                ko.mapping.fromJS(viewModel, { ignore: "id" }, this); // populate the scalars
                this.personId = viewModel.id;
                    this.preferredTitle(this.model.JobTitles);
                this._originalValues = viewModel;
                this._setupValidation();
                this._setupKendoWidgets();
                this._setupDisplayNameDerivation();
                this._setupCardComputeds();
                this._loadPromise.resolve();
                //if (this.photoSrc != null) {
                //    this.hasPhoto(true);
                //}
            })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this._loadPromise.reject(xhr, textStatus, errorThrown);
                });

            return this._loadPromise;
        }

        startEditing(): void { // show the editor
            if (this.kendoHasLoaded()) {
                this.isEditMode(true);
                this.$edit_personal_info_dialog.data("kendoWindow").open().title("Personal Information");
            }
        }

        stopEditing(): void { // hide the editor
            this.isEditMode(false);
        }

        cancelEditing(): void {
            this.$edit_personal_info_dialog.data("kendoWindow").close();
            ko.mapping.fromJS(this._originalValues, {}, this); // restore original values
            this.preferredTitle(this.model.JobTitles);
            this.stopEditing();
        }

        saveInfo(): void {
            if (!this.isValid()) {
                this.errors.showAllMessages();
            }
            else {
                var apiModel = ko.mapping.toJS(this);

                this.saveSpinner.start();


                var affiliationPutModel: ApiModels.AffiliationPut = {
                    jobTitles: this.preferredTitle(),
                };
                Servers.PutAffiliation(affiliationPutModel, this.DefaultAffiliationEstablishmentId);


                $.ajax({
                    url: '/api/user/person', // TODO: button this up
                    type: 'PUT',
                    data: apiModel
                })
                    .done((responseText: string, statusText: string, xhr: JQueryXHR) => {
                        App.flasher.flash(responseText);
                        this.stopEditing();
                        this.$edit_personal_info_dialog.data("kendoWindow").close();
                    })
                    .fail(() => {
                        //alert('a PUT API call failed :(');
                    })
                    .always((): void => {
                        this.saveSpinner.stop();
                    });
            }
        }

        startDeletingPhoto(): void {
            if (this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: (): void => {
                                this.$confirmPurgeDialog.dialog('close');
                                this._deletePhoto();
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmPurgeDialog.dialog('close');
                                this.photoDeleteSpinner.stop();
                            },
                            'data-css-link': true
                        }
                    ],
                    zIndex: 10004
                });
            }
            else if (confirm('Are you sure you want to delete your profile photo?')) {
                this._deletePhoto();
            }
        }

        private _deletePhoto(): void {
            this.photoDeleteSpinner.start();
            this.photoUploadError(undefined);
            $.ajax({ // submit ajax DELETE request
                url: App.Routes.WebApi.My.Photo.del(),
                type: 'DELETE'
            })
                .always((): void => {
                    this.photoDeleteSpinner.stop();
                })
                .done((response: string, statusText: string, xhr: JQueryXHR): void => {
                    if (typeof response === 'string') App.flasher.flash(response);
                    this.hasPhoto(false);
                    this.photoSrc(App.Routes.WebApi.My.Photo
                        .get({ maxSide: 128, refresh: new Date().toUTCString() }));
                })
                .fail((): void => {
                    this.photoUploadError(PersonalInfoEditor.photoUploadUnexpectedErrorMessage);
                });
        }

        // client validation rules
        private _setupValidation(): void {
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
        }

        // comboboxes for salutation & suffix
        private _setupKendoWidgets(): void {

            this.$nameSalutation.kendoComboBox({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: App.Routes.WebApi.People.Names.Salutations.get()
                        }
                    }
                }),
                change: function (e) {
                    if (this.text() == "[None]") {
                        this.text("");   
                    }
                }
            });
            //this.$nameSalutation.data("kendoComboBox").select(0).value = "";
            this.$nameSuffix.kendoComboBox({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: App.Routes.WebApi.People.Names.Suffixes.get()
                        }
                    }
                }),
                change: function (e) {
                    if (this.text() == "[None]") {
                        this.text("");
                    }
                }
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
                select: (e: kendo.ui.UploadSelectEvent): void => {
                    this.photoUploadSpinner.start(); // display async wait message
                    $.ajax({
                        type: 'POST',
                        async: false,
                        url: App.Routes.WebApi.My.Photo.validate(),
                        data: {
                            name: e.files[0].name,
                            length: e.files[0].size
                        }
                    })
                        .done((): void => {
                            this.photoUploadError(undefined);
                        })
                        .fail((xhr: JQueryXHR): void => {
                            this.photoUploadError(xhr.responseText);
                            e.preventDefault();
                            this.photoUploadSpinner.stop(); // hide async wait message
                        });
                },
                complete: (): void => {
                    this.photoUploadSpinner.stop(); // hide async wait message
                },
                success: (e: any): void => {
                    // this event is triggered by both upload and remove requests
                    // ignore remove operations because they don't actually do anything
                    if (e.operation == 'upload') {
                        if (e.response && e.response.message) {
                            App.flasher.flash(e.response.message);
                        }
                        this.hasPhoto(true);
                        this.photoSrc(App.Routes.WebApi.My.Photo
                            .get({ maxSide: 128, refresh: new Date().toUTCString() }));
                    }
                },
                error: (e: kendo.ui.UploadErrorEvent): void => {
                    if (e.XMLHttpRequest.responseText &&
                        e.XMLHttpRequest.responseText.length < 1000) {
                        this.photoUploadError(e.XMLHttpRequest.responseText);
                    }
                    else {
                        this.photoUploadError(PersonalInfoEditor.photoUploadUnexpectedErrorMessage);
                    }
                }
            });
            var self = this,
                kacSelect;
            this.$edit_personal_info_dialog.kendoWindow({
                width: 810,
                open: () => {
                    $("html, body").css("overflow", "hidden");
                    this.isEditMode(true);
                },
                close: () => {
                    $("html, body").css("overflow", "");
                    this.isEditMode(false);
                },
                maxHeight: 648,
                visible: false,
                draggable: false,
                resizable: false
            });
            this.$edit_personal_info_dialog.parent().addClass("profile-kendo-window");

            var dialog = this.$edit_personal_info_dialog.data("kendoWindow");
            dialog.center();
            this.kendoHasLoaded(true);
        }

        // logic to derive display name
        private _setupDisplayNameDerivation(): void {
            this.displayName.subscribe((newValue: string): void => {
                if (!this.isDisplayNameDerived()) {
                    // stash user-entered display name only when it is not derived
                    this._userDisplayName = newValue;
                }
            });

            ko.computed((): void => {
                // generate display name if it has been API-initialized
                if (this.isDisplayNameDerived() /* && this._isInitialized */) {
                    var mapSource = {
                        id: this.personId,
                        isDisplayNameDerived: this.isDisplayNameDerived(),
                        displayName: this.displayName(),
                        salutation: this.salutation(),
                        firstName: this.firstName(),
                        middleName: this.middleName(),
                        lastName: this.lastName(),
                        suffix: this.suffix()
                    };
                    var data = ko.mapping.toJS(mapSource);

                    $.ajax({
                        url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                        type: 'GET',
                        cache: false,
                        data: data,
                    }).done((result: string): void => {
                            this.displayName(result);
                        });
                }
                else /* if (this._isInitialized) */ {
                    // prevent user display name from being blank
                    if (!this._userDisplayName)
                        this._userDisplayName = this.displayName();
                    // restore user-entered display name
                    this.displayName(this._userDisplayName);
                }
            }).extend({ throttle: 400 }); // wait for observables to stop changing
        }

        private _setupCardComputeds(): void {

            // text translation for gender codes
            this.genderText = ko.computed((): string => {
                var genderCode = this.gender();
                if (genderCode === 'M') return 'Male';
                if (genderCode === 'F') return 'Female';
                if (genderCode === 'P') return 'Gender Undisclosed';
                return 'Gender Unknown';
            });

            // friendly string for isActive boolean
            this.isActiveText = ko.computed((): string => {
                return this.isActive() ? 'Active' : 'Inactive';
            });
        }

        deleteProfile(data: any, event: any) {
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
        }

        //#endregion
    }

}