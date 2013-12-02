/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../app/Flasher.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="../employees/ServerApiModel.d.ts" />
/// <reference path="../activities/Activities.ts" />
/// <reference path="../geographicExpertises/GeographicExpertises.ts" />
/// <reference path="../languageExpertises/LanguageExpertises.ts" />
/// <reference path="../degrees/Degrees.ts" />
/// <reference path="../internationalAffiliations/InternationalAffiliations.ts" />

/// <reference path="../../app/Routes.d.ts" />
/// <reference path="../../app/DataCacher.ts" />
/// <reference path="../../app/Models.d.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
/// <reference path="../establishments/Server.ts" />
/// <reference path="../employees/Models.d.ts" />
/// <reference path="../employees/Server.ts" />
/// <reference path="../people/Server.ts" />
/// <reference path="../people/Models.d.ts" />
/// <reference path="../../app/FormSelect.ts" />

import RootViewModels = ViewModels;

module People.ViewModels {

    export class AffiliatedEstablishmentEditor {

        select = new App.FormSelect<number>({ kendoOptions: {}, });

        constructor(public owner: Affiliation,
            options: Establishments.ApiModels.ScalarEstablishment[],
            establishment?: Establishments.ApiModels.ScalarEstablishment) {

            var caption = this._getOptionsCaption(options);
            var selectOptions = this._getSelectOptions(options);

            this.select.caption(caption);
            this.select.options(selectOptions.slice(0));
            this.select.value(establishment ? establishment.id : undefined);

            this.select.value.subscribe((newValue: number): void => {
                this._onSelectedValueChanged(newValue);
            });
        }

        private _getOptionsCaption(options: Establishments.ApiModels.ScalarEstablishment[]): string {
            // the option label for the first dropdown is different because it is required
            // this is the first editor all options' parentId's are equal to default establishment
            var isFirst = Enumerable.From(options)
                .All((x: Establishments.ApiModels.ScalarEstablishment): boolean => {
                    return x.parentId == this.owner.owner.defaultAffiliation.establishmentId
                });
            var caption = isFirst ? '[Select main affiliation]' : '[Select sub-affiliation or leave empty]';
            return caption;
        }

        private _getSelectOptions(options: Establishments.ApiModels.ScalarEstablishment[]): App.ApiModels.SelectOption<number>[] {
            // convert options from array of establishments to text/value pair array
            var selectOptions: App.ApiModels.SelectOption<number>[] = Enumerable.From(options)
                .Select(function (x: Establishments.ApiModels.ScalarEstablishment): App.ApiModels.SelectOption<number> {
                    return {
                        text: x.contextName || x.officialName,
                        value: x.id,
                    };
                })
                .ToArray();
            return selectOptions;
        }

        private _onSelectedValueChanged(newValue: number): void {
            var siblingEditors = this.owner.establishmentEditors();
            if (newValue) {
                this.owner.bindEstablishmentEditors(newValue);
            }
            else {
                // need to find most granular that is still selected
                var index = Enumerable.From(siblingEditors).IndexOf(this);
                var ancestors = siblingEditors.slice(0, index).reverse();
                var ancestor: AffiliatedEstablishmentEditor = Enumerable.From(ancestors)
                    .FirstOrDefault(undefined, function (x: AffiliatedEstablishmentEditor): boolean {
                        return x.select.value() && x.select.value() > 0;
                    });
                if (ancestor) {
                    this.owner.bindEstablishmentEditors(ancestor.select.value());
                }
                else {
                    this.owner.bindEstablishmentEditors(this.owner.owner.defaultAffiliation.establishmentId);
                }
            }
        }
    }

    export class Affiliation implements KoModels.Affiliation, KnockoutValidationGroup {
        //#region Observable Interface Implementation

        affiliationId: KnockoutObservable<number> = ko.observable();
        personId: KnockoutObservable<number> = ko.observable();
        establishmentId: KnockoutObservable<number> = ko.observable();
        isDefault: KnockoutObservable<boolean> = ko.observable();
        jobTitles: KnockoutObservable<string> = ko.observable();
        facultyRank: KnockoutObservable<Employees.KoModels.EmployeeSettingsFacultyRank> = ko.observable();
        establishments: KnockoutObservableArray<KoModels.AffiliatedEstablishment> = ko.observableArray();

        //#endregion
        //#region Construction

        owner: Profile;
        data: ApiModels.Affiliation;

        constructor(owner: Profile, data: ApiModels.Affiliation);
        constructor(owner: Profile, personId: number);
        constructor(owner: Profile, dataOrPersonId: any) {
            this.owner = owner;
            if (isNaN(dataOrPersonId)) {
                this.data = dataOrPersonId;
            }
            if (this.data) { // map the api model values into observable properties
                ko.mapping.fromJS(this.data, {}, this);
                this.isEditing = ko.observable(false);
            }
            else {
                this.personId(dataOrPersonId);
                this.isEditing = ko.observable(true);
            }

            // wait for faculty rank data and then bind to select options
            setTimeout((): void => {
                this._loadFacultyRankOptions();
            }, 0);
            this._initValidation();
        }

        //#endregion
        //#region ReadOnly / Edit Mode

        isEditing: KnockoutObservable<boolean>; // mode for tracking whether to display form or read-only view to user

        edit(): void {
            this.bindEstablishmentEditors(this.establishmentId());
            this.isEditing(true);
        }

        cancel(): void {
            var affiliationId = this.affiliationId();
            if (!affiliationId) {
                this.owner.editableAffiliations.remove(this);
                return;
            }

            ko.mapping.fromJS(this.data, {}, this); // restore observable properties
            // restore faculty rank to its previous value
            var selectedFacultyRank = this.facultyRank();
            if (selectedFacultyRank)
                this.facultyRankSelect.value(selectedFacultyRank.facultyRankId());
            this.isEditing(false);
        }

        //#endregion
        //#region Validation

        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        hideValidationMessages: KnockoutObservable<boolean> = ko.observable(true);

        private _initValidation(): void {

            // job titles cannot exceed 500 characters
            this.jobTitles.extend({
                maxLength: {
                    message: 'Position Title(s) cannot contain more than 500 characters.',
                    params: 500,
                },
            });

            // the first establishment editor cannot be empty
            this.firstEstablishmentId.extend({
                required: {
                    message: 'At least one main affiliation is required.',
                },
            });

            // cannot have duplicate affiliations
            this.lastEstablishmentId.extend({
                validation: {
                    validator: (value: number) => {
                        if (value < 1) return true;
                        var duplicateSiblingAffiliation = Enumerable.From(this.owner.editableAffiliations())
                            .FirstOrDefault(undefined, (x: Affiliation): boolean => {
                                return x !== this && x.establishmentId() == value;
                            });
                        return typeof duplicateSiblingAffiliation === 'undefined';
                    },
                    message: 'You already have another affiliation with this organizational unit.',
                },
            });

            ko.validation.group(this);
        }

        //#endregion
        //#region Data Mutation

        saveSpinner = new App.Spinner({ delay: 200, });
        purgeSpinner = new App.Spinner();

        save(): void {
            if (!this.isValid()) {
                this.hideValidationMessages(false);
                this.errors.showAllMessages();
                return;
            }

            this.hideValidationMessages(true);
            var data: ApiModels.AffiliationPut = {
                establishmentId: this.lastEstablishmentId(),
                facultyRankId: this.facultyRankSelect.value(),
                jobTitles: this.jobTitles(),
            };
            this.saveSpinner.start();
            Servers.PutAffiliation(data, this.establishmentId() || data.establishmentId)
                .done((): void => {
                    this.owner.affiliationData.reload();
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to save your affiliation', true);
                    this.saveSpinner.stop();
                })
            ;
        }

        purge(): void {
            this.purgeSpinner.start();
            if (this.owner.$confirmDeleteAffiliation && this.owner.$confirmDeleteAffiliation.length) {
                this.owner.$confirmDeleteAffiliation.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: (): void => {
                                this.owner.$confirmDeleteAffiliation.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge();
                            },
                            'data-css-link': true,
                            'data-confirm-delete-link': true,
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.owner.$confirmDeleteAffiliation.dialog('close');
                            },
                            'data-css-link': true,
                        }
                    ],
                    close: (): void => {
                        this.purgeSpinner.stop();
                    },
                });
            }
            else {
                if (confirm('Are you sure you want to delete this affiliation?')) {
                    this._purge();
                }
                else {
                    this.purgeSpinner.stop();
                }
            }
        }

        private _purge(): void {
            Servers.DeleteAffiliation(this.establishmentId())
                .done((): void => {
                    this.owner.affiliationData.reload();
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to delete your affiliation', true);
                    this.purgeSpinner.stop();
                })
            ;
        }

        //#endregion
        //#region Cascading Establishments

        establishmentEditors: KnockoutObservableArray<AffiliatedEstablishmentEditor> = ko.observableArray(); // department drop downs

        firstEstablishmentId = ko.computed((): number => {
            var establishmentEditors = this.establishmentEditors();
            if (establishmentEditors.length) {
                var firstEstablishmentEditor = establishmentEditors[0];
                var value = firstEstablishmentEditor.select.value();
                return value;
            }
            return -1;
        });

        lastEstablishmentId = ko.computed((): number => {
            var establishmentEditors = this.establishmentEditors();
            if (establishmentEditors.length) {
                var lastEstablishmentEditor = Enumerable.From(establishmentEditors)
                    .LastOrDefault(undefined, function (x: AffiliatedEstablishmentEditor): boolean {
                        return x.select.value() && x.select.value() > 0;
                    });
                if (lastEstablishmentEditor) return lastEstablishmentEditor.select.value();
            }
            return -1;
        });

        bindEstablishmentEditors(establishmentId: number): void {
            // can't bind the editors until the default affiliation's offspring are loaded
            this.owner.establishmentData.ready()
                .done((offspring: Establishments.ApiModels.ScalarEstablishment[]): void => {
                    this._bindEstablishmentEditors(establishmentId, offspring);
                });
        }

        private _bindEstablishmentEditors(establishmentId: number, offspring: Establishments.ApiModels.ScalarEstablishment[]): void {
            this.establishmentEditors([]); // clear existing editors

            // the establishmentId passed as an argument represents the most granular establishment
            // create it first, then walk up using parentId's until the default establishment is reached
            var currentEstablishmentId = establishmentId;
            while (currentEstablishmentId && currentEstablishmentId != this.owner.defaultAffiliation.establishmentId) {
                var currentEstablishment = this._bindEstablishmentEditor(currentEstablishmentId, offspring);
                currentEstablishmentId = currentEstablishment.parentId;
            }

            // the above loop only renders from the most granular selected establishment and its ancestors
            // if there are more granular unselected options, need to render them as last binding
            this._bindEstablishmentEditor(establishmentId, offspring, true);
        }

        private _bindEstablishmentEditor(establishmentId: number, offspring: Establishments.ApiModels.ScalarEstablishment[], isLast: boolean = false): Establishments.ApiModels.ScalarEstablishment {
            // first try to find the establishment api model
            var establishment = this._getEstablishmentById(establishmentId, offspring);

            // when establishment exists and this IS NOT the last binding, get establishment's siblings
            // when establishment exists and this IS the last binding, get establishment's children
            // when establishment is undefined, get default affiliation establishment's children
            var options = this._getEstablishmentEditorOptions(establishment
                ? !isLast ? establishment.parentId : establishment.id
                : this.owner.defaultAffiliation.establishmentId,
                offspring);

            // only add an editor when there will be options
            if (options.length) {
                // when this is the last binding, do not pass the establishment
                var editor = new AffiliatedEstablishmentEditor(this, options,
                    !isLast ? establishment : undefined);

                // when this is not the last binding, insert editor as first element
                if (!isLast) {
                    this.establishmentEditors.unshift(editor);
                }
                // otherwise, insert editor as last element
                else {
                    this.establishmentEditors.push(editor);
                }
                this.owner.load().done((): void => {
                    editor.select.applyKendo();
                });
            }
            return establishment;
        }

        private _getEstablishmentById(establishmentId: number, offspring: Establishments.ApiModels.ScalarEstablishment[]): Establishments.ApiModels.ScalarEstablishment {
            // will be undefined when establishmentId == defaultAffiliation.establishmentId
            var establishment = Enumerable.From(offspring)
                .SingleOrDefault(undefined, (x: Establishments.ApiModels.ScalarEstablishment): boolean => {
                    return x.id == establishmentId;
                });
            return establishment;
        }

        private _getEstablishmentEditorOptions(parentId: number, offspring: Establishments.ApiModels.ScalarEstablishment[]): Establishments.ApiModels.ScalarEstablishment[] {
            var options = Enumerable.From(offspring)
                .Where(function (x: Establishments.ApiModels.ScalarEstablishment): boolean {
                    return x.parentId == parentId; // filter by parent id
                })
                .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                    return x.rank; // sort by rank, then by name
                })
                .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
                    return x.contextName || x.officialName;
                })
                .ToArray();
            return options;
        }

        //#endregion
        //#region Faculty Rank DropDown

        facultyRankSelect = new App.FormSelect<number>({ kendoOptions: {}, });
        hasFacultyRanks: KnockoutObservable<boolean> = ko.observable(false);

        private _loadFacultyRankOptions(): void {
            // the employee module settings data needs to be loaded
            // so that we can get the faculty rank options (if there are any)
            this.owner.employeeSettingsData.ready()
                .done((settings: Employees.ApiModels.EmployeeSettings): void => {
                    this._bindFacultyRankOptions(settings);
                });
        }

        private _bindFacultyRankOptions(settings: Employees.ApiModels.EmployeeSettings): void {
            // settings can be null/undefined, and may not have faculty ranks
            if (settings && settings.facultyRanks && settings.facultyRanks.length) {
                this.hasFacultyRanks(true);
                var options = this._getFacultyRankSelectOptions(settings);
                this.facultyRankSelect.caption('[None]'); // must be set before options
                this.facultyRankSelect.options(options);
                var facultyRank = this.facultyRank(); // value may not be defined
                if (facultyRank)
                    this.facultyRankSelect.value(facultyRank.facultyRankId());
                this.owner.load().done((): void => {
                    this.facultyRankSelect.applyKendo();
                });
            }
        }

        private _getFacultyRankSelectOptions(settings: Employees.ApiModels.EmployeeSettings): App.ApiModels.SelectOption<number>[] {
            // sort by rank && convert to text/value pair for select options binding
            var options: App.ApiModels.SelectOption<number>[] = Enumerable.From(settings.facultyRanks)
                .OrderBy(function (x: Employees.ApiModels.EmployeeSettingsFacultyRank): number {
                    return x.rank;
                })
                .Select(function (x: Employees.ApiModels.EmployeeSettingsFacultyRank): App.ApiModels.SelectOption<number> {
                    var selectOption: App.ApiModels.SelectOption<number> = {
                        text: x.text,
                        value: x.facultyRankId,
                    };
                    return selectOption;
                })
                .ToArray();
            return options;
        }

        //#endregion
        //#region Postition Title Text

        jobTitlesHtml = ko.computed((): string => {
            return this._computeJobTitles();
        });

        private _computeJobTitles(): string {
            var jobTitles = this.jobTitles();
            jobTitles = jobTitles || '';
            jobTitles = jobTitles.replace(/\n/g, '<br />');
            return jobTitles;
        }

        //#endregion
    }

    export class Profile implements KnockoutValidationGroup {
        //#region Properties

        private _sammy: Sammy.Application = Sammy();
        //private _isInitialized: boolean = false;
        private _originalValues: ApiModels.IServerProfileApiModel;
        private _activitiesViewModel: Activities.ViewModels.ActivityList = null;
        private _geographicExpertisesViewModel: RootViewModels.GeographicExpertises.GeographicExpertiseList = null;
        private _languageExpertisesViewModel: RootViewModels.LanguageExpertises.LanguageExpertiseList = null;
        private _degreesViewModel: RootViewModels.Degrees.DegreeList = null;
        private _internationalAffiliationsViewModel: RootViewModels.InternationalAffiliations.InternationalAffiliationList = null;

        hasPhoto: KnockoutObservable<boolean> = ko.observable();
        photoUploadError: KnockoutObservable<string> = ko.observable();
        static photoUploadUnexpectedErrorMessage = 'UCosmic experienced an unexpected error managing your photo, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.';
        photoSrc: KnockoutObservable<string> = ko.observable(
            App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
        photoUploadSpinner = new App.Spinner({ delay: 400 });
        photoDeleteSpinner = new App.Spinner({ delay: 400 });

        isDisplayNameDerived: KnockoutObservable<boolean> = ko.observable();
        displayName: KnockoutObservable<string> = ko.observable();
        private _userDisplayName: string = '';

        campuses: any[];
        colleges: any[];
        departments: any[];

        personId: number = 0;
        personId2: number;

        salutation: KnockoutObservable<string> = ko.observable();
        firstName: KnockoutObservable<string> = ko.observable();
        middleName: KnockoutObservable<string> = ko.observable();
        lastName: KnockoutObservable<string> = ko.observable();
        suffix: KnockoutObservable<string> = ko.observable();

        //isFacultyRankEditable: () => boolean;
        //isFacultyRankVisible: () => boolean;
        //facultyRankText: () => string;
        //facultyRanks: KnockoutObservableArray<RootViewModels.Employees.IServerFacultyRankApiModel> = ko.observableArray();
        //facultyRankId: KnockoutObservable<any> = ko.observable(null);

        defaultEstablishmentHasCampuses: KnockoutObservable<boolean> = ko.observable(false);

        preferredTitle: KnockoutObservable<string> = ko.observable();

        gender: KnockoutObservable<string> = ko.observable();
        isActive: KnockoutObservable<boolean> = ko.observable();
        genderText: () => string;
        isActiveText: () => string;

        $photo: KnockoutObservable<JQuery> = ko.observable();
        $facultyRanks: KnockoutObservable<JQuery> = ko.observable();
        $nameSalutation: KnockoutObservable<JQuery> = ko.observable();
        $nameSuffix: KnockoutObservable<JQuery> = ko.observable();
        $editSection: JQuery;
        $confirmPurgeDialog: JQuery;

        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        editMode: KnockoutObservable<boolean> = ko.observable(false);
        saveSpinner = new App.Spinner({ delay: 200, });

        startInEdit: KnockoutObservable<boolean> = ko.observable(false);
        startTabName: KnockoutObservable<string> = ko.observable("Activities");

        //#endregion
        //#region Construction

        constructor(personId: number) {
            this.personId2 = personId; // bring in personId from viewbag

            // go ahead and load affiliations
            this.affiliationData.ready();
        }

        //#endregion
        //#region Affiliations

        defaultAffiliation: ApiModels.Affiliation;
        editableAffiliations: KnockoutObservableArray<KoModels.Affiliation> = ko.observableArray();
        affiliationsSpinner = new App.Spinner({ delay: 400, runImmediately: true, });
        $confirmDeleteAffiliation: JQuery;
        isEditingAffiliation = ko.computed((): boolean => {
            var editableAffiliations = this.editableAffiliations();
            var editingAffiliation = Enumerable.From(editableAffiliations)
                .FirstOrDefault(undefined, function (x: Affiliation): boolean {
                    return x.isEditing();
                });
            return typeof editingAffiliation !== 'undefined';
        });

        affiliationData = new App.DataCacher<ApiModels.Affiliation[]>(
            (): JQueryPromise<ApiModels.Affiliation[]> => {
                return this._loadAffiliationData();
            });

        private _loadAffiliationData(): JQueryPromise<ApiModels.Affiliation[]> {
            var promise: JQueryDeferred<ApiModels.Affiliation[]> = $.Deferred();

            // get this person's affiliations from the server
            Servers.GetAffiliationsByPerson()
                .done((affiliations: ApiModels.Affiliation[]): void => {

                    // default affiliation does not need to be observable
                    this.defaultAffiliation = Enumerable.From(affiliations)
                        .Single(function (x: ApiModels.Affiliation): boolean {
                            return x.isDefault;
                        });
                    this.preferredTitle(this.defaultAffiliation.jobTitles);

                    // the default affiliation is not editable, filter it out
                    var editableAffiliations = Enumerable.From(affiliations)
                        .Except([this.defaultAffiliation])
                        .OrderBy(function (x: ApiModels.Affiliation): number {
                            return x.affiliationId;
                        })
                        .ToArray();

                    // map editable affiliations into observable array of Affiliation viewmodels
                    ko.mapping.fromJS(editableAffiliations, {
                        create: (options: KnockoutMappingCreateOptions): Affiliation => {
                            return new Affiliation(this, options.data);
                        },
                    }, this.editableAffiliations);

                    this.establishmentData.ready(); // begin loading the default affiliation's offspring
                    this.employeeSettingsData.ready(); // begin loading the employee module settings
                    this.affiliationsSpinner.stop(); // stop the loading spinner
                    promise.resolve(affiliations); // resolve the promise for affiliation data
                });
            return promise;
        }

        establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadEstablishmentData();
            });

        private _loadEstablishmentData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            var promise: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            Establishments.Servers.GetOffspring(this.defaultAffiliation.establishmentId)
                .done((offspring: Establishments.ApiModels.ScalarEstablishment[]): void => {
                    promise.resolve(offspring);
                });
            return promise;
        }

        employeeSettingsData = new App.DataCacher<Employees.ApiModels.EmployeeSettings>(
            (): JQueryPromise<Employees.ApiModels.EmployeeSettings> => {
                return this._loadEmployeeSettingsData();
            });

        private _loadEmployeeSettingsData(): JQueryPromise<Employees.ApiModels.EmployeeSettings> {
            var promise: JQueryDeferred<Employees.ApiModels.EmployeeSettings> = $.Deferred();
            Employees.Servers.GetSettingsByPerson()
                .done((settings: Employees.ApiModels.EmployeeSettings): void => {
                    promise.resolve(settings);
                });
            return promise;
        }

        addAffiliation(): void {
            var affiliation = new Affiliation(this, this.personId);
            this.editableAffiliations.push(affiliation);
            affiliation.bindEstablishmentEditors(undefined);
        }

        //#endregion
        //#region DC / USF implementation

        private _loadPromise: JQueryDeferred<any>;
        load(startTab: string = ''): JQueryPromise<any> {
            if (this._loadPromise) return this._loadPromise;
            this._loadPromise = $.Deferred();

            // start both requests at the same time
            //var facultyRanksPact = $.Deferred();
            //$.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get())
            //    .done((data: RootViewModels.Employees.IServerFacultyRankApiModel[], textStatus: string, jqXHR: JQueryXHR): void => {
            //        facultyRanksPact.resolve(data);
            //    })
            //    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
            //        facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
            //    });

            var viewModelPact = $.Deferred();
            $.get('/api/user/person') // todo: button this up
            //$.get(App.Routes.WebApi.My.Profile.get())
                .done((data: ApiModels.IServerProfileApiModel, textStatus: string, jqXHR: JQueryXHR): void => {
                    viewModelPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

            // only process after both requests have been resolved
            viewModelPact.done((viewModel: ApiModels.IServerProfileApiModel): void => {

                    //this.facultyRanks(facultyRanks); // populate the faculty ranks menu
                    //if (facultyRanks.length == 0) {
                    //    this.facultyRankId(null);
                    //}

                    ko.mapping.fromJS(viewModel, { ignore: "id" }, this); // populate the scalars
                    this.personId = viewModel.id;

                    this._originalValues = viewModel;

                    //if (!this._isInitialized) {
                    //    $(this).trigger('ready'); // ready to apply bindings
                    //    this._isInitialized = true; // bindings have been applied
                    //    this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                    //}
                    //this._reloadAffiliations();
                    this._setupValidation();
                    this._setupKendoWidgets();
                    this._setupDisplayNameDerivation();
                    this._setupCardComputeds();

                    //debugger;
                    //if (this.startInEdit()) {
                    //    this.startEditing();
                    //}

                    if (startTab === "") {
                        this._setupRouting();
                        this._sammy.run("#/activities");
                    }
                    else {
                        var url = location.href;
                        var index = url.lastIndexOf("?");
                        if (index != -1) {
                            this._startTab(startTab);
                            this._setupRouting();
                        } else {
                            this._setupRouting();
                            this._sammy.run("#/" + startTab);
                        }
                    }

                    this._loadPromise.resolve();
                })
            //,
            // one of the responses failed (never called more than once, even on multifailures)
            //(xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
            //    //alert('a GET API call failed :(');
            //});
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this._loadPromise.reject(xhr, textStatus, errorThrown);
                });

            return this._loadPromise;
        }

        private _startTab(tabName: string): void {
            var viewModel: any;
            var tabStrip = $("#tabstrip").data("kendoTabStrip");

            if (tabName === "activities") {
                if (this._activitiesViewModel == null) {
                    this._activitiesViewModel = new Activities.ViewModels.ActivityList();
                    this._activitiesViewModel.load()
                        .done((): void => {
                            ko.applyBindings(this._activitiesViewModel, $("#activities")[0]);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                }
                if (tabStrip.select() != 0) {
                    tabStrip.select(0);
                }
            } else if (tabName === "geographic-expertise") {
                if (this._geographicExpertisesViewModel == null) {
                    this._geographicExpertisesViewModel = new RootViewModels.GeographicExpertises.GeographicExpertiseList(this.personId);
                    this._geographicExpertisesViewModel.load()
                        .done((): void => {
                            ko.applyBindings(this._geographicExpertisesViewModel, $("#geographic-expertises")[0]);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                }
                if (tabStrip.select() != 1) {
                    tabStrip.select(1);
                }
            } else if (tabName === "language-expertise") {
                if (this._languageExpertisesViewModel == null) {
                    this._languageExpertisesViewModel = new RootViewModels.LanguageExpertises.LanguageExpertiseList(this.personId);
                    this._languageExpertisesViewModel.load()
                        .done((): void => {
                            ko.applyBindings(this._languageExpertisesViewModel, $("#language-expertises")[0]);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                }
                if (tabStrip.select() != 2) {
                    tabStrip.select(2);
                }
            } else if (tabName === "formal-education") {
                if (this._degreesViewModel == null) {
                    this._degreesViewModel = new RootViewModels.Degrees.DegreeList(this.personId);
                    this._degreesViewModel.load()
                        .done((): void => {
                            ko.applyBindings(this._degreesViewModel, $("#degrees")[0]);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                }
                if (tabStrip.select() != 3) {
                    tabStrip.select(3);
                }
            } else if (tabName === "affiliations") {
                if (this._internationalAffiliationsViewModel == null) {
                    this._internationalAffiliationsViewModel = new RootViewModels.InternationalAffiliations.InternationalAffiliationList(this.personId);
                    this._internationalAffiliationsViewModel.load()
                        .done((): void => {
                            ko.applyBindings(this._internationalAffiliationsViewModel, $("#international-affiliations")[0]);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + " |" + errorThrown);
                        });
                }
                if (tabStrip.select() != 4) {
                    tabStrip.select(4);
                }
            }
        }

        tabClickHandler(event: any): void {
            var tabName = event.item.innerText; // IE
            if (tabName == null) tabName = event.item.textContent; // FF
            tabName = this.tabTitleToName(tabName);
            //this._startTab( tabName );
            location.href = "#/" + tabName;
        }

        tabTitleToName(title: string): string {
            var tabName = null;
            if (title === "Activities") tabName = "activities";
            if (title === "Geographic Expertise") tabName = "geographic-expertise";
            if (title === "Language Expertise") tabName = "language-expertise";
            if (title === "Formal Education") tabName = "formal-education";
            if (title === "Affiliations") tabName = "affiliations";
            return tabName;
        }

        startEditing(): void { // show the editor
            this.editMode(true);
            if (this.$editSection.length) {
                this.$editSection.slideDown();
            }
        }

        stopEditing(): void { // hide the editor
            this.editMode(false);
            if (this.$editSection.length) {
                this.$editSection.slideUp();
            }
        }

        cancelEditing(): void {
            ko.mapping.fromJS(this._originalValues, {}, this); // restore original values
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
                Servers.PutAffiliation(affiliationPutModel, this.defaultAffiliation.establishmentId);

                $.ajax({
                    //url: App.Routes.WebApi.My.Profile.put(),
                    url: '/api/user/person', // TODO: button this up
                    type: 'PUT',
                    data: apiModel
                })
                    .done((responseText: string, statusText: string, xhr: JQueryXHR) => {
                        App.flasher.flash(responseText);
                        this.stopEditing();
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
                    ]
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
                    this.photoUploadError(Profile.photoUploadUnexpectedErrorMessage);
                });
        }

        private _setupRouting(): void {
            this._sammy.route('get', '#/', (): void => { this._startTab('activities'); });
            this._sammy.route('get', '#/activities', (): void => { this._startTab('activities'); });
            this._sammy.route('get', '#/geographic-expertise', (): void => { this._startTab('geographic-expertise'); });
            this._sammy.route('get', '#/language-expertise', (): void => { this._startTab('language-expertise'); });
            this._sammy.route('get', '#/formal-education', (): void => { this._startTab('formal-education'); });
            this._sammy.route('get', '#/affiliations', (): void => { this._startTab('affiliations'); });
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

            this.preferredTitle.extend({
                maxLength: 500
            });

            ko.validation.group(this);
        }

        // comboboxes for salutation & suffix
        private _setupKendoWidgets(): void {

            var tabstrip = $('#tabstrip');
            tabstrip.kendoTabStrip({
                select: (e: any): void => { this.tabClickHandler(e); },
                animation: false
            }).show();

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

            // this is getting a little long, can probably factor out event handlers / validation stuff
            this.$photo.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length) {
                    newValue.kendoUpload({
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
                            // ignore remove operations becuase they don't actually do anything
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
                                this.photoUploadError(Profile.photoUploadUnexpectedErrorMessage);
                            }
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
