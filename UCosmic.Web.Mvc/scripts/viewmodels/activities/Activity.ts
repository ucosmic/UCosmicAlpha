/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/tinymce/tinymce.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
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
        activityTypes: KnockoutObservableArray<any> = ko.observableArray();

        // Data bound to new tag textArea
        newTag: KnockoutObservable<string> = ko.observable();
        newEstablishment: any; // Because KendoUI autocomplete does not offer dataValueField.

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

            //#region load places dropdown, module settings, and activity work copy

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

            // only process after all requests have been resolved
            $.when(typesPact, locationsPact, dataPact)
                .done((types: Service.ApiModels.IEmployeeActivityType[],
                    locations: Service.ApiModels.IActivityLocation[],
                    data: Service.ApiModels.IObservableActivity): void => {

                    //#region populate lookup lists

                    this.activityTypes = ko.mapping.fromJS(types);
                    this.locations = ko.mapping.fromJS(locations);

                    //#endregion
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
                    //#region initialize selected place id's and checked activity types

                    /* Initialize the list of selected locations with current locations in values. */
                    for (var i = 0; i < this.values.locations().length; i += 1) {
                        this.kendoPlaceIds.push(this.values.locations()[i].placeId());
                    }

                    /* Check the activity types checkboxes if the activity type exists in values. */
                    for (var i = 0; i < this.activityTypes().length; i += 1) {
                        this.activityTypes()[i].checked = ko.computed(this.defHasActivityTypeCallback(i));
                    }

                    //#endregion

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
                });

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
                    this._currentPlaceIds = e.sender.value().slice(0);
                },
                change: (e: kendo.ui.MultiSelectEvent): void => {
                    // find out if a place was added or deleted
                    var newPlaceIds = e.sender.value();
                    var addedPlaceIds: number[] = $(newPlaceIds).not(this._currentPlaceIds).get();
                    var removedPlaceIds: number[] = $(this._currentPlaceIds).not(newPlaceIds).get();

                    if (addedPlaceIds.length === 1) {
                        var addedPlaceId = addedPlaceIds[0];
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

                    else if (removedPlaceIds.length === 1) {
                        var removedPlaceId = removedPlaceIds[0];
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

                    this.values.locations.removeAll();
                    for (var i = 0; i < this._currentPlaceIds.length; i++) {
                        var location = ko.mapping.fromJS({ id: 0, placeId: this._currentPlaceIds[i], version: '' });
                        this.values.locations.push(location);
                    }
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
                dataTextField: 'officialName',
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: (options: any): void => {
                            $.ajax({
                                url: App.Routes.WebApi.Establishments.get(),
                                data: {
                                    keyword: options.data.filter.filters[0].value,
                                    pageNumber: 1,
                                    pageSize: App.Constants.int32Max
                                },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: (e: any): void => {
                    var me = $('#' + newTagId).data('kendoAutoComplete');
                    var dataItem = me.dataItem(e.item.index());
                    this.newEstablishment = { officialName: dataItem.officialName, id: dataItem.id };
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
            this.values.types.subscribe((newValue: any): void => { this.dirtyFlag(true); });
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

        autoSave(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (this.saving) {
                deferred.resolve();
                return deferred;
            }

            if (!this.dirtyFlag() && (this.keyCounter == 0)) {
                deferred.resolve();
                return deferred;
            }

            this.saving = true;

            var model = ko.mapping.toJS(this);

            if (model.values.startsOn != null) {
                var dateStr = $('#fromDatePicker').get(0).value;
                model.values.dateFormat = this.getDateFormat(dateStr);
                model.values.startsOn = this.convertDate(model.values.startsOn);
            }

            if ((this.values.onGoing != null) && (this.values.onGoing())) {
                model.values.endsOn = null;
            }
            else {
                if (model.values.endsOn != null) {
                    model.values.endsOn = this.convertDate(model.values.endsOn);
                }
            }

            this.saveSpinner.start();

            $.ajax({
                type: 'PUT',
                url: App.Routes.WebApi.Activities.put(this.id()),
                data: model
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

                    $.ajax({
                        type: 'PUT',
                        url: App.Routes.WebApi.Activities.putEdit(this.id()),
                        data: { mode: mode }
                    })
                        .done(() => {
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

                            $.ajax({
                                type: 'DELETE',
                                url: App.Routes.WebApi.Activities.del(this.id())
                            })
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

        //#endregion
        //#region Types

        /*
            ActivityTypes Theory of Operation:
    
            Challenge: Present user with a checkbox for each ActivityType as defined
                                    by EmployeeActivityTypes.  User must select at least one
                                    ActivityType.  The ViewModel will maintain a list of
                                    ActivityTypes as selected by the user.
    
            The ViewModel contains both a list of possible ActivityTypes (in the
            activityTypes field) and the array of actually selected ActivityTypes
            in vm.values.types.
    
            In order to support data binding, the ActivityType is augmented with
            a 'checked' property.
    
            The desired behavior is to make use of the 'checked' data binding
            attribute as follows:
    
            <input type="checkbox" data-bind="checked: checked" />
    
            See the 'activity-types-template' for exact usage.
    
            However, checking/unchecking needes to result in an ActivityType
            being added/removed from the Activity.values.types array.
    
            To accomplish this, we use a computed observable that has split
            read and write behavior.  A Read results in interrogating the
            Activity.values.types array for the existence of a typeId. A
            write will either add or remove a typeId depending upon checked
            state.
    
            Due to the use of computed observable array (activityTypes) we need to
            create a closure in order to capture state of array index/element.
        */
        defHasActivityTypeCallback(activityTypeIndex: number): KnockoutComputedDefine<boolean> {
            var def: KnockoutComputedDefine<boolean> = {
                read: (): boolean => {
                    return this.hasActivityType(this.activityTypes()[activityTypeIndex].id());
                },
                write: (checked: boolean) => {
                    if (checked) {
                        this.addActivityType(this.activityTypes()[activityTypeIndex].id());
                    } else {
                        this.removeActivityType(this.activityTypes()[activityTypeIndex].id());
                    }
                },
                owner: this
            };

            return def;
        }

        addActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex == -1) {
                var newActivityType: KnockoutObservable<any> = ko.mapping.fromJS({ id: 0, typeId: activityTypeId, version: '' });
                this.values.types.push(newActivityType);
            }
        }

        removeActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex != -1) {
                var activityType = this.values.types()[existingIndex];
                this.values.types.remove(activityType);
            }
        }

        getTypeName(id: number): string {
            var name: string = '';
            var index: number = this.getActivityTypeIndexById(id);
            if (index != -1) { name = this.activityTypes[index].type; }
            return name;
        }

        getActivityTypeIndexById(activityTypeId: number): number {
            var index: number = -1;

            if ((this.values.types != null) && (this.values.types().length > 0)) {
                var i = 0;
                while ((i < this.values.types().length) &&
                    (activityTypeId != this.values.types()[i].typeId())) { i += 1 }

                if (i < this.values.types().length) {
                    index = i;
                }
            }

            return index;
        }

        hasActivityType(activityTypeId: number): boolean {
            return this.getActivityTypeIndexById(activityTypeId) != -1;
        }

        //#endregion
        //#region Tags

        addTag(item: any, event: Event): void {
            var newText: string = null;
            var domainTypeText: string = 'Custom';
            var domainKey: number = null;
            var isInstitution: boolean = false;
            if (this.newEstablishment == null) {
                newText = this.newTag();
            }
            else {
                newText = this.newEstablishment.officialName;
                domainTypeText = 'Establishment';
                domainKey = this.newEstablishment.id;
                isInstitution = true;
                this.newEstablishment = null;
            }
            newText = (newText != null) ? $.trim(newText) : null;
            if ((newText != null) &&
                (newText.length != 0) &&
                (!this.haveTag(newText))) {
                var tag = {
                    id: 0,
                    number: 0,
                    text: newText,
                    domainTypeText: domainTypeText,
                    domainKey: domainKey,
                    modeText: this.modeText(),
                    isInstitution: isInstitution
                };
                var observableTag = ko.mapping.fromJS(tag);
                this.values.tags.push(observableTag);
            }

            this.newTag(null);
            this.dirtyFlag(true);
        }

        removeTag(item: any, event: Event): void {
            this.values.tags.remove(item);
            this.dirtyFlag(true);
        }

        haveTag(text: string): boolean {
            return this.tagIndex(text) != -1;
        }

        tagIndex(text: string): number {
            var i = 0;
            while ((i < this.values.tags().length) &&
                (text != this.values.tags()[i].text())) {
                i += 1;
            }
            return ((this.values.tags().length > 0) && (i < this.values.tags().length)) ? i : -1;
        }

        //#endregion
        //#region Documents

        private _loadDocuments(): void {
            $.ajax({
                type: 'GET',
                url: App.Routes.WebApi.Activities.Documents.get(this.id(), null, this.modeText())
            })
                .done((documents: any, textStatus: string, jqXhr: JQueryXHR): void => {

                    /* TODO - This needs to be combined with the initial load mapping. */
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
            $(inputElement).focusout(event, (event: any): void => { this.endDocumentTitleEdit(item, event); });
            $(inputElement).keypress(event, (event: any): void => { if (event.which == 13) { inputElement.blur(); } });
        }

        endDocumentTitleEdit(item: Service.ApiModels.IObservableActivityDocument, event: any): void {
            var inputElement = event.target;
            $(inputElement).unbind('focusout');
            $(inputElement).unbind('keypress');
            $(inputElement).attr('disabled', 'disabled');

            $.ajax({
                type: 'PUT',
                url: App.Routes.WebApi.Activities.Documents.rename(this.id(), item.id()),
                data: ko.toJSON(item.title()),
                contentType: 'application/json',
                //dataType: 'json',
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
}
