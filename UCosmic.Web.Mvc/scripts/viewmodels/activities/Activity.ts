/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/tinymce/tinymce.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/linq/linq.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="ActivityEnums.ts" />
/// <reference path="ServiceApiModel.d.ts" />

module Activities.ViewModels {

    export class ActivityForm implements KnockoutValidationGroup {

        //#region Primary scalar observables & properties

        ready: KnockoutObservable<boolean> = ko.observable(false);

        private _workCopyId: number;
        private _originalId: number;

        activityId: KnockoutObservable<number>;
        mode: KnockoutObservable<ActivityMode> = ko.observable();
        title: KnockoutObservable<string>;
        content: KnockoutObservable<string>;
        startsOn: FormattedDateInput;
        endsOn: FormattedDateInput;
        onGoing: KnockoutObservable<boolean>;
        isExternallyFunded: KnockoutObservable<boolean>;
        isInternallyFunded: KnockoutObservable<boolean>;
        updatedByPrincipal: KnockoutObservable<string>;
        updatedOnUtc: KnockoutObservable<string> = ko.observable();

        //#endregion
        //#region View convenience computeds

        isDraft: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var mode = this.mode();
            if (!mode) return false;
            return mode == ActivityMode.draft;
        });

        isPublished: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var mode = this.mode();
            if (!mode) return false;
            return mode == ActivityMode.published;
        });

        updatedOnDate: KnockoutComputed<string> = ko.computed((): string => {
            var updatedOnUtc = this.updatedOnUtc();
            if (!updatedOnUtc) return undefined;
            return moment(updatedOnUtc).format('M/D/YYYY');
        });

        //#endregion
        //#region Construction & Initialization

        constructor(activityId: number, activityWorkCopyId: number) {
            this._originalId = activityId;
            this._workCopyId = activityWorkCopyId;
        }

        //#endregion
        //#region Initial data load

        bind(target: Element): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            var dataPact = $.Deferred();
            $.ajax({ url: $('#activity_api').text().format(this._workCopyId), cache: false, })
                .done((data: any): void => { dataPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { dataPact.reject(xhr); });

            var placeOptionsPact = $.Deferred();
            $.get($('#place_options_api').text())
                .done((data: any[]): void => { placeOptionsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { placeOptionsPact.reject(xhr); });

            var typeOptionsPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                .done((data: any[]): void => { typeOptionsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { typeOptionsPact.reject(xhr); });

            $.when(dataPact, placeOptionsPact, typeOptionsPact)
                .done((data: ApiModels.Activity, placeOptions: any[], typeOptions: any[]): void => {

                    this._applyBindings(target, data, placeOptions, typeOptions);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => {
                    deferred.reject(xhr);
                });

            return deferred;
        }

        //#endregion
        //#region Data Binding

        private _applyBindings(target: Element, data: ApiModels.Activity,
            placeOptions: any[], typeOptions: any[]): void {
            this._bindData(data);
            this._bindPlaceOptions(placeOptions);
            this._bindTypeOptions(typeOptions);

            this._bindValidation();
            this._bindSubscriptions();

            ko.applyBindings(this, target);

            this._bindKendo();
            this.ready(true);
        }

        private _bindData(data: ApiModels.Activity): void {
            var mapping = {
                types: {
                    create: (options: KnockoutMappingCreateOptions): number => {
                        return options.data.typeId;
                    },
                },
                places: {
                    create: (options: KnockoutMappingCreateOptions): number => {
                        return options.data.placeId;
                    },
                },
                ignore: ['startsOn', 'endsOn', 'startsFormat', 'endsFormat'],
            };
            ko.mapping.fromJS(data, mapping, this);

            this.startsOn = new FormattedDateInput(data.startsOn, data.startsFormat);
            this.endsOn = new FormattedDateInput(data.endsOn, data.endsFormat);
        }

        //#endregion
        //#region Validation

        errors: KnockoutValidationErrors;
        isValid: () => boolean;

        private _bindValidation(): void {
            ko.validation.rules['atLeast'] = {
                validator: (val: any, otherVal: any): boolean => {
                    return val.length >= otherVal;
                },
                message: 'At least {0} must be selected.'
            };

            ko.validation.rules['formattedDate'] = {
                validator: (value: string, params: FormattedDateInput): boolean => {
                    return params.isValid();
                },
                message: 'Date is not valid.'
            };

            ko.validation.registerExtenders();

            ko.validation.group(this);

            this.title.extend({
                required: {
                    message: 'Title is required.'
                },
                minLength: 1,
                maxLength: 500
            });
            this.places.extend({ atLeast: 1 });
            if (this.typeOptions().length)
                this.types.extend({ atLeast: 1 });

            this.startsOn.input.extend({
                formattedDate: {
                    params: this.startsOn,
                    message: 'Start date is not valid.',
                }
            });
            this.endsOn.input.extend({
                formattedDate: {
                    params: this.endsOn,
                    message: 'End date is not valid.',
                }
            });
        }

        //#endregion
        //#region Subscriptions

        isSaving: KnockoutObservable<boolean> = ko.observable(false);
        saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
        private _isDirty: KnockoutObservable<boolean> = ko.observable(false);

        private _bindSubscriptions(): void {
            // autosave when fields change
            this.title.subscribe((newValue: any): void => { this._isDirty(true); });
            this.content.subscribe((newValue: any): void => { this._descriptionCheckIsDirty(newValue); });
            this.startsOn.input.subscribe((newValue: any): void => { this._isDirty(true); });
            this.endsOn.input.subscribe((newValue: any): void => { this._isDirty(true); });
            this.onGoing.subscribe((newValue: any): void => { this._isDirty(true); });
            this.isExternallyFunded.subscribe((newValue: any): void => { this._isDirty(true); });
            this.isInternallyFunded.subscribe((newValue: any): void => { this._isDirty(true); });

            ko.computed((): void => {
                if (this._isDirty()) {
                    this._autoSave();
                }
            });

            this.isSaving.subscribe((newValue: boolean): void => {
                if (newValue) this.saveSpinner.start();
                else this.saveSpinner.stop();
            });

            // popup when leaving empty undeleted page
            window.onbeforeunload = (): any => {
                if (!this._hasData() && !this._isDeleted) {
                    return "This activity currently has no data. If you continue, the activity will be kept and you can come back to add data later. If you intended to delete it, please stay on this page and click one of the 'Cancel' buttons provided instead.";
                } else {
                    this._autoSave();
                }
            }
        }

        //#endregion
        //#region Kendo

        private _bindKendo(): void {
            this._bindDatePickers();
            this._bindPlacesKendoMultiSelect();
            this._bindDocumentsKendoUpload();
            this._bindTagsKendoAutoComplete();
        }

        //#endregion
        //#region Saving

        private static _descriptionIsDirtyAfter: number = 10; // autosave after so many keydowns in description
        private _descriptionIsDirtyCurrent: number = 0;

        private _descriptionCheckIsDirty(newValue: any): void {
            ++this._descriptionIsDirtyCurrent;
            if (this._descriptionIsDirtyCurrent >= ActivityForm._descriptionIsDirtyAfter) {
                this._isDirty(true);
                this._descriptionIsDirtyCurrent = 0;
            }
        }

        private _isAutoSaving: boolean = false; // in the process of saving
        private _isSaved: boolean = false; // prevent autosave when already saved (published or draft)
        private _isDeleted: boolean = false; // prevent autosave when already deleted (on cancel)

        private _autoSave(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();
            if (this._isSaved || this._isDeleted || this._isAutoSaving ||
                (!this._isDirty() && this._descriptionIsDirtyCurrent == 0)) {
                deferred.resolve();
                return deferred;
            }

            this._isAutoSaving = true;
            this.isSaving(true);

            var model = ko.mapping.toJS(this);

            var url = $('#activity_api').text().format(this.activityId());
            var data = {
                title: model.title,
                content: model.content,
                startsOn: this.startsOn.isoString(),
                startsFormat: this.startsOn.format(),
                onGoing: model.onGoing,
                endsOn: model.onGoing ? undefined : this.endsOn.isoString(),
                endsFormat: model.onGoing ? undefined : this.endsOn.format(),
                isExternallyFunded: model.isExternallyFunded,
                isInternallyFunded: model.isInternallyFunded,
            };
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
            })
                .done((): void => {
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => {
                    deferred.reject(xhr);
                })
                .always((): void => {
                    this._isDirty(false);
                    this._isAutoSaving = false;
                    this.isSaving(false);
                });

            return deferred;
        }

        private _save(mode: string): void {
            this._autoSave() // play through the autosave function first
                .done((data: any): void => {

                    if (!this.isValid()) {
                        this.errors.showAllMessages();
                        return;
                    }

                    this.isSaving(true);

                    var url = $('#activity_replace_api').text()
                        .format(this._workCopyId, this._originalId, mode);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                    })
                        .done(() => {
                            this._isSaved = true; // prevent tinymce onbeforeunload from updating again
                            location.href = App.Routes.Mvc.My.Profile.get();
                        })
                        .fail((xhr: JQueryXHR): void => {
                            App.Failures.message(xhr, 'while trying to save your activity', true);
                        })
                        .always((): void => {
                            this._isDirty(false);
                            this.isSaving(false);
                        });
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to save your activity', true);
                });
        }

        saveDraft(): void {
            this._save('Draft');
        }

        publish(): void {
            this._save('Public');
        }

        //#endregion
        //#region Canceling

        cancel(): void {
            var $dialog = $('#cancelConfirmDialog');
            $dialog.dialog({
                dialogClass: 'jquery-ui no-close',
                closeOnEscape: false,
                modal: true,
                resizable: false,
                width: 450,
                buttons: [
                    {
                        text: 'Cancel and lose changes',
                        click: (): void => {
                            var $buttons = $dialog.parents('.ui-dialog').find('button');
                            $.each($buttons, function (): void { // disable buttons
                                $(this).attr('disabled', 'disabled');
                            });
                            $dialog.find('.spinner').css('visibility', '');

                            this._purge()
                                .done((): void => {
                                    $dialog.dialog('close');
                                    location.href = App.Routes.Mvc.My.Profile.get();
                                })
                                .fail((xhr: JQueryXHR): void => {
                                    App.Failures.message(xhr, 'while trying to discard your activity edits', true);
                                })
                                .always((): void => { // re-enable buttons
                                    $.each($buttons, function (): void {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                        }
                    },
                    {
                        text: 'Do not cancel',
                        click: (): void => {
                            $dialog.dialog('close');
                        },
                        'data-css-link': true
                    }]
            });
        }

        private _purge(async: boolean = true): JQueryDeferred<void> {
            var deferred = $.Deferred();
            var url = $('#activity_api').text().format(this.activityId());
            $.ajax({
                type: 'DELETE',
                url: url,
                async: async,
            })
                .done((): void => {
                    this._isDeleted = true; // prevent tinymce onbeforeunload from updating again
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => {
                    deferred.reject(xhr);
                })
                .always((): void => { // re-enable buttons
                    deferred.always();
                });

            return deferred;
        }

        private _hasData(): boolean {
            var _hasData = this.title() || this.content() || this.onGoing() || this.startsOn.input()
                || this.endsOn.input() || this.isExternallyFunded() || this.isInternallyFunded()
                || this.types().length || this.places().length || this.tags().length
                || this.documents().length
            ;
            return _hasData;
        }

        //#endregion
        //#region Dates

        $startsOn: JQuery;
        $endsOn: JQuery;

        private _bindDatePickers(): void {
            this.$startsOn.kendoDatePicker({
                value: this.startsOn.date(),
                format: this.startsOn.format(),
                // if user clicks date picker button, reset format
                open: function (e: kendo.ui.DatePickerEvent) {
                    this.options.format = 'M/d/yyyy';
                },
            });
            this.startsOn.kendoDatePicker = this.$startsOn.data('kendoDatePicker');

            this.$endsOn.kendoDatePicker({
                value: this.endsOn.date(),
                format: this.endsOn.format(),
                open: function (e) {
                    this.options.format = 'M/d/yyyy';
                },
            });
            this.endsOn.kendoDatePicker = this.$endsOn.data('kendoDatePicker');
        }


        //#endregion
        //#region Places

        places: KnockoutObservableArray<number>;
        placeOptions: KnockoutObservableArray<any> = ko.observableArray(); // Array of all locations offered in Country/Location multiselect
        kendoPlaceIds: KnockoutObservableArray<number> = ko.observableArray(); // Array of placeIds of selected locations, kendo multiselect stores these as strings

        private _bindPlaceOptions(placeOptions: any[]): void {
            // map places multiselect datasource to locations
            ko.mapping.fromJS(placeOptions, {}, this.placeOptions);

            // Initialize the list of selected locations with current locations in values
            this.kendoPlaceIds(this.places().slice(0));
        }

        private _bindPlacesKendoMultiSelect(): void {
            $('#countrySelector').kendoMultiSelect({
                filter: 'contains',
                ignoreCase: 'true',
                dataTextField: 'officialName()',
                dataValueField: 'id()',
                dataSource: this.placeOptions(),
                value: this.kendoPlaceIds(),
                dataBound: (e: kendo.ui.MultiSelectEvent): void => {
                    this.places(e.sender.value().slice(0));
                },
                change: (e: kendo.ui.MultiSelectEvent): void => {
                    this._onPlaceMultiSelectChange(e);
                },
                placeholder: '[Select Country/Location, Body of Water or Global]'
            });

        }

        private _onPlaceMultiSelectChange(e: kendo.ui.MultiSelectEvent): void {
            // find out if a place was added or deleted
            var oldPlaceIds = this.places();
            var newPlaceIds = e.sender.value();
            var addedPlaceIds: number[] = $(newPlaceIds).not(oldPlaceIds).get();
            var removedPlaceIds: number[] = $(oldPlaceIds).not(newPlaceIds).get();

            if (addedPlaceIds.length === 1)
                this._addPlaceId(addedPlaceIds[0], e);

            else if (removedPlaceIds.length === 1)
                this._removePlaceId(removedPlaceIds[0], e);
        }

        private _addPlaceId(addedPlaceId: number, e: kendo.ui.MultiSelectEvent): void {
            var url = $('#place_api').text()
                .format(this.activityId(), addedPlaceId);
            this.isSaving(true);
            $.ajax({
                type: 'PUT',
                url: url,
                //async: false
            })
                .done((): void => {
                    this.places.push(addedPlaceId);
                })
                .fail((xhr: JQueryXHR): void => { // remove from ui
                    App.Failures.message(xhr, 'while trying to add this location, please try again', true);
                    var restored = this.places().slice(0);
                    e.sender.dataSource.filter({});
                    e.sender.value(restored);
                    this.places(restored);
                })
                .always((): void => { this.isSaving(false); });
        }

        private _removePlaceId(removedPlaceId: number, e: kendo.ui.MultiSelectEvent): void {
            var url = $('#place_api').text()
                .format(this.activityId(), removedPlaceId);
            this.isSaving(true);
            $.ajax({
                type: 'DELETE',
                url: url,
                //async: false
            })
                .done((): void => {
                    this.places.remove(removedPlaceId);
                })
                .fail((xhr: JQueryXHR): void => { // add back to ui
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(this.places());
                })
                .always((): void => { this.isSaving(false); });
        }

        //#endregion
        //#region Types

        types: KnockoutObservableArray<number>;
        typeOptions: KnockoutObservableArray<ActivityTypeCheckBox> = ko.observableArray(); // array of activity type options displayed as list of checkboxes

        private _bindTypeOptions(typeOptions: any[]): void {
            var typesMapping: KnockoutMappingOptions = {
                create: (options: KnockoutMappingCreateOptions): any => {
                    var checkBox = new ActivityTypeCheckBox(options, this);
                    return checkBox;
                }
            };
            ko.mapping.fromJS(typeOptions, typesMapping, this.typeOptions);
        }

        //#endregion
        //#region Tags

        tags: KnockoutObservableArray<KoModels.ActivityTag> = ko.observableArray(); // Data bound to new tag textArea
        newTag: KnockoutObservable<string> = ko.observable();

        private _bindTagsKendoAutoComplete(): void {
            $('#newTag').kendoAutoComplete({
                minLength: 3,
                placeholder: '[Enter tag or keyword]',
                dataTextField: 'text',
                dataSource: this._getTagAutoCompleteDataSource(),
                select: (e: kendo.ui.AutoCompleteSelectEvent): void => {
                    this._onTagAutoCompleteSelect(e);
                }
            });
        }

        private _getTagAutoCompleteDataSource(): kendo.data.DataSource {
            var dataSource = new kendo.data.DataSource({
                serverFiltering: true,
                transport: {
                    read: (options: any): void => {
                        $.ajax({
                            url: $('#establishment_names_api').text(),
                            data: {
                                keyword: options.data.filter.filters[0].value,
                                pageNumber: 1,
                                pageSize: 250
                            },
                        })
                            .done((results: any): void => {
                                options.success(results.items);
                            })
                            .fail((xhr: JQueryXHR): void => {
                                App.Failures.message(xhr, 'while trying to search for tags', true);
                            });
                    }
                }
            });
            return dataSource;
        }

        private _getTagEstablishmentId(text: string): number {
            var establishmentId: number;
            var url = $('#establishment_names_api').text();
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    keyword: text,
                    keywordMatchStrategy: 'Equals',
                    pageNumber: 1,
                    pageSize: 250,
                },
                async: false,
            })
                .done((results: any): void => {
                    // only treat as establishment if there is exactly 1 establishment id
                    var establishmentIds: number[] = Enumerable.From(results.items)
                        .Select(function (x: any): number {
                            return x.ownerId;
                        }).Distinct().ToArray();
                    if (establishmentIds.length == 1) establishmentId = establishmentIds[0];
                });
            return establishmentId;
        }

        private _onTagAutoCompleteSelect(e: kendo.ui.AutoCompleteSelectEvent): void {
            // the autocomplete filter will search establishment names, not establishments
            // name.ownerId corresponds to the establishment.id
            var dataItem = e.sender.dataItem(e.item.index());
            this._addOrReplaceTag(dataItem.text, dataItem.ownerId)
                .done((): void => {
                    this.newTag('');
                    e.preventDefault();
                    e.sender.value('');
                    e.sender.element.focus(); // this resets the value of e.sender._prev
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
        }

        addTag(): void {
            var text = this.newTag();
            if (text) text = $.trim(text);
            var establishmentId = this._getTagEstablishmentId(text);
            this._addOrReplaceTag(text, establishmentId)
                .done((): void => {
                    this.newTag('');
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
        }

        deleteTag(item: KoModels.ActivityTag): void {
            this._deleteTag(item.text())
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to delete this activity tag, please try again', true);
                });
        }

        private _addOrReplaceTag(text: string, establishmentId: number): JQueryDeferred<any> {
            var deferred = $.Deferred();
            if (!text) {
                deferred.resolve();
            }
            else {
                text = $.trim(text);
                var tagToReplace = Enumerable.From(this.tags())
                    .SingleOrDefault(undefined, function (x: KoModels.ActivityTag): boolean {
                        return x.text().toUpperCase() === text.toUpperCase();
                    });
                if (tagToReplace) {
                    this._deleteTag(text)
                        .done((): void => {
                            this._postTag(text, establishmentId)
                                .done((): void => { deferred.resolve(); })
                                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
                        })
                        .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
                }
                else {
                    this._postTag(text, establishmentId)
                        .done((): void => { deferred.resolve(); })
                        .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
                }
            }
            return deferred;
        }

        private _postTag(text: string, establishmentId: number): JQueryDeferred<any> {
            var deferred = $.Deferred();
            var url = $('#tags_api').text().format(this.activityId());
            this.isSaving(true);
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    text: text,
                    domainType: establishmentId ? ActivityTagDomainType.establishment : ActivityTagDomainType.custom,
                    domainKey: establishmentId,
                },
            })
                .done((): void => { // push observable tag into view's array
                    var tag: ApiModels.ActivityTag = {
                        activityId: this.activityId(),
                        text: text,
                        domainType: establishmentId ? ActivityTagDomainType.establishment : ActivityTagDomainType.custom,
                        domainKey: establishmentId,
                    };
                    var observableTag: KoModels.ActivityTag = ko.mapping.fromJS(tag);
                    this.tags.push(observableTag);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); })
                .always((): void => { this.isSaving(false); });
            return deferred;
        }

        private _deleteTag(text: string): JQueryDeferred<any> {
            var deferred = $.Deferred();
            var url = $('#tags_api').text().format(this.activityId());
            this.isSaving(true);
            $.ajax({
                url: url,
                type: 'DELETE',
                data: { // api expects text in the body, not url (because of encoding)
                    text: text,
                },
            })
                .done((): void => {
                    // there should always be matching tag, but check to be safe
                    var tagToRemove = Enumerable.From(this.tags())
                        .SingleOrDefault(undefined, function (x: KoModels.ActivityTag): boolean {
                            return text && x.text().toUpperCase() === text.toUpperCase();
                        });
                    if (tagToRemove) this.tags.remove(tagToRemove);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); })
                .always((): void => { this.isSaving(false); });
            return deferred;
        }

        //#endregion
        //#region Documents

        private static iconMaxSide: number = 64; // max width or height of the document icon
        documents: KnockoutObservableArray<KoModels.ActivityDocument> = ko.observableArray();
        fileUploadErrors: KnockoutObservableArray<any> = ko.observableArray(); // array to hold file upload errors
        private _previousDocumentTitle: string; // old document name - used during document rename
        private _invalidFileNames: KnockoutObservableArray<string> = ko.observableArray([]);

        private _bindDocumentsKendoUpload(): void {
            $('#uploadFile').kendoUpload({
                multiple: true,
                showFileList: false,
                localization: { select: 'Choose one or more documents to share...' },
                async: { saveUrl: $('#documents_api').text().format(this.activityId()), },
                select: (e: kendo.ui.UploadSelectEvent): void => { this._onDocumentKendoSelect(e); },
                upload: (e: kendo.ui.UploadUploadEvent): void => { this._onDocumentKendoUpload(e); },
                success: (e: kendo.ui.UploadSuccessEvent): void => { this._onDocumentKendoSuccess(e); },
                error: (e: kendo.ui.UploadErrorEvent): void => { this._onDocumentKendoError(e); },
                complete: (): void => { this.isSaving(false); }
            });
        }

        private _onDocumentKendoSelect(e: kendo.ui.UploadSelectEvent): void {
            this.isSaving(true);
            for (var i = 0; i < e.files.length; i++) {
                var file = e.files[i];
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: $('#documents_validate_api').text(),
                    data: {
                        name: file.name,
                        length: file.size
                    },
                })
                    .fail((xhr: JQueryXHR) => {
                        var isAlreadyInvalid = Enumerable.From(this._invalidFileNames())
                            .Any(function (x: string): boolean {
                                return x == file.name;
                            });
                        if (!isAlreadyInvalid) this._invalidFileNames.push(file.name);
                        var message = xhr.status === 400
                            ? xhr.responseText
                            : App.Failures.message(xhr, "while trying to upload '{0}'".format(file.name));
                        this.fileUploadErrors.push({ message: message, });
                    });
            }
            this.isSaving(false);
        }

        private _onDocumentKendoUpload(e: kendo.ui.UploadUploadEvent): void {
            var file = e.files[0];
            var isInvalidFileName = Enumerable.From(this._invalidFileNames())
                .Any(function (x: string): boolean {
                    return x == file.name;
                });
            if (isInvalidFileName) {
                e.preventDefault();
                this._invalidFileNames.remove(file.name);
            }
            else {
                this.isSaving(true);
            }
        }

        private _onDocumentKendoSuccess(e: kendo.ui.UploadSuccessEvent): void {
            var location = e.XMLHttpRequest.getResponseHeader('location');
            $.get(location)
                .done((data: any): void => {
                    var document: KoModels.ActivityDocument = ko.mapping.fromJS(data);
                    this.documents.push(document);
                });
        }

        private _onDocumentKendoError(e: kendo.ui.UploadErrorEvent): void {
            var message = e.XMLHttpRequest.status != 500 && e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000
                ? e.XMLHttpRequest.responseText
                : App.Failures.message(e.XMLHttpRequest, 'while uploading your document, please try again');
            this.fileUploadErrors.push({ message: message, });
        }

        documentIcon(documentId: number) {
            var url = $('#document_icon_api').text().format(this.activityId(), documentId);
            var params = { maxSide: ActivityForm.iconMaxSide };
            return '{0}?{1}'.format(url, $.param(params));
        }

        deleteDocument(item: KoModels.ActivityDocument, index: number): void {
            var $dialog = $('#deleteDocumentConfirmDialog');
            $dialog.dialog({ // open a dialog to confirm deletion of document
                dialogClass: 'jquery-ui no-close',
                closeOnEscape: false,
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: 'Yes, confirm delete',
                        click: (): void => {
                            var $buttons = $dialog.parents('.ui-dialog').find('button');
                            $.each($buttons, function (): void { // disable buttons
                                $(this).attr('disabled', 'disabled');
                            });
                            $dialog.find('.spinner').css('visibility', '');

                            $.ajax({ // submit delete api request
                                type: 'DELETE',
                                url: $('#document_api').text().format(this.activityId(), item.documentId()),
                            })
                                .done((): void => {
                                    $dialog.dialog('close');
                                    this.documents.splice(index, 1);
                                })
                                .fail((xhr: JQueryXHR): void => { // display failure message
                                    App.Failures.message(xhr, 'while trying to delete your activity document', true);
                                })
                                .always((): void => { // re-enable buttons
                                    $.each($buttons, function (): void {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                        }
                    },
                    {
                        text: 'No, cancel delete',
                        click: (): void => {
                            $dialog.dialog('close');
                        },
                        'data-css-link': true
                    }]
            });
        }

        startDocumentTitleEdit(item: KoModels.ActivityDocument, event: any): void {
            var textElement = event.target;
            $(textElement).hide();
            this._previousDocumentTitle = item.title();
            var inputElement = $(textElement).siblings('#documentTitleInput')[0];
            $(inputElement).show();
            $(inputElement).focusout(event, (event: any): void => {
                this.endDocumentTitleEdit(item, event);
            });
            $(inputElement).keypress(event, (event: any): void => {
                if (event.which == 13) inputElement.blur();
            });
        }

        endDocumentTitleEdit(item: KoModels.ActivityDocument, event: any): void {
            var inputElement = event.target;
            $(inputElement).unbind('focusout');
            $(inputElement).unbind('keypress');
            $(inputElement).attr('disabled', 'disabled');

            var url = $('#document_api').text().format(this.activityId(), item.documentId());
            $.ajax({
                type: 'PUT',
                url: url,
                data: {
                    title: item.title()
                },
                success: (data: any): void => {
                    $(inputElement).hide();
                    $(inputElement).removeAttr('disabled');
                    var textElement = $(inputElement).siblings('#documentTitle')[0];
                    $(textElement).show();
                },
                error: (xhr: JQueryXHR): void => {
                    item.title(this._previousDocumentTitle);
                    $(inputElement).hide();
                    $(inputElement).removeAttr('disabled');
                    var textElement = $(inputElement).siblings('#documentTitle')[0];
                    $(textElement).show();
                    $('#documentRenameErrorDialog > #message')[0].innerText = xhr.responseText;
                    $('#documentRenameErrorDialog').dialog({
                        modal: true,
                        resizable: false,
                        width: 400,
                        buttons: { Ok: function () { $(this).dialog('close'); } }
                    });
                }
            });
        }

        dismissFileUploadError(index: number): void {
            this.fileUploadErrors.splice(index, 1);
        }

        //#endregion
    }

    export class ActivityTypeCheckBox {

        id: number;
        text: string;
        checked: KnockoutObservable<boolean>
        private _owner: ActivityForm;

        constructor(mappingOptions: KnockoutMappingCreateOptions, owner: ActivityForm) {

            this.id = mappingOptions.data.id;
            this.text = mappingOptions.data.type;
            this._owner = owner;

            var isChecked = Enumerable.From(this._owner.types())
                .Any((x: number): boolean => {
                    return x == this.id;
                });
            this.checked = ko.observable(isChecked);

            this.checked.subscribe((newValue: boolean): void => {
                if (newValue) this._onChecked();
                else this._onUnchecked();
            });
        }

        private _onChecked(): void {
            var needsAdded = Enumerable.From(this._owner.types())
                .All((x: number): boolean => {
                    return x != this.id;
                });
            if (!needsAdded) return;

            this._owner.isSaving(true);
            var url = $('#type_api').text().format(this._owner.activityId(), this.id);
            $.ajax({
                url: url,
                type: 'PUT',
            })
                .done((): void => {
                    this._owner.types.push(this.id);
                    setTimeout((): void => {
                        this.checked(true);
                    }, 0);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to add this activity type, please try again', true);
                    setTimeout((): void => {
                        this.checked(false);
                    }, 0);
                })
                .always((): void => { this._owner.isSaving(false); });
        }

        private _onUnchecked(): void {
            var needsRemoved = Enumerable.From(this._owner.types())
                .Any((x: number): boolean => {
                    return x == this.id;
                });
            if (!needsRemoved) return;

            this._owner.isSaving(true);
            var url = $('#type_api').text()
                .format(this._owner.activityId(), this.id);
            $.ajax({
                url: url,
                type: 'DELETE',
            })
                .done((): void => {
                    this._owner.types.remove(this.id);
                    setTimeout((): void => {
                        this.checked(false);
                    }, 0);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to remove this activity type, please try again', true);
                    setTimeout((): void => {
                        this.checked(true);
                    }, 0);
                })
                .always((): void => { this._owner.isSaving(false); });
        }
    }

    export class FormattedDateInput {

        input: KnockoutObservable<string> = ko.observable();
        kendoDatePicker: any;
        private static _defaultFormat = 'M/d/yyyy';

        constructor(isoFormattedDate: string, format: string) {

            if (!isoFormattedDate) return;

            var date = moment(isoFormattedDate).toDate();
            format = format || FormattedDateInput._defaultFormat;
            var input = moment(date).format(format.toUpperCase());
            this.input(input);

            this.input.subscribe((newValue: string): void => {
                var trimmedValue = $.trim(newValue);
                if (trimmedValue != newValue)
                    this.input(trimmedValue);
            });

            this.format.subscribe((newValue: string): void => {
                if (this.kendoDatePicker)
                    this.kendoDatePicker.options.format = newValue || FormattedDateInput._defaultFormat;
            });
        }

        format: KnockoutComputed<string> = ko.computed((): string => { // depends on observable input
            return this._computeDateFormat(this.input());
        });

        date: KnockoutComputed<Date> = ko.computed((): Date => { // depends on computed format (& input)
            var input = this.input();
            if (!input) return undefined;
            return moment(input, [this.format().toUpperCase()]).toDate();
        });

        isoString: KnockoutComputed<string> = ko.computed((): string => { // depends on computed date
            var date = this.date();
            if (!date) return undefined;
            return moment(date).utc().hours(0).format();
        });

        //#region input formatting

        private static _yyyy: RegExp = new RegExp('^\\d{4}$');
        private static _mYyyy: RegExp = new RegExp('^\\d{1}/\\d{4}$');
        private static _mmYyyy: RegExp = new RegExp('^\\d{2}/\\d{4}$');
        private static _mxYyyy: RegExp = new RegExp('^\\d{1,}/\\d{4}$');
        private static _mDYyyy: RegExp = new RegExp('^\\d{1}/\\d{1}/\\d{4}$');
        private static _mmDYyyy: RegExp = new RegExp('^\\d{2}/\\d{1}/\\d{4}$');
        private static _mDdYyyy: RegExp = new RegExp('^\\d{1}/\\d{2}/\\d{4}$');
        private static _mmDdYyyy: RegExp = new RegExp('^\\d{2}/\\d{2}/\\d{4}$');
        private static _mxDxYyyy: RegExp = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

        private _computeDateFormat(input: string): string {
            if (!input) return undefined;
            if (FormattedDateInput._yyyy.test(input)) return 'yyyy';
            else if (FormattedDateInput._mYyyy.test(input)) return 'M/yyyy';
            else if (FormattedDateInput._mmYyyy.test(input)) return 'MM/yyyy';
            else if (FormattedDateInput._mDYyyy.test(input)) return 'M/d/yyyy';
            else if (FormattedDateInput._mmDYyyy.test(input)) return 'MM/d/yyyy';
            else if (FormattedDateInput._mDdYyyy.test(input)) return 'M/dd/yyyy';
            return 'MM/dd/yyyy';
        }

        //#endregion

        isValid(): boolean {
            var input = this.input(), format = this.format();
            return !input || moment(input, format).isValid();
        }
    }
}
