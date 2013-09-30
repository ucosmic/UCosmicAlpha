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

module ViewModels.Activities {
    export class Activity implements Service.ApiModels.IObservableActivity {

        //#region Class Properties

        private static iconMaxSide: number = 64;

        ready: KnockoutObservable<boolean> = ko.observable(false);

        // Array of all locations offered in Country/Location multiselect
        locations: KnockoutObservableArray<any> = ko.observableArray();

        // Array of placeIds of selected locations, kendo multiselect stores these as strings
        kendoPlaceIds: KnockoutObservableArray<number> = ko.observableArray();
        private _currentPlaceIds: number[];

        // Array of activity types displayed as list of checkboxes
        //activityTypes: KnockoutObservableArray<any> = ko.observableArray();
        activityTypes: KnockoutObservableArray<any> = ko.observableArray();

        // Data bound to new tag textArea
        newTag: KnockoutObservable<string> = ko.observable();
        //newEstablishment: any; // Because KendoUI autocomplete does not offer dataValueField.

        // array to hold file upload errors
        fileUploadErrors: KnockoutObservableArray<any> = ko.observableArray();

        // Old document name - used during document rename.
        previousDocumentTitle: string;

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
        version: KnockoutObservable<string>;                    // byte[] converted to base64
        personId: KnockoutObservable<number>;
        number: KnockoutObservable<number>;
        entityId: KnockoutObservable<string>;                   // guid converted to string
        modeText: KnockoutObservable<string>;
        values: Service.ApiModels.IObservableActivityValues;    // only values for modeText

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

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.Locations.get())
                .done((data: Service.ApiModels.IActivityLocation[]): void => {
                    locationsPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                })
            ;

            var typesPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                .done((data: Service.ApiModels.IEmployeeActivityType[]): void => {
                    typesPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                })
            ;

            var dataPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.get(this.workCopyId()))
                .done((data: Service.ApiModels.IActivityPage): void => {
                    dataPact.resolve(data);
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    dataPact.reject(jqXhr, textStatus, errorThrown);
                })
            ;

            //#endregion
            //#region process after all have been loaded

            $.when(typesPact, locationsPact, dataPact)
                .done((types: Service.ApiModels.IEmployeeActivityType[],
                    locations: Service.ApiModels.IActivityLocation[],
                    data: Service.ApiModels.IObservableActivity): void => {

                    //#region populate activity data

                    // Although the MVC DateTime to JSON serializer will output an ISO compatible
                    // string, we are not guarenteed that a browser's Date(string) or Date.parse(string)
                    // functions will accurately convert to Date.  So, we are using
                    // moment.js to handle the parsing and conversion.
                    var augmentedDocumentModel = function (data) {
                        ko.mapping.fromJS(data, {}, this);
                        this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                    };

                    var mapping = {
                        documents: {
                            create: (options: any): KnockoutObservable<any> => {
                                return new augmentedDocumentModel(options.data);
                            }
                        },
                        startsOn: {
                            create: (options: any): KnockoutObservable<Date> => {
                                return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                            }
                        },
                        endsOn: {
                            create: (options: any): KnockoutObservable<Date> => {
                                return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                            }
                        }
                    };

                    ko.mapping.fromJS(data, mapping, this);

                    //#endregion
                    //#region populate places multiselect

                    // map places multiselect datasource to locations
                    this.locations = ko.mapping.fromJS(locations);

                    // Initialize the list of selected locations with current locations in values
                    var currentPlaceIds = Enumerable.From(this.values.locations())
                        .Select(function (x): any {
                            return x.placeId();
                        }).ToArray();
                    this.kendoPlaceIds(currentPlaceIds.slice(0));

                    //#endregion
                    //#region populate type checkboxes

                    this._populateTypes(types);

                    //#endregion

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
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
                /* If user clicks date picker button, reset format */
                open: function (e) { this.options.format = 'MM/dd/yyyy'; }
            });

            $('#' + toDatePickerId).kendoDatePicker({
                open: function (e) { this.options.format = 'MM/dd/yyyy'; }
            });

            //#endregion
            //#region Kendo MultiSelect for Places

            $('#' + countrySelectorId).kendoMultiSelect({
                filter: 'contains',
                ignoreCase: 'true',
                dataTextField: 'officialName()',
                dataValueField: 'id()',
                dataSource: this.locations(),
                value: this.kendoPlaceIds(),
                dataBound: (e: kendo.ui.MultiSelectEvent): void => {
                    this._onPlaceMultiSelectDataBound(e);
                },
                change: (e: kendo.ui.MultiSelectEvent): void => {
                    this._onPlaceMultiSelectChange(e);
                },
                placeholder: '[Select Country/Location, Body of Water or Global]'
            });

            //#endregion
            //#region Kendo Upload

            var invalidFileNames: string[] = [];
            $('#' + uploadFileId).kendoUpload({
                multiple: true,
                showFileList: false,
                localization: {
                    select: 'Choose one or more documents to share...'
                },
                async: {
                    saveUrl: App.Routes.WebApi.Activities.Documents.post(this.id(), this.modeText())
                },
                select: (e: kendo.ui.UploadSelectEvent): void => {
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
                                if (xhr.status === 400) {
                                    if ($.inArray(e.files[i].name, invalidFileNames) < 0)
                                        invalidFileNames.push(file.name);
                                    this.fileUploadErrors.push({
                                        message: xhr.responseText
                                    });
                                }
                            });
                    }
                },
                upload: (e: kendo.ui.UploadUploadEvent): void => {
                    var file = e.files[0];
                    var indexOfInvalidName = $.inArray(file.name, invalidFileNames);
                    if (indexOfInvalidName >= 0) {
                        e.preventDefault();
                        invalidFileNames.splice(indexOfInvalidName, 1);
                        return;
                    }
                },
                success: (e: kendo.ui.UploadSuccessEvent): void => {
                    this._loadDocuments();
                },
                error: (e: kendo.ui.UploadErrorEvent): void => {
                    if (e.XMLHttpRequest.responseText &&
                        e.XMLHttpRequest.responseText.length < 1000) {
                        this.fileUploadErrors.push({
                            message: e.XMLHttpRequest.responseText
                        });
                    }
                    else {
                        this.fileUploadErrors.push({
                            message: 'UCosmic experienced an unexpected error uploading your document, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.'
                        });
                    }
                }
            });

            //#endregion
            //#region Kendo AutoComplete for Tags

            $('#' + newTagId).kendoAutoComplete({
                minLength: 3,
                placeholder: '[Enter tag or keyword]',
                dataTextField: 'text',
                dataSource: this._getTagAutoCompleteDataSource(),
                select: (e: kendo.ui.AutoCompleteSelectEvent): void => {
                    this._onTagAutoCompleteSelect(e);
                }
            });

            //#endregion
        }

        //#endregion
        //#region Knockout Validation setup

        setupValidation(): void {
            ko.validation.rules['atLeast'] = {
                validator: (val: any, otherVal: any): boolean => {
                    return val.length >= otherVal;
                },
                message: 'At least {0} must be selected.'
            };

            ko.validation.rules['nullSafeDate'] = {
                validator: (val: any, otherVal: any): boolean => {
                    var valid: boolean = true;
                    var format: string = null;
                    var YYYYPattern = new RegExp('^\\d{4}$');
                    var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
                    var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

                    if ((val != null) && (val.length > 0)) {
                        val = $.trim(val);

                        if (YYYYPattern.test(val)) {
                            val = '01/01/' + val;
                            format = 'YYYY';
                        }
                        else if (MMYYYYPattern.test(val)) {
                            format = 'MM/YYYY';
                        }
                        else if (MMDDYYYYPattern.test(val)) {
                            format = 'MM/DD/YYYY';
                        }

                        valid = (format != null) ? moment(val, format).isValid() : false;
                    }

                    return valid;
                },
                message: 'Date must be valid.'
            };

            ko.validation.registerExtenders();

            ko.validation.group(this.values);

            this.values.title.extend({ required: true, minLength: 1, maxLength: 500 });
            this.values.locations.extend({ atLeast: 1 });
            if (this.activityTypes().length)
                this.values.types.extend({ atLeast: 1 });
            this.values.startsOn.extend({ nullSafeDate: { message: 'Start date must valid.' } });
            this.values.endsOn.extend({ nullSafeDate: { message: 'End date must valid.' } });
        }

        //#endregion
        //#region Value subscriptions setup

        setupSubscriptions(): void {
            /* Autosave when fields change. */
            this.values.title.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.content.subscribe((newValue: any): void => { this.keyCountAutoSave(newValue); });
            this.values.startsOn.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.endsOn.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.wasExternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.wasInternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.values.types.subscribe((newValue: any): void => { this.dirtyFlag(true); });
        }

        //#endregion
        //#region Date formatting & conversion

        getDateFormat(dateStr: string): string {
            var format: string = null;
            var YYYYPattern = new RegExp('^\\d{4}$');
            var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
            var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

            if ((dateStr != null) && (dateStr.length > 0)) {
                dateStr = $.trim(dateStr);

                if (YYYYPattern.test(dateStr)) {
                    format = 'yyyy';
                }
                else if (MMYYYYPattern.test(dateStr)) {
                    format = 'MM/yyyy';
                }
                else {
                    format = 'MM/dd/yyyy';
                }
            }

            return format;
        }

        convertDate(date: any): string {
            var formatted = null;
            var YYYYPattern = new RegExp('^\\d{4}$');
            var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
            var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

            if (typeof (date) === 'object') {
                formatted = moment(date).format();
            }
            else {
                var dateStr = date;
                if ((dateStr != null) && (dateStr.length > 0)) {
                    dateStr = $.trim(dateStr);

                    if (YYYYPattern.test(dateStr)) {
                        dateStr = '01/01/' + dateStr; // fixes Moment rounding error
                        formatted = moment(dateStr, ['MM/DD/YYYY']).format();
                    }
                    else if (MMYYYYPattern.test(dateStr)) {
                        formatted = moment(dateStr, ['MM/YYYY']).format();
                    }
                    else if (MMDDYYYYPattern.test(dateStr)) {
                        formatted = moment(dateStr, ['MM/DD/YYYY']).format();
                    }
                }
            }

            return formatted;
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

            if (model.values.startsOn != null) {
                var dateStr = $('#fromDatePicker').get(0).value;
                model.values.dateFormat = this.getDateFormat(dateStr);
                model.values.startsOn = this.convertDate(model.values.startsOn);
            }

            if (model.values.onGoing) {
                model.values.endsOn = null;
            }
            else if (model.values.endsOn != null) {
                model.values.endsOn = this.convertDate(model.values.endsOn);
            }

            var url = $('#activity_put_url_format').text().format(this.id());
            $.ajax({
                type: 'PUT',
                //url: App.Routes.WebApi.Activities.put(this.id()),
                url: url,
                data: {
                    mode: model.modeText,
                    title: model.values.title,
                    content: model.values.content,
                    startsOn: model.values.startsOn,
                    endsOn: model.values.endsOn,
                    dateFormat: model.values.dateFormat,
                    onGoing: model.values.onGoing,
                    wasExternallyFunded: model.values.wasExternallyFunded,
                    wasInternallyFunded: model.values.wasInternallyFunded,
                },
            })
                .done((): void => {
                    deferred.resolve();
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(jqXhr, textStatus, errorThrown);
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

                    if (!this.values.isValid()) {
                        this.values.errors.showAllMessages();
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
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
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

        private _onPlaceMultiSelectDataBound(e: kendo.ui.MultiSelectEvent): void {
            this._currentPlaceIds = e.sender.value().slice(0);
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

            this.values.locations.removeAll();
            for (var i = 0; i < this._currentPlaceIds.length; i++) {
                var location = ko.mapping.fromJS({ id: 0, placeId: this._currentPlaceIds[i], version: '' });
                this.values.locations.push(location);
            }
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
                })
                .fail((xhr: JQueryXHR): void => { // add back to ui
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(this._currentPlaceIds);
                });
        }

        //#endregion
        //#region Types

        private _populateTypes(types: Service.ApiModels.IEmployeeActivityType[]): void {
            var typesMapping: KnockoutMappingOptions = {
                create: (options: KnockoutMappingCreateOptions): any => {
                    var checkBox = new ActivityTypeCheckBox(options);
                    var isChecked = Enumerable.From(this.values.types())
                        .Any(function (x: any): boolean {
                            return x.typeId() == checkBox.id;
                        });
                    checkBox.checked(isChecked);
                    checkBox.checked.subscribe((newValue: boolean): void => {
                        if (newValue) this._addType(checkBox);
                        else this._removeType(checkBox);
                    });
                    return checkBox;
                }
            };
            ko.mapping.fromJS(types, typesMapping, this.activityTypes);
        }

        private _addType(checkBox: ActivityTypeCheckBox): void {
            var needsAdded = Enumerable.From(this.values.types())
                .All(function (x): boolean {
                    return x.typeId() != checkBox.id;
                });
            if (needsAdded) {
                var url = $('#type_put_url_format').text().format(this.id(), checkBox.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    async: false
                })
                    .done((): void => {
                        this.values.types.push({
                            id: ko.observable(0),
                            typeId: ko.observable(checkBox.id),
                            version: ko.observable('')
                        });
                    })
                    .fail((xhr: JQueryXHR): void => {
                        App.Failures.message(xhr, 'while trying to add this activity type, please try again', true);
                        setTimeout(function () {
                            checkBox.checked(!checkBox.checked());
                        }, 0);
                    });
            }
        }

        private _removeType(checkBox: ActivityTypeCheckBox): void {
            var needsRemoved = Enumerable.From(this.values.types())
                .Any(function (x): boolean {
                    return x.typeId() == checkBox.id;
                });
            if (needsRemoved) {
                var url = $('#type_delete_url_format').text()
                    .format(this.id(), checkBox.id);
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    async: false
                })
                    .done((): void => {
                        var type = Enumerable.From(this.values.types())
                            .Single(function (x: any): boolean {
                                return x.typeId() == checkBox.id;
                            });
                        this.values.types.remove(type);
                    })
                    .fail((xhr: JQueryXHR): void => {
                        App.Failures.message(xhr, 'while trying to remove this activity type, please try again', true);
                        setTimeout(function () {
                            checkBox.checked(!checkBox.checked());
                        }, 0);
                    });
            }
        }

        //#endregion
        //#region Tags

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

        deleteTag(item: any): void {
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
                var tagToReplace = Enumerable.From(this.values.tags())
                    .SingleOrDefault(undefined, function (x: any): boolean {
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
                    var tag = {
                        text: text,
                        domainTypeText: establishmentId ? 'Establishment' : 'Custom',
                        domainKey: establishmentId,
                    };
                    var observableTag = ko.mapping.fromJS(tag);
                    this.values.tags.push(observableTag);
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
                    var tagToRemove = Enumerable.From(this.values.tags())
                        .SingleOrDefault(undefined, function (x: any): boolean {
                            return text && x.text().toUpperCase() === text.toUpperCase();
                        });
                    if (tagToRemove) this.values.tags.remove(tagToRemove);
                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR): void => { deferred.reject(xhr); });
            return deferred;
        }

        //#endregion
        //#region Documents

        private _loadDocuments(): void {
            var url = $('#documents_get_url_format').text().format(this.id());
            $.ajax({
                type: 'GET',
                //url: App.Routes.WebApi.Activities.Documents.get(this.id(), null, this.modeText()),
                url: url,
                data: {
                    mode: this.modeText(),
                },
            })
                .done((documents: any, textStatus: string, jqXhr: JQueryXHR): void => {

                    // TODO - This needs to be combined with the initial load mapping.
                    var augmentedDocumentModel = function (data) {
                        ko.mapping.fromJS(data, {}, this);
                        this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                    };

                    var mapping = {
                        create: function (options: any) {
                            return new augmentedDocumentModel(options.data);
                        }
                    };

                    var observableDocs = ko.mapping.fromJS(documents, mapping);

                    this.values.documents.removeAll();
                    for (var i = 0; i < observableDocs().length; i += 1) {
                        this.values.documents.push(observableDocs()[i]);
                    }
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load your activity documents', true);
                });
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
                                    this.values.documents.splice(index, 1);
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
            this.previousDocumentTitle = item.title();
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
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                    $(inputElement).hide();
                    $(inputElement).removeAttr('disabled');
                    var textElement = $(inputElement).siblings('#documentTitle')[0];
                    $(textElement).show();
                },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    item.title(this.previousDocumentTitle);
                    $(inputElement).hide();
                    $(inputElement).removeAttr('disabled');
                    var textElement = $(inputElement).siblings('#documentTitle')[0];
                    $(textElement).show();
                    $('#documentRenameErrorDialog > #message')[0].innerText = jqXhr.responseText;
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

        checked: KnockoutObservable<boolean> = ko.observable(false);
        text: string;
        id: number;

        constructor(mappingOptions: KnockoutMappingCreateOptions) {
            this.text = mappingOptions.data.type;
            this.id = mappingOptions.data.id;
        }
    }
}
