/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Flasher.ts" />
/// <reference path="../employees/ServerApiModel.d.ts" />

module ViewModels.My {

    export class Profile implements KnockoutValidationGroup {

        private _isInitialized: bool = false;

        photoSrc: KnockoutObservableString = ko.observable(
            App.Routes.WebApi.My.Profile.Photo.get(128));

        isDisplayNameDerived: KnockoutObservableBool = ko.observable();
        displayName: KnockoutObservableString = ko.observable();
        private _userDisplayName: string = '';

        salutation: KnockoutObservableString = ko.observable();
        firstName: KnockoutObservableString = ko.observable();
        middleName: KnockoutObservableString = ko.observable();
        lastName: KnockoutObservableString = ko.observable();
        suffix: KnockoutObservableString = ko.observable();

        isFacultyRankEditable: () => bool;
        isFacultyRankVisible: () => bool;
        facultyRankText: () => string;
        facultyRanks: KnockoutObservableFacultyRankModelArray = ko.observableArray();
        facultyRankId: KnockoutObservableNumber = ko.observable();
        jobTitles: KnockoutObservableString = ko.observable();
        administrativeAppointments: KnockoutObservableString = ko.observable();

        gender: KnockoutObservableString = ko.observable();
        isActive: KnockoutObservableBool = ko.observable();
        genderText: () => string;
        isActiveText: () => string;

        $photo: KnockoutObservableJQuery = ko.observable();
        $facultyRanks: KnockoutObservableJQuery = ko.observable();
        $nameSalutation: KnockoutObservableJQuery = ko.observable();
        $nameSuffix: KnockoutObservableJQuery = ko.observable();
        $editSection: JQuery;

        isValid: () => bool;
        errors: KnockoutValidationErrors;
        editMode: KnockoutObservableBool = ko.observable(false);

        constructor() {
            this._initialize();

            this._setupValidation();
            this._setupKendoWidgets();
            this._setupDisplayNameDerivation();
            this._setupCardComputeds();
        }

        private _initialize() {

            // start both requests at the same time
            var facultyRanksPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get())
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    facultyRanksPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
                });

            var viewModelPact = $.Deferred();
            $.get(App.Routes.WebApi.My.Profile.get())
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    viewModelPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

            // only process after both requests have been resolved
            $.when(facultyRanksPact, viewModelPact).then(

                // all requests succeeded
                (facultyRanks: any, viewModel: any): void => {

                    this.facultyRanks(facultyRanks); // populate the faculty ranks menu
                    ko.mapping.fromJS(viewModel, { }, this); // populate the scalars

                    $(this).trigger('ready'); // ready to apply bindings
                    this._isInitialized = true; // bindings have been applied
                    this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                },

                // one of the responses failed (never called more than once, even on multifailures)
                (xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    //alert('a GET API call failed :(');
                });
        }

        startEditing(): void {
            this.editMode(true);
            if (this.$editSection.length) {
                this.$editSection.slideDown();
            }
        }

        saveInfo(formElement: HTMLFormElement): void {

            if (!this.isValid()) {
                this.errors.showAllMessages();
            }
            else {
                var apiModel = ko.mapping.toJS(this);

                $.ajax({
                    url: App.Routes.WebApi.My.Profile.put(),
                    type: 'PUT',
                    data: apiModel
                })
                .done((responseText: string, statusText: string, xhr: JQueryXHR) => {
                    App.flasher.flash(responseText);
                    if (this.$editSection.length) {
                        this.$editSection.slideUp();
                    }
                    this.editMode(false);
                })
                .fail(() => {
                    //alert('a PUT API call failed :(');
                });
            }
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

            this.jobTitles.extend({
                maxLength: 500
            });

            this.administrativeAppointments.extend({
                maxLength: 500
            });

            ko.validation.group(this);
        }

        // comboboxes for salutation & suffix
        private _setupKendoWidgets(): void {
            // when the $element observables are bound, they will have length
            // use this opportinity to apply kendo extensions
            this.$nameSalutation.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length)
                    newValue.kendoComboBox({
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
            });
            this.$nameSuffix.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length)
                    newValue.kendoComboBox({
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
            });

            this.$photo.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length) {
                    newValue.kendoUpload({
                        multiple: false,
                        showFileList: false,
                        localization: {
                            select: 'Choose a photo to upload...'
                        },
                        async: {
                            saveUrl: App.Routes.WebApi.My.Profile.Photo.post(),
                            removeUrl: App.Routes.WebApi.My.Profile.Photo.kendoRemove()
                            //removeVerb: 'DELETE'
                            //batch: true
                        },
                        success: (e: any): void => {
                            //alert('there was success');
                            this.photoSrc(App.Routes.WebApi.My.Profile.Photo.get(128,
                                null, true));
                        },
                        error: (e: any): void => {
                            alert('there was an error');
                        }
                    });
                }
            });
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
                if (this.isDisplayNameDerived() && this._isInitialized) {
                    var data = ko.mapping.toJS(this);
                    $.ajax({
                        url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                        type: 'GET',
                        cache: false,
                        data: data
                    }).done((result: string): void => {
                        this.displayName(result);
                    });
                }
                else if (this._isInitialized) {
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

            // do not display faculty rank editor for tenants that do not have
            // employee module settings or faculty rank options
            this.isFacultyRankEditable = ko.computed((): bool => {
                return this.facultyRanks() && this.facultyRanks().length > 0;
            });

            // compute the selected faculty rank text
            this.facultyRankText = ko.computed((): string => {
                var id = this.facultyRankId();
                for (var i = 0; i < this.facultyRanks().length; i++) {
                    var facultyRank: Employees.IServerFacultyRankApiModel = this.facultyRanks()[i];
                    if (id === facultyRank.id) {
                        return facultyRank.rank;
                    }
                }
                return undefined;
            });

            // do not display faculty rank on the form card when it is not set
            // or when it is set to other
            this.isFacultyRankVisible = ko.computed((): bool => {
                return this.isFacultyRankEditable() &&
                    this.facultyRankId() &&
                    this.facultyRankText() &&
                    this.facultyRankText().toLowerCase() !== 'other';
            });

        }
    }

}

