var ViewModels;
(function (ViewModels) {
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
    (function (Activities) {
        var Activity = (function () {
            //#endregion
            //#region Construction & Initialization
            function Activity(activityId, activityWorkCopyId) {
                this.ready = ko.observable(false);
                // Array of all locations offered in Country/Location multiselect
                this.locations = ko.observableArray();
                // Array of placeIds of selected locations, kendo multiselect stores these as strings
                this.kendoPlaceIds = ko.observableArray();
                // Array of activity types displayed as list of checkboxes
                //activityTypes: KnockoutObservableArray<any> = ko.observableArray();
                this.activityTypes = ko.observableArray();
                // Data bound to new tag textArea
                this.newTag = ko.observable();
                //newEstablishment: any; // Because KendoUI autocomplete does not offer dataValueField.
                // array to hold file upload errors
                this.fileUploadErrors = ko.observableArray();
                // Autosave after so many keydowns
                this.AUTOSAVE_KEYCOUNT = 10;
                this.keyCounter = 0;
                // Dirty
                this.dirtyFlag = ko.observable(false);
                // In the process of saving
                this.saving = false;
                this.saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this._isSaved = false;
                this._isDeleted = false;
                this._initialize(activityId, activityWorkCopyId);
            }
            Activity.prototype._initialize = function (activityId, activityWorkCopyId) {
                var _this = this;
                this.id = ko.observable(activityId);
                this.originalId = ko.observable(activityId);
                this.workCopyId = ko.observable(activityWorkCopyId);

                this.dirty = ko.computed(function () {
                    if (_this.dirtyFlag()) {
                        _this.autoSave();
                    }
                });
            };

            //#endregion
            //#region Initial data load
            Activity.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();

                //#region load places dropdown, module types, and activity work copy
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Locations.get()).done(function (data) {
                    locationsPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });

                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get()).done(function (data) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });

                var dataPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.get(this.workCopyId())).done(function (data) {
                    dataPact.resolve(data);
                }).fail(function (jqXhr, textStatus, errorThrown) {
                    dataPact.reject(jqXhr, textStatus, errorThrown);
                });

                //#endregion
                //#region process after all have been loaded
                $.when(typesPact, locationsPact, dataPact).done(function (types, locations, data) {
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
                            create: function (options) {
                                return new augmentedDocumentModel(options.data);
                            }
                        },
                        startsOn: {
                            create: function (options) {
                                return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                            }
                        },
                        endsOn: {
                            create: function (options) {
                                return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                            }
                        }
                    };

                    ko.mapping.fromJS(data, mapping, _this);

                    //#endregion
                    //#region populate places multiselect
                    // map places multiselect datasource to locations
                    _this.locations = ko.mapping.fromJS(locations);

                    // Initialize the list of selected locations with current locations in values
                    var currentPlaceIds = Enumerable.From(_this.values.locations()).Select(function (x) {
                        return x.placeId();
                    }).ToArray();
                    _this.kendoPlaceIds(currentPlaceIds.slice(0));

                    //#endregion
                    //#region populate type checkboxes
                    _this._populateTypes(types);

                    //#endregion
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });

                //#endregion
                return deferred;
            };

            //#endregion
            //#region Kendo widget setup
            Activity.prototype.setupWidgets = function (fromDatePickerId, toDatePickerId, countrySelectorId, uploadFileId, newTagId) {
                var _this = this;
                //#region Kendo DatePickers
                $('#' + fromDatePickerId).kendoDatePicker({
                    /* If user clicks date picker button, reset format */
                    open: function (e) {
                        this.options.format = 'MM/dd/yyyy';
                    }
                });

                $('#' + toDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = 'MM/dd/yyyy';
                    }
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
                    dataBound: function (e) {
                        _this._onPlaceMultiSelectDataBound(e);
                    },
                    change: function (e) {
                        _this._onPlaceMultiSelectChange(e);
                    },
                    placeholder: '[Select Country/Location, Body of Water or Global]'
                });

                //#endregion
                //#region Kendo Upload
                var invalidFileNames = [];
                $('#' + uploadFileId).kendoUpload({
                    multiple: true,
                    showFileList: false,
                    localization: {
                        select: 'Choose one or more documents to share...'
                    },
                    async: {
                        saveUrl: App.Routes.WebApi.Activities.Documents.post(this.id(), this.modeText())
                    },
                    select: function (e) {
                        for (var i = 0; i < e.files.length; i++) {
                            var file = e.files[i];
                            $.ajax({
                                async: false,
                                type: 'POST',
                                url: App.Routes.WebApi.Activities.Documents.validateUpload(),
                                data: {
                                    name: file.name,
                                    length: file.size
                                }
                            }).fail(function (xhr) {
                                if (xhr.status === 400) {
                                    if ($.inArray(e.files[i].name, invalidFileNames) < 0)
                                        invalidFileNames.push(file.name);
                                    _this.fileUploadErrors.push({
                                        message: xhr.responseText
                                    });
                                }
                            });
                        }
                    },
                    upload: function (e) {
                        var file = e.files[0];
                        var indexOfInvalidName = $.inArray(file.name, invalidFileNames);
                        if (indexOfInvalidName >= 0) {
                            e.preventDefault();
                            invalidFileNames.splice(indexOfInvalidName, 1);
                            return;
                        }
                    },
                    success: function (e) {
                        _this._loadDocuments();
                    },
                    error: function (e) {
                        if (e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000) {
                            _this.fileUploadErrors.push({
                                message: e.XMLHttpRequest.responseText
                            });
                        } else {
                            _this.fileUploadErrors.push({
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
                    select: function (e) {
                        _this._onTagAutoCompleteSelect(e);
                    }
                });
                //#endregion
            };

            //#endregion
            //#region Knockout Validation setup
            Activity.prototype.setupValidation = function () {
                ko.validation.rules['atLeast'] = {
                    validator: function (val, otherVal) {
                        return val.length >= otherVal;
                    },
                    message: 'At least {0} must be selected.'
                };

                ko.validation.rules['nullSafeDate'] = {
                    validator: function (val, otherVal) {
                        var valid = true;
                        var format = null;
                        var YYYYPattern = new RegExp('^\\d{4}$');
                        var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
                        var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

                        if ((val != null) && (val.length > 0)) {
                            val = $.trim(val);

                            if (YYYYPattern.test(val)) {
                                val = '01/01/' + val;
                                format = 'YYYY';
                            } else if (MMYYYYPattern.test(val)) {
                                format = 'MM/YYYY';
                            } else if (MMDDYYYYPattern.test(val)) {
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
            };

            //#endregion
            //#region Value subscriptions setup
            Activity.prototype.setupSubscriptions = function () {
                var _this = this;
                /* Autosave when fields change. */
                this.values.title.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.values.content.subscribe(function (newValue) {
                    _this.keyCountAutoSave(newValue);
                });
                this.values.startsOn.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.values.endsOn.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.values.onGoing.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.values.wasExternallyFunded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.values.wasInternallyFunded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                //this.values.types.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            };

            //#endregion
            //#region Date formatting & conversion
            Activity.prototype.getDateFormat = function (dateStr) {
                var format = null;
                var YYYYPattern = new RegExp('^\\d{4}$');
                var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
                var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

                if ((dateStr != null) && (dateStr.length > 0)) {
                    dateStr = $.trim(dateStr);

                    if (YYYYPattern.test(dateStr)) {
                        format = 'yyyy';
                    } else if (MMYYYYPattern.test(dateStr)) {
                        format = 'MM/yyyy';
                    } else {
                        format = 'MM/dd/yyyy';
                    }
                }

                return format;
            };

            Activity.prototype.convertDate = function (date) {
                var formatted = null;
                var YYYYPattern = new RegExp('^\\d{4}$');
                var MMYYYYPattern = new RegExp('^\\d{1,}/\\d{4}$');
                var MMDDYYYYPattern = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');

                if (typeof (date) === 'object') {
                    formatted = moment(date).format();
                } else {
                    var dateStr = date;
                    if ((dateStr != null) && (dateStr.length > 0)) {
                        dateStr = $.trim(dateStr);

                        if (YYYYPattern.test(dateStr)) {
                            dateStr = '01/01/' + dateStr;
                            formatted = moment(dateStr, ['MM/DD/YYYY']).format();
                        } else if (MMYYYYPattern.test(dateStr)) {
                            formatted = moment(dateStr, ['MM/YYYY']).format();
                        } else if (MMDDYYYYPattern.test(dateStr)) {
                            formatted = moment(dateStr, ['MM/DD/YYYY']).format();
                        }
                    }
                }

                return formatted;
            };

            //#endregion
            //#region Saving
            Activity.prototype.keyCountAutoSave = function (newValue) {
                this.keyCounter += 1;
                if (this.keyCounter >= this.AUTOSAVE_KEYCOUNT) {
                    this.dirtyFlag(true);
                    this.keyCounter = 0;
                }
            };

            Activity.prototype.autoSave = function () {
                var _this = this;
                var deferred = $.Deferred();
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
                } else if (model.values.endsOn != null) {
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
                        wasInternallyFunded: model.values.wasInternallyFunded
                    }
                }).done(function () {
                    deferred.resolve();
                }).fail(function (jqXhr, textStatus, errorThrown) {
                    deferred.reject(jqXhr, textStatus, errorThrown);
                }).always(function () {
                    _this.dirtyFlag(false);
                    _this.saveSpinner.stop();
                    _this.saving = false;
                });

                return deferred;
            };

            Activity.prototype._save = function (mode) {
                var _this = this;
                this.autoSave().done(function (data) {
                    if (!_this.values.isValid()) {
                        _this.values.errors.showAllMessages();
                        return;
                    }

                    _this.saveSpinner.start();

                    var url = $('#activity_replace_url_format').text().format(_this.workCopyId(), _this.originalId(), mode);
                    $.ajax({
                        type: 'PUT',
                        //url: App.Routes.WebApi.Activities.putEdit(this.id()),
                        url: url
                    }).done(function () {
                        _this._isSaved = true;
                        location.href = App.Routes.Mvc.My.Profile.get();
                    }).fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to save your activity', true);
                    }).always(function () {
                        _this.dirtyFlag(false);
                        _this.saveSpinner.stop();
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    App.Failures.message(xhr, 'while trying to save your activity', true);
                });
            };

            Activity.prototype.saveDraft = function () {
                this._save('Draft');
            };

            Activity.prototype.publish = function () {
                this._save('Public');
            };

            //#endregion
            //#region Canceling
            Activity.prototype.cancel = function () {
                var _this = this;
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
                            click: function () {
                                var $buttons = $dialog.parents('.ui-dialog').find('button');
                                $.each($buttons, function () {
                                    $(this).attr('disabled', 'disabled');
                                });
                                $dialog.find('.spinner').css('visibility', '');

                                var url = $('#activity_delete_url_format').text().format(_this.id());
                                $.ajax({
                                    type: 'DELETE',
                                    //url: App.Routes.WebApi.Activities.del(this.id())
                                    url: url
                                }).done(function () {
                                    $dialog.dialog('close');
                                    _this._isDeleted = true;
                                    location.href = App.Routes.Mvc.My.Profile.get();
                                }).fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to discard your activity edits', true);
                                }).always(function () {
                                    $.each($buttons, function () {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                            }
                        },
                        {
                            text: 'Do not cancel',
                            click: function () {
                                $dialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };

            //#endregion
            //#region Places
            Activity.prototype._onPlaceMultiSelectDataBound = function (e) {
                this._currentPlaceIds = e.sender.value().slice(0);
            };

            Activity.prototype._onPlaceMultiSelectChange = function (e) {
                // find out if a place was added or deleted
                var newPlaceIds = e.sender.value();
                var addedPlaceIds = $(newPlaceIds).not(this._currentPlaceIds).get();
                var removedPlaceIds = $(this._currentPlaceIds).not(newPlaceIds).get();

                if (addedPlaceIds.length === 1)
                    this._addPlaceId(addedPlaceIds[0], e);
else if (removedPlaceIds.length === 1)
                    this._removePlaceId(removedPlaceIds[0], e);

                this.values.locations.removeAll();
                for (var i = 0; i < this._currentPlaceIds.length; i++) {
                    var location = ko.mapping.fromJS({ id: 0, placeId: this._currentPlaceIds[i], version: '' });
                    this.values.locations.push(location);
                }
            };

            Activity.prototype._addPlaceId = function (addedPlaceId, e) {
                var _this = this;
                var url = $('#place_put_url_format').text().format(this.id(), addedPlaceId);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    async: false
                }).done(function () {
                    _this._currentPlaceIds.push(addedPlaceId);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this location, please try again', true);
                    var restored = _this._currentPlaceIds.slice(0);
                    e.sender.dataSource.filter({});
                    e.sender.value(restored);
                    _this._currentPlaceIds = restored;
                });
            };

            Activity.prototype._removePlaceId = function (removedPlaceId, e) {
                var _this = this;
                var url = $('#place_delete_url_format').text().format(this.id(), removedPlaceId);
                $.ajax({
                    type: 'DELETE',
                    url: url,
                    async: false
                }).done(function () {
                    var index = $.inArray(removedPlaceId, _this._currentPlaceIds);
                    _this._currentPlaceIds.splice(index, 1);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(_this._currentPlaceIds);
                });
            };

            //#endregion
            //#region Types
            Activity.prototype._populateTypes = function (types) {
                var _this = this;
                var typesMapping = {
                    create: function (options) {
                        var checkBox = new ActivityTypeCheckBox(options);
                        var isChecked = Enumerable.From(_this.values.types()).Any(function (x) {
                            return x.typeId() == checkBox.id;
                        });
                        checkBox.checked(isChecked);
                        checkBox.checked.subscribe(function (newValue) {
                            if (newValue)
                                _this._addType(checkBox);
else
                                _this._removeType(checkBox);
                        });
                        return checkBox;
                    }
                };
                ko.mapping.fromJS(types, typesMapping, this.activityTypes);
            };

            Activity.prototype._addType = function (checkBox) {
                var _this = this;
                var needsAdded = Enumerable.From(this.values.types()).All(function (x) {
                    return x.typeId() != checkBox.id;
                });
                if (needsAdded) {
                    var url = $('#type_put_url_format').text().format(this.id(), checkBox.id);
                    $.ajax({
                        url: url,
                        type: 'PUT',
                        async: false
                    }).done(function () {
                        _this.values.types.push({
                            id: ko.observable(0),
                            typeId: ko.observable(checkBox.id),
                            version: ko.observable('')
                        });
                    }).fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to add this activity type, please try again', true);
                        setTimeout(function () {
                            checkBox.checked(!checkBox.checked());
                        }, 0);
                    });
                }
            };

            Activity.prototype._removeType = function (checkBox) {
                var _this = this;
                var needsRemoved = Enumerable.From(this.values.types()).Any(function (x) {
                    return x.typeId() == checkBox.id;
                });
                if (needsRemoved) {
                    var url = $('#type_delete_url_format').text().format(this.id(), checkBox.id);
                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        async: false
                    }).done(function () {
                        var type = Enumerable.From(_this.values.types()).Single(function (x) {
                            return x.typeId() == checkBox.id;
                        });
                        _this.values.types.remove(type);
                    }).fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to remove this activity type, please try again', true);
                        setTimeout(function () {
                            checkBox.checked(!checkBox.checked());
                        }, 0);
                    });
                }
            };

            //#endregion
            //#region Tags
            Activity.prototype._getTagAutoCompleteDataSource = function () {
                var dataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: $('#establishment_names_get_url_format').text(),
                                data: {
                                    keyword: options.data.filter.filters[0].value,
                                    pageNumber: 1,
                                    pageSize: 250
                                }
                            }).done(function (results) {
                                options.success(results.items);
                            }).fail(function (xhr) {
                                App.Failures.message(xhr, 'while trying to search for tags', true);
                            });
                        }
                    }
                });
                return dataSource;
            };

            Activity.prototype._getTagEstablishmentId = function (text) {
                var establishmentId;
                var url = $('#establishment_names_get_url_format').text();
                $.ajax({
                    type: 'GET',
                    url: url,
                    data: {
                        keyword: text,
                        keywordMatchStrategy: 'Equals',
                        pageNumber: 1,
                        pageSize: 250
                    },
                    async: false
                }).done(function (results) {
                    // only treat as establishment if there is exactly 1 establishment id
                    var establishmentIds = Enumerable.From(results.items).Select(function (x) {
                        return x.ownerId;
                    }).Distinct().ToArray();
                    if (establishmentIds.length == 1)
                        establishmentId = establishmentIds[0];
                });
                return establishmentId;
            };

            Activity.prototype._onTagAutoCompleteSelect = function (e) {
                var _this = this;
                // the autocomplete filter will search establishment names, not establishments
                // name.ownerId corresponds to the establishment.id
                var dataItem = e.sender.dataItem(e.item.index());
                this._addOrReplaceTag(dataItem.text, dataItem.ownerId).done(function () {
                    _this.newTag('');
                    e.preventDefault();
                    e.sender.value('');
                    e.sender.element.focus();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
            };

            Activity.prototype.addTag = function () {
                var _this = this;
                var text = this.newTag();
                if (text)
                    text = $.trim(text);
                var establishmentId = this._getTagEstablishmentId(text);
                this._addOrReplaceTag(text, establishmentId).done(function () {
                    _this.newTag('');
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
            };

            Activity.prototype.deleteTag = function (item) {
                this._deleteTag(item.text()).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to delete this activity tag, please try again', true);
                });
            };

            Activity.prototype._addOrReplaceTag = function (text, establishmentId) {
                var _this = this;
                var deferred = $.Deferred();
                if (!text) {
                    deferred.resolve();
                } else {
                    text = $.trim(text);
                    var tagToReplace = Enumerable.From(this.values.tags()).SingleOrDefault(undefined, function (x) {
                        return x.text().toUpperCase() === text.toUpperCase();
                    });
                    if (tagToReplace) {
                        this._deleteTag(text).done(function () {
                            _this._postTag(text, establishmentId).done(function () {
                                deferred.resolve();
                            }).fail(function (xhr) {
                                deferred.reject(xhr);
                            });
                        }).fail(function (xhr) {
                            deferred.reject(xhr);
                        });
                    } else {
                        this._postTag(text, establishmentId).done(function () {
                            deferred.resolve();
                        }).fail(function (xhr) {
                            deferred.reject(xhr);
                        });
                    }
                }
                return deferred;
            };

            Activity.prototype._postTag = function (text, establishmentId) {
                var _this = this;
                var deferred = $.Deferred();
                var url = $('#tag_post_url_format').text().format(this.id());
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: {
                        text: text,
                        domainType: establishmentId ? 'Establishment' : 'Custom',
                        domainKey: establishmentId
                    }
                }).done(function () {
                    var tag = {
                        text: text,
                        domainTypeText: establishmentId ? 'Establishment' : 'Custom',
                        domainKey: establishmentId
                    };
                    var observableTag = ko.mapping.fromJS(tag);
                    _this.values.tags.push(observableTag);
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                });
                return deferred;
            };

            Activity.prototype._deleteTag = function (text) {
                var _this = this;
                var deferred = $.Deferred();
                var url = $('#tag_delete_url_format').text().format(this.id());
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    data: {
                        text: text
                    }
                }).done(function () {
                    // there should always be matching tag, but check to be safe
                    var tagToRemove = Enumerable.From(_this.values.tags()).SingleOrDefault(undefined, function (x) {
                        return text && x.text().toUpperCase() === text.toUpperCase();
                    });
                    if (tagToRemove)
                        _this.values.tags.remove(tagToRemove);
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                });
                return deferred;
            };

            //#endregion
            //#region Documents
            Activity.prototype._loadDocuments = function () {
                var _this = this;
                var url = $('#documents_get_url_format').text().format(this.id());
                $.ajax({
                    type: 'GET',
                    //url: App.Routes.WebApi.Activities.Documents.get(this.id(), null, this.modeText()),
                    url: url,
                    data: {
                        mode: this.modeText()
                    }
                }).done(function (documents, textStatus, jqXhr) {
                    // TODO - This needs to be combined with the initial load mapping.
                    var augmentedDocumentModel = function (data) {
                        ko.mapping.fromJS(data, {}, this);
                        this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                    };

                    var mapping = {
                        create: function (options) {
                            return new augmentedDocumentModel(options.data);
                        }
                    };

                    var observableDocs = ko.mapping.fromJS(documents, mapping);

                    _this.values.documents.removeAll();
                    for (var i = 0; i < observableDocs().length; i += 1) {
                        _this.values.documents.push(observableDocs()[i]);
                    }
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load your activity documents', true);
                });
            };

            Activity.prototype.deleteDocument = function (item, index) {
                var _this = this;
                var $dialog = $('#deleteDocumentConfirmDialog');
                $dialog.dialog({
                    dialogClass: 'jquery-ui no-close',
                    closeOnEscape: false,
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                var $buttons = $dialog.parents('.ui-dialog').find('button');
                                $.each($buttons, function () {
                                    $(this).attr('disabled', 'disabled');
                                });
                                $dialog.find('.spinner').css('visibility', '');

                                $.ajax({
                                    type: 'DELETE',
                                    url: App.Routes.WebApi.Activities.Documents.del(_this.id(), item.id())
                                }).done(function () {
                                    $dialog.dialog('close');
                                    _this.values.documents.splice(index, 1);
                                }).fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to delete your activity document', true);
                                }).always(function () {
                                    $.each($buttons, function () {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                $dialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };

            Activity.prototype.startDocumentTitleEdit = function (item, event) {
                var _this = this;
                var textElement = event.target;
                $(textElement).hide();
                this.previousDocumentTitle = item.title();
                var inputElement = $(textElement).siblings('#documentTitleInput')[0];
                $(inputElement).show();
                $(inputElement).focusout(event, function (event) {
                    _this.endDocumentTitleEdit(item, event);
                });
                $(inputElement).keypress(event, function (event) {
                    if (event.which == 13)
                        inputElement.blur();
                });
            };

            Activity.prototype.endDocumentTitleEdit = function (item, event) {
                var _this = this;
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
                    success: function (data, textStatus, jqXhr) {
                        $(inputElement).hide();
                        $(inputElement).removeAttr('disabled');
                        var textElement = $(inputElement).siblings('#documentTitle')[0];
                        $(textElement).show();
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        item.title(_this.previousDocumentTitle);
                        $(inputElement).hide();
                        $(inputElement).removeAttr('disabled');
                        var textElement = $(inputElement).siblings('#documentTitle')[0];
                        $(textElement).show();
                        $('#documentRenameErrorDialog > #message')[0].innerText = jqXhr.responseText;
                        $('#documentRenameErrorDialog').dialog({
                            modal: true,
                            resizable: false,
                            width: 400,
                            buttons: { Ok: function () {
                                    $(this).dialog('close');
                                } }
                        });
                    }
                });
            };

            Activity.prototype.dismissFileUploadError = function (index) {
                this.fileUploadErrors.splice(index, 1);
            };
            Activity.iconMaxSide = 64;
            return Activity;
        })();
        Activities.Activity = Activity;

        var ActivityTypeCheckBox = (function () {
            function ActivityTypeCheckBox(mappingOptions) {
                this.checked = ko.observable(false);
                this.text = mappingOptions.data.type;
                this.id = mappingOptions.data.id;
            }
            return ActivityTypeCheckBox;
        })();
        Activities.ActivityTypeCheckBox = ActivityTypeCheckBox;
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
