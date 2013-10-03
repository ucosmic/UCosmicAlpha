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
/// <reference path="../activities/ServiceApiModel.d.ts" />

module Activities.ViewModels {
    export class Activity implements KnockoutValidationGroup {

        //#region Class Properties

        ready: KnockoutObservable<boolean> = ko.observable(false);

        // Autosave after so many keydowns
        AUTOSAVE_KEYCOUNT: number = 10;
        keyCounter: number = 0;

        // Dirty
        dirtyFlag: KnockoutObservable<boolean> = ko.observable(false);
        dirty: KnockoutComputed<void>;

        // In the process of saving
        saving: boolean = false;
        saveSpinner = new App.Spinner(new App.SpinnerOptions(200));

        // IObservableActivity implemented
        id: KnockoutObservable<number>;
        workCopyId: KnockoutObservable<number>;
        originalId: KnockoutObservable<number>;
        //version: KnockoutObservable<string>;                    // byte[] converted to base64
        //personId: KnockoutObservable<number>;
        //number: KnockoutObservable<number>;
        //entityId: KnockoutObservable<string>;                   // guid converted to string
        modeText: KnockoutObservable<string>;
        values: Service.ApiModels.IObservableActivityValues;    // only values for modeText

        activityId: KnockoutObservable<number> = ko.observable();
        mode: KnockoutObservable<string> = ko.observable();
        title: KnockoutObservable<string> = ko.observable();
        content: KnockoutObservable<string> = ko.observable();
        startsOn: FormattedDateInput;
        endsOn: FormattedDateInput;
        onGoing: KnockoutObservable<boolean> = ko.observable();
        isExternallyFunded: KnockoutObservable<boolean> = ko.observable();
        isInternallyFunded: KnockoutObservable<boolean> = ko.observable();

        //#endregion
        //#region Construction & Initialization

        constructor(activityId: number, activityWorkCopyId: number) {
            this._initialize(activityId, activityWorkCopyId);
        }

        private _initialize(activityId: number, activityWorkCopyId: number): void {
            this.id = ko.observable(activityId);
            this.originalId = ko.observable(activityId);
            this.workCopyId = ko.observable(activityWorkCopyId);

            this.dirty = ko.computed((): void => {
                if (this.dirtyFlag()) {
                    this.autoSave();
                }
            });
        }

        //#endregion
        //#region Initial data load

        load(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            //#region load places dropdown, module types, and activity work copy

            var placeOptionsPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.Locations.get())
                .done((data: any[]): void => { placeOptionsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { placeOptionsPact.reject(xhr); });

            var typeOptionsPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                .done((data: any[]): void => { typeOptionsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { typeOptionsPact.reject(xhr); });

            var dataPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.get(this.workCopyId()))
                .done((data: Service.ApiModels.IActivityPage): void => { dataPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { dataPact.reject(xhr); });

            var data2Pact = $.Deferred();
            $.get($('#activity_get_url_format').text().format(this.workCopyId()))
                .done((data: any): void => { data2Pact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { data2Pact.reject(xhr); });

            var placesPact = $.Deferred();
            $.get($('#places_get_url_format').text().format(this.workCopyId()))
                .done((data: any[]): void => { placesPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { placesPact.reject(xhr); });

            var typesPact = $.Deferred();
            $.get($('#types_get_url_format').text().format(this.workCopyId()))
                .done((data: ApiModels.ActivityType[]): void => { typesPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { typesPact.reject(xhr); });

            var tagsPact = $.Deferred();
            $.get($('#tags_get_url_format').text().format(this.workCopyId()))
                .done((data: ApiModels.ActivityType[]): void => { tagsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { tagsPact.reject(xhr); });

            var documentsPact = $.Deferred();
            $.get($('#documents_get_url_format').text().format(this.workCopyId()))
                .done((data: any[]): void => { documentsPact.resolve(data); })
                .fail((xhr: JQueryXHR): void => { documentsPact.reject(xhr); });

            //#endregion
            //#region process after all have been loaded

            $.when(typeOptionsPact, placeOptionsPact, dataPact, data2Pact, placesPact, typesPact, tagsPact, documentsPact)
                .done((typeOptions: any[],
                    placeOptions: any[],
                    data: Service.ApiModels.IObservableActivity,
                    data2: any,
                    selectedPlaces: any[],
                    selectedTypes: ApiModels.ActivityType[],
                    tags: ApiModels.ActivityTag[],
                    documents: any[]): void => {

                    //#region populate activity data

                    ko.mapping.fromJS(documents, {}, this.documents);

                    // Although the MVC DateTime to JSON serializer will output an ISO compatible
                    // string, we are not guarenteed that a browser's Date(string) or Date.parse(string)
                    // functions will accurately convert to Date.  So, we are using
                    // moment.js to handle the parsing and conversion.
                    //var augmentedDocumentModel = function (data) {
                    //    ko.mapping.fromJS(data, {}, this);
                    //    this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                    //};

                    var mapping = {
                        //documents: {
                        //    create: (options: any): KnockoutObservable<any> => {
                        //        return new augmentedDocumentModel(options.data);
                        //    }
                        //},
                    };
                    ko.mapping.fromJS(data, mapping, this);

                    var mapping2 = {
                        ignore: ['startsOn', 'endsOn', 'startsFormat', 'endsFormat'],
                    };
                    ko.mapping.fromJS(data2, mapping2, this);

                    this.startsOn = new FormattedDateInput(data2.startsOn, data2.startsFormat);
                    this.endsOn = new FormattedDateInput(data2.endsOn, data2.endsFormat);

                    //#endregion
                    //#region populate places multiselect

                    // map places multiselect datasource to locations
                    ko.mapping.fromJS(placeOptions, {}, this.placeOptions);

                    // Initialize the list of selected locations with current locations in values
                    this.selectedPlaces(selectedPlaces);
                    var currentPlaceIds = Enumerable.From(selectedPlaces)
                        .Select(function (x): any {
                            return x.placeId;
                        }).ToArray();
                    this.kendoPlaceIds(currentPlaceIds.slice(0));

                    //#endregion
                    //#region set up type checkboxes

                    this._bindTypes(typeOptions, selectedTypes);

                    //#endregion

                    this.tags(tags);

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => {
                    deferred.reject(xhr);
                });

            //#endregion

            return deferred;
        }

        //#endregion
        //#region Kendo widget setup

        setupWidgets(fromDatePickerId: string, toDatePickerId: string, countrySelectorId: string,
            uploadFileId: string, newTagId: string): void {

            //#region Kendo DatePickers

            $('#' + fromDatePickerId).kendoDatePicker({
                value: this.startsOn.date(),
                format: this.startsOn.format(),
                // if user clicks date picker button, reset format
                open: function (e: kendo.ui.DatePickerEvent) {
                    this.options.format = 'M/d/yyyy';
                },
            });
            this.startsOn.kendoDatePicker = $('#' + fromDatePickerId).data('kendoDatePicker');

            $('#' + toDatePickerId).kendoDatePicker({
                value: this.endsOn.date(),
                format: this.endsOn.format(),
                open: function (e) {
                    this.options.format = 'M/d/yyyy';
                },
            });
            this.endsOn.kendoDatePicker = $('#' + toDatePickerId).data('kendoDatePicker');

            //#endregion

            this._initPlacesKendoMultiSelect();
            this._initDocumentsKendoUpload();
            this._initTagsKendoAutoComplete();
        }

        //#endregion
        //#region Knockout Validation setup

        errors: KnockoutValidationErrors;
        isValid: () => boolean;

        setupValidation(): void {
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

            ko.validation.group(this.values);
            ko.validation.group(this);

            this.title.extend({ required: true, minLength: 1, maxLength: 500 });
            this.selectedPlaces.extend({ atLeast: 1 });
            if (this.typeOptions().length)
                this.selectedTypeIds.extend({ atLeast: 1 });

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
        //#region Value subscriptions setup

        setupSubscriptions(): void {
            /* Autosave when fields change. */
            this.title.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.content.subscribe((newValue: any): void => { this.keyCountAutoSave(newValue); });
            this.startsOn.input.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.endsOn.input.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.isExternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.isInternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
        }

        //#endregion
        //#region Saving

        keyCountAutoSave(newValue: any): void {
            this.keyCounter += 1;
            if (this.keyCounter >= this.AUTOSAVE_KEYCOUNT) {
                this.dirtyFlag(true);
                this.keyCounter = 0;
            }
        }

        _isSaved: boolean = false;
        _isDeleted: boolean = false;

        autoSave(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();
            if (this._isSaved || this._isDeleted || this.saving || (!this.dirtyFlag() && this.keyCounter == 0)) {
                deferred.resolve();
                return deferred;
            }

            this.saveSpinner.start();
            this.saving = true;

            var model = ko.mapping.toJS(this);

            var url = $('#activity_put_url_format').text().format(this.id());
            var data = {
                mode: model.modeText,
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
                //url: App.Routes.WebApi.Activities.put(this.id()),
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
                    this.dirtyFlag(false);
                    this.saveSpinner.stop();
                    this.saving = false;
                });

            return deferred;
        }

        private _save(mode: string): void {
            this.autoSave() // play through the autosave function first
                .done((data: any): void => {

                    if (!this.values.isValid() || !this.isValid()) {
                        this.values.errors.showAllMessages();
                        this.errors.showAllMessages();
                        return;
                    }

                    this.saveSpinner.start();

                    var url = $('#activity_replace_url_format').text().format(this.workCopyId(), this.originalId(), mode);
                    $.ajax({
                        type: 'PUT',
                        //url: App.Routes.WebApi.Activities.putEdit(this.id()),
                        url: url,
                        //data: { mode: mode }
                    })
                        .done(() => {
                            this._isSaved = true; // prevent tinymce onbeforeunload from updating again
                            location.href = App.Routes.Mvc.My.Profile.get();
                        })
                        .fail((xhr: JQueryXHR): void => {
                            App.Failures.message(xhr, 'while trying to save your activity', true);
                        })
                        .always((): void => {
                            this.dirtyFlag(false);
                            this.saveSpinner.stop();
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

                            var url = $('#activity_delete_url_format').text().format(this.id());
                            $.ajax({
                                type: 'DELETE',
                                //url: App.Routes.WebApi.Activities.del(this.id())
                                url: url,
                            })
                                .done((): void => {
                                    $dialog.dialog('close');
                                    this._isDeleted = true; // prevent tinymce onbeforeunload from updating again
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

        //#endregion
        //#region Places

        selectedPlaces: KnockoutObservableArray<any> = ko.observableArray(); // array of places for this activity
        placeOptions: KnockoutObservableArray<any> = ko.observableArray(); // Array of all locations offered in Country/Location multiselect
        kendoPlaceIds: KnockoutObservableArray<number> = ko.observableArray(); // Array of placeIds of selected locations, kendo multiselect stores these as strings
        private _currentPlaceIds: number[];

        private _initPlacesKendoMultiSelect(): void {
            $('#countrySelector').kendoMultiSelect({
                filter: 'contains',
                ignoreCase: 'true',
                dataTextField: 'officialName()',
                dataValueField: 'id()',
                dataSource: this.placeOptions(),
                value: this.kendoPlaceIds(),
                dataBound: (e: kendo.ui.MultiSelectEvent): void => {
                    this._currentPlaceIds = e.sender.value().slice(0);
                },
                change: (e: kendo.ui.MultiSelectEvent): void => {
                    this._onPlaceMultiSelectChange(e);
                },
                placeholder: '[Select Country/Location, Body of Water or Global]'
            });

        }

        private _onPlaceMultiSelectChange(e: kendo.ui.MultiSelectEvent): void {
            // find out if a place was added or deleted
            var newPlaceIds = e.sender.value();
            var addedPlaceIds: number[] = $(newPlaceIds).not(this._currentPlaceIds).get();
            var removedPlaceIds: number[] = $(this._currentPlaceIds).not(newPlaceIds).get();

            if (addedPlaceIds.length === 1)
                this._addPlaceId(addedPlaceIds[0], e);

            else if (removedPlaceIds.length === 1)
                this._removePlaceId(removedPlaceIds[0], e);
        }

        private _addPlaceId(addedPlaceId: number, e: kendo.ui.MultiSelectEvent): void {
            var url = $('#place_put_url_format').text()
                .format(this.id(), addedPlaceId);
            $.ajax({
                type: 'PUT',
                url: url,
                async: false
            })
                .done((): void => {
                    this._currentPlaceIds.push(addedPlaceId);
                    var dataItem = Enumerable.From(e.sender.dataItems())
                        .Single(function (x: any): any {
                            return x.id() == addedPlaceId;
                        });
                    this.selectedPlaces.push({
                        activityId: this.id(),
                        placeId: addedPlaceId,
                        placeName: dataItem.officialName(),
                    });
                })
                .fail((xhr: JQueryXHR): void => { // remove from ui
                    App.Failures.message(xhr, 'while trying to add this location, please try again', true);
                    var restored = this._currentPlaceIds.slice(0);
                    e.sender.dataSource.filter({});
                    e.sender.value(restored);
                    this._currentPlaceIds = restored;
                });
        }

        private _removePlaceId(removedPlaceId: number, e: kendo.ui.MultiSelectEvent): void {
            var url = $('#place_delete_url_format').text()
                .format(this.id(), removedPlaceId);
            $.ajax({
                type: 'DELETE',
                url: url,
                async: false
            })
                .done((): void => {
                    var index = $.inArray(removedPlaceId, this._currentPlaceIds);
                    this._currentPlaceIds.splice(index, 1);
                    this.selectedPlaces.remove(function (x: any): any {
                        return x.placeId == removedPlaceId;
                    });
                })
                .fail((xhr: JQueryXHR): void => { // add back to ui
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(this._currentPlaceIds);
                });
        }

        //#endregion
        //#region Types

        typeOptions: KnockoutObservableArray<ActivityTypeCheckBox> = ko.observableArray(); // array of activity type options displayed as list of checkboxes
        selectedTypeIds: KnockoutObservableArray<number> = ko.observableArray(); // array of selected activity type data

        private _bindTypes(typeOptions: any[], selectedTypes: ApiModels.ActivityType[]): void {
            var selectedTypeIds = Enumerable.From(selectedTypes)
                .Select(function (x: ApiModels.ActivityType): number {
                    return x.typeId;
                }).ToArray();
            this.selectedTypeIds(selectedTypeIds);
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

        tags: KnockoutObservableArray<ApiModels.ActivityTag> = ko.observableArray(); // Data bound to new tag textArea
        newTag: KnockoutObservable<string> = ko.observable();

        private _initTagsKendoAutoComplete(): void {
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
                            url: $('#establishment_names_get_url_format').text(),
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
            var url = $('#establishment_names_get_url_format').text();
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

        deleteTag(item: ApiModels.ActivityTag): void {
            this._deleteTag(item.text)
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
                    .SingleOrDefault(undefined, function (x: ApiModels.ActivityTag): boolean {
                        return x.text.toUpperCase() === text.toUpperCase();
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
            var url = $('#tag_post_url_format').text().format(this.id());
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    text: text,
                    domainType: establishmentId ? 'Establishment' : 'Custom',
                    domainKey: establishmentId,
                },
            })
                .done((): void => { // push observable tag into view's array
                    var tag: ApiModels.ActivityTag = {
                        activityId: this.id(),
                        text: text,
                        domainType: establishmentId ? 'Establishment' : 'Custom',
                        domainKey: establishmentId,
                    };
                    this.tags.push(tag);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
            return deferred;
        }

        private _deleteTag(text: string): JQueryDeferred<any> {
            var deferred = $.Deferred();
            var url = $('#tag_delete_url_format').text().format(this.id());
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
                        .SingleOrDefault(undefined, function (x: ApiModels.ActivityTag): boolean {
                            return text && x.text.toUpperCase() === text.toUpperCase();
                        });
                    if (tagToRemove) this.tags.remove(tagToRemove);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
            return deferred;
        }

        //#endregion
        //#region Documents

        private static iconMaxSide: number = 64; // max width or height of the document icon
        documents: KnockoutObservableArray<any> = ko.observableArray();
        fileUploadErrors: KnockoutObservableArray<any> = ko.observableArray(); // array to hold file upload errors
        private _previousDocumentTitle: string; // old document name - used during document rename
        private _invalidFileNames: KnockoutObservableArray<string> = ko.observableArray([]);

        private _initDocumentsKendoUpload(): void {
            $('#uploadFile').kendoUpload({
                multiple: true,
                showFileList: false,
                localization: { select: 'Choose one or more documents to share...' },
                async: { saveUrl: $('#document_post_url_format').text().format(this.activityId()), },
                select: (e: kendo.ui.UploadSelectEvent): void => { this._onDocumentKendoSelect(e); },
                upload: (e: kendo.ui.UploadUploadEvent): void => { this._onDocumentKendoUpload(e); },
                success: (e: kendo.ui.UploadSuccessEvent): void => { this._onDocumentKendoSuccess(e); },
                error: (e: kendo.ui.UploadErrorEvent): void => { this._onDocumentKendoError(e); },
            });
        }

        private _onDocumentKendoSelect(e: kendo.ui.UploadSelectEvent): void {
            for (var i = 0; i < e.files.length; i++) {
                var file = e.files[i];
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: App.Routes.WebApi.Activities.Documents.validateUpload(),
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
        }

        private _onDocumentKendoSuccess(e: kendo.ui.UploadSuccessEvent): void {
            var location = e.XMLHttpRequest.getResponseHeader('location');
            $.get(location)
                .done((data: any): void => {
                    var document = ko.mapping.fromJS(data);
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
            var url = $('#document_icon_url_format').text().format(this.id(), documentId);
            var params = { maxSide: Activity.iconMaxSide };
            return '{0}?{1}'.format(url, $.param(params));
        }

        deleteDocument(item: any, index: number): void {
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
                                url: App.Routes.WebApi.Activities.Documents.del(this.id(), item.id())
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

        startDocumentTitleEdit(item: Service.ApiModels.IObservableActivityDocument, event: any): void {
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

        endDocumentTitleEdit(item: Service.ApiModels.IObservableActivityDocument, event: any): void {
            var inputElement = event.target;
            $(inputElement).unbind('focusout');
            $(inputElement).unbind('keypress');
            $(inputElement).attr('disabled', 'disabled');

            var url = $('#document_put_url_format').text().format(this.id(), item.id());
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
        private _owner: Activity;

        constructor(mappingOptions: KnockoutMappingCreateOptions, owner: Activity) {

            this.id = mappingOptions.data.id;
            this.text = mappingOptions.data.type;
            this._owner = owner;

            var isChecked = Enumerable.From(this._owner.selectedTypeIds())
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
            var needsAdded = Enumerable.From(this._owner.selectedTypeIds())
                .All((x: number): boolean => {
                    return x != this.id;
                });
            if (!needsAdded) return;

            this._owner.saveSpinner.start();
            var url = $('#type_put_url_format').text().format(this._owner.id(), this.id);
            $.ajax({
                url: url,
                type: 'PUT',
            })
                .done((): void => {
                    this._owner.selectedTypeIds.push(this.id);
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
                .always((): void => {
                    this._owner.saveSpinner.stop();
                });
        }

        private _onUnchecked(): void {
            var needsRemoved = Enumerable.From(this._owner.selectedTypeIds())
                .Any((x: number): boolean => {
                    return x == this.id;
                });
            if (!needsRemoved) return;

            this._owner.saveSpinner.start();
            var url = $('#type_delete_url_format').text()
                .format(this._owner.id(), this.id);
            $.ajax({
                url: url,
                type: 'DELETE',
            })
                .done((): void => {
                    this._owner.selectedTypeIds.remove(this.id);
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
                .always((): void => {
                    this._owner.saveSpinner.stop();
                });
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
