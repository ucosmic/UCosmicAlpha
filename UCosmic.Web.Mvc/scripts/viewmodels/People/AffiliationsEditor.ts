module People.ViewModels {
    export class AffiliatedEstablishmentEditorSpike {

        select = new App.FormSelect<number>({ kendoOptions: {}, });

        constructor(public owner: AffiliationSpike,
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
                var ancestor: AffiliatedEstablishmentEditorSpike = Enumerable.From(ancestors)
                    .FirstOrDefault(undefined, function (x: AffiliatedEstablishmentEditorSpike): boolean {
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




    export class AffiliationSpike implements KoModels.Affiliation, KnockoutValidationGroup {
        //#region Observable Interface Implementation

        affiliationId = ko.observable<number>();
        personId = ko.observable<number>();
        establishmentId = ko.observable<number>();
        isDefault = ko.observable<boolean>();
        jobTitles = ko.observable<string>();
        facultyRank = ko.observable<Employees.KoModels.EmployeeSettingsFacultyRank>();
        establishments = ko.observableArray<KoModels.AffiliatedEstablishment>();

        //#endregion
        //#region Construction

        owner: AffiliationsEditor;
        data: ApiModels.Affiliation;

        constructor(owner: AffiliationsEditor, data: ApiModels.Affiliation);
        constructor(owner: AffiliationsEditor, personId: number);
        constructor(owner: AffiliationsEditor, dataOrPersonId: any) {
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

        edit(me): void {
            this.owner.startEditingAffiliations();
            this.bindEstablishmentEditors(this.establishmentId());
            this.isEditing(true);
        }

        cancel(): void {
            this.owner.cancelClicked = false;
            this.owner.$edit_affiliations_dialog.data("kendoWindow").close();
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
        hideValidationMessages = ko.observable<boolean>(true);

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
                            .FirstOrDefault(undefined, (x: AffiliationSpike): boolean => {
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
                    this.owner.cancelClicked = false;
                    this.owner.$edit_affiliations_dialog.data("kendoWindow").close();
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

        establishmentEditors = ko.observableArray<AffiliatedEstablishmentEditorSpike>(); // department drop downs

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
                    .LastOrDefault(undefined, function (x: AffiliatedEstablishmentEditorSpike): boolean {
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
                var editor = new AffiliatedEstablishmentEditorSpike(this, options,
                    !isLast ? establishment : undefined);

                // when this is not the last binding, insert editor as first element
                if (!isLast) {
                    this.establishmentEditors.unshift(editor);
                }
                // otherwise, insert editor as last element
                else {
                    this.establishmentEditors.push(editor);
                }
            }
            this.owner.hasAffiliationsEditorLoaded(true);
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
        hasFacultyRanks = ko.observable<boolean>(false);

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
        //#region Position Title Text

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


    export class AffiliationsEditor implements KnockoutValidationGroup {
        
        //#region Properties

        hasAffiliationsEditorLoaded = ko.observable<boolean>(false);
        hasViewModelLoaded = ko.observable<boolean>(false);
        personId: number = 0;
        isEditMode = ko.observable<boolean>(false);
        saveSpinner = new App.Spinner({ delay: 200, });
        cancelClicked: boolean = true;
        preferredTitle = ko.observable<string>();
        $edit_affiliations_dialog = $("#edit_affiliations_dialog");

        //#endregion
        //#region Construction

        constructor(personId: number) {
            // go ahead and load affiliations
            this.affiliationData.ready();
            this.hasViewModelLoaded(true);
        }
        
        //#endregion
        //#region Affiliations

        facultyRankAutoUpdate(data) {
            if (data.value() == undefined) {
                return null;
            }
            var match = ko.utils.arrayFirst(data.options(), function (item: any) {
                return data.value() === item.value;
            });
            return match.text;
        }

        affiliatedEstablishmentsAutoUpdate(data) {
            if (data.value() == undefined) {
                return null;
            }
            var match = ko.utils.arrayFirst(data.options(), function (item: any) {
                return data.value() === item.value;
            });
            return match.text;
        }

        bindJquery(): void {
            this.$edit_affiliations_dialog.kendoWindow({
                width: 550,
                open: () => {
                    $("html, body").css("overflow", "hidden");
                    this.isEditMode(true);
                },
                close: () => {
                    $("html, body").css("overflow", "");
                    this.isEditMode(false);

                    var editableAffiliations = this.editableAffiliations();
                    var editingAffiliation = Enumerable.From(editableAffiliations)
                        .FirstOrDefault(undefined, function (x: AffiliationSpike): boolean {
                            return x.isEditing();
                        });
                    if (this.cancelClicked) {
                        editingAffiliation.cancel();
                    }
                    this.cancelClicked = true;
                },
                visible: false,
                draggable: false,
                resizable: false
            });
            this.$edit_affiliations_dialog.parent().addClass("profile-kendo-window");
            var dialog = this.$edit_affiliations_dialog.data("kendoWindow");
            dialog.center();

            $(window).resize(() => {
                dialog.center();
            });
        }
        
        defaultAffiliation: ApiModels.Affiliation;
        editableAffiliations = ko.observableArray<KoModels.Affiliation>();
        affiliationsSpinner = new App.Spinner({ delay: 400, runImmediately: true, });
        $confirmDeleteAffiliation: JQuery;
        isEditingAffiliation = ko.computed((): boolean => {
            var editableAffiliations = this.editableAffiliations();
            var editingAffiliation = Enumerable.From(editableAffiliations)
                .FirstOrDefault(undefined, function (x: AffiliationSpike): boolean {
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
                        create: (options: KnockoutMappingCreateOptions): AffiliationSpike => {
                            return new AffiliationSpike(this, options.data);
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

        addAffiliation(me): void {
            this.startEditingAffiliations();
            var affiliation = new AffiliationSpike(this, this.personId);
            this.editableAffiliations.push(affiliation);
            affiliation.bindEstablishmentEditors(undefined);
        }


        startEditingAffiliations(): void { // show the editor
            this.$edit_affiliations_dialog.data("kendoWindow").open().title("Affiliations");
        }

        saveAffiliations(): void {
            var affiliationPutModel: ApiModels.AffiliationPut = {
                jobTitles: this.preferredTitle(),
            };
            Servers.PutAffiliation(affiliationPutModel, this.defaultAffiliation.establishmentId);
        }

        //#endregion
    }



}