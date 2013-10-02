var Activities;
(function (Activities) {
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
    (function (ViewModels) {
        var Activity = (function () {
            //#endregion
            //#region Construction & Initialization
            function Activity(activityId, activityWorkCopyId) {
                //#region Class Properties
                this.ready = ko.observable(false);
                // Autosave after so many keydowns
                this.AUTOSAVE_KEYCOUNT = 10;
                this.keyCounter = 0;
                // Dirty
                this.dirtyFlag = ko.observable(false);
                // In the process of saving
                this.saving = false;
                this.saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this.activityId = ko.observable();
                this.mode = ko.observable();
                this.title = ko.observable();
                this.content = ko.observable();
                this.onGoing = ko.observable();
                this.isExternallyFunded = ko.observable();
                this.isInternallyFunded = ko.observable();
                this._isSaved = false;
                this._isDeleted = false;
                //#endregion
                //#region Places
                // array of places for this activity
                this.selectedPlaces = ko.observableArray();
                // Array of all locations offered in Country/Location multiselect
                this.placeOptions = ko.observableArray();
                // Array of placeIds of selected locations, kendo multiselect stores these as strings
                this.kendoPlaceIds = ko.observableArray();
                //#endregion
                //#region Types
                // array of activity type options displayed as list of checkboxes
                this.typeOptions = ko.observableArray();
                // array of selected activity type data
                this.selectedTypeIds = ko.observableArray();
                //#endregion
                //#region Tags
                // Data bound to new tag textArea
                this.tags = ko.observableArray();
                this.newTag = ko.observable();
                // array to hold file upload errors
                this.fileUploadErrors = ko.observableArray();
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
                var placeOptionsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Locations.get()).done(function (data) {
                    placeOptionsPact.resolve(data);
                }).fail(function (xhr) {
                    placeOptionsPact.reject(xhr);
                });

                var typeOptionsPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get()).done(function (data) {
                    typeOptionsPact.resolve(data);
                }).fail(function (xhr) {
                    typeOptionsPact.reject(xhr);
                });

                var dataPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.get(this.workCopyId())).done(function (data) {
                    dataPact.resolve(data);
                }).fail(function (xhr) {
                    dataPact.reject(xhr);
                });

                var data2Pact = $.Deferred();
                $.get($('#activity_get_url_format').text().format(this.workCopyId())).done(function (data) {
                    data2Pact.resolve(data);
                }).fail(function (xhr) {
                    data2Pact.reject(xhr);
                });

                var placesPact = $.Deferred();
                $.get($('#places_get_url_format').text().format(this.workCopyId())).done(function (data) {
                    placesPact.resolve(data);
                }).fail(function (xhr) {
                    placesPact.reject(xhr);
                });

                var typesPact = $.Deferred();
                $.get($('#types_get_url_format').text().format(this.workCopyId())).done(function (data) {
                    typesPact.resolve(data);
                }).fail(function (xhr) {
                    typesPact.reject(xhr);
                });

                var tagsPact = $.Deferred();
                $.get($('#tags_get_url_format').text().format(this.workCopyId())).done(function (data) {
                    tagsPact.resolve(data);
                }).fail(function (xhr) {
                    tagsPact.reject(xhr);
                });

                //#endregion
                //#region process after all have been loaded
                $.when(typeOptionsPact, placeOptionsPact, dataPact, data2Pact, placesPact, typesPact, tagsPact).done(function (typeOptions, placeOptions, data, data2, selectedPlaces, selectedTypes, tags) {
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
                        }
                    };
                    ko.mapping.fromJS(data, mapping, _this);

                    var mapping2 = {
                        ignore: ['startsOn', 'endsOn', 'startsFormat', 'endsFormat']
                    };
                    ko.mapping.fromJS(data2, mapping2, _this);

                    _this.startsOn = new FormattedDateInput(data2.startsOn, data2.startsFormat);
                    _this.endsOn = new FormattedDateInput(data2.endsOn, data2.endsFormat);

                    //#endregion
                    //#region populate places multiselect
                    // map places multiselect datasource to locations
                    _this.placeOptions = ko.mapping.fromJS(placeOptions);

                    // Initialize the list of selected locations with current locations in values
                    _this.selectedPlaces(selectedPlaces);
                    var currentPlaceIds = Enumerable.From(selectedPlaces).Select(function (x) {
                        return x.placeId;
                    }).ToArray();
                    _this.kendoPlaceIds(currentPlaceIds.slice(0));

                    //#endregion
                    //#region set up type checkboxes
                    _this._bindTypes(typeOptions, selectedTypes);

                    //#endregion
                    _this.tags(tags);

                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
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
                    value: this.startsOn.date(),
                    format: this.startsOn.format(),
                    // if user clicks date picker button, reset format
                    open: function (e) {
                        this.options.format = 'M/d/yyyy';
                    }
                });
                this.startsOn.kendoDatePicker = $('#' + fromDatePickerId).data('kendoDatePicker');

                $('#' + toDatePickerId).kendoDatePicker({
                    value: this.endsOn.date(),
                    format: this.endsOn.format(),
                    open: function (e) {
                        this.options.format = 'M/d/yyyy';
                    }
                });
                this.endsOn.kendoDatePicker = $('#' + toDatePickerId).data('kendoDatePicker');

                //#endregion
                //#region Kendo MultiSelect for Places
                $('#' + countrySelectorId).kendoMultiSelect({
                    filter: 'contains',
                    ignoreCase: 'true',
                    dataTextField: 'officialName()',
                    dataValueField: 'id()',
                    dataSource: this.placeOptions(),
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
                        if (e.XMLHttpRequest.status != 500 && e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000) {
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

            Activity.prototype.setupValidation = function () {
                ko.validation.rules['atLeast'] = {
                    validator: function (val, otherVal) {
                        return val.length >= otherVal;
                    },
                    message: 'At least {0} must be selected.'
                };

                ko.validation.rules['formattedDate'] = {
                    validator: function (value, params) {
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
                        message: 'Start date is not valid.'
                    }
                });
                this.endsOn.input.extend({
                    formattedDate: {
                        params: this.endsOn,
                        message: 'End date is not valid.'
                    }
                });
            };

            //#endregion
            //#region Value subscriptions setup
            Activity.prototype.setupSubscriptions = function () {
                var _this = this;
                /* Autosave when fields change. */
                this.title.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.content.subscribe(function (newValue) {
                    _this.keyCountAutoSave(newValue);
                });
                this.startsOn.input.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.endsOn.input.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.onGoing.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.isExternallyFunded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.isInternallyFunded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
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
                    isInternallyFunded: model.isInternallyFunded
                };
                $.ajax({
                    type: 'PUT',
                    //url: App.Routes.WebApi.Activities.put(this.id()),
                    url: url,
                    data: data
                }).done(function () {
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
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
                    if (!_this.values.isValid() || !_this.isValid()) {
                        _this.values.errors.showAllMessages();
                        _this.errors.showAllMessages();
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
                }).fail(function (xhr) {
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
                    var dataItem = Enumerable.From(e.sender.dataItems()).Single(function (x) {
                        return x.id() == addedPlaceId;
                    });
                    _this.selectedPlaces.push({
                        activityId: _this.id(),
                        placeId: addedPlaceId,
                        placeName: dataItem.officialName()
                    });
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
                    _this.selectedPlaces.remove(function (x) {
                        return x.placeId == removedPlaceId;
                    });
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(_this._currentPlaceIds);
                });
            };

            Activity.prototype._bindTypes = function (typeOptions, selectedTypes) {
                var _this = this;
                var selectedTypeIds = Enumerable.From(selectedTypes).Select(function (x) {
                    return x.typeId;
                }).ToArray();
                this.selectedTypeIds(selectedTypeIds);
                var typesMapping = {
                    create: function (options) {
                        var checkBox = new ActivityTypeCheckBox(options, _this);
                        return checkBox;
                    }
                };
                ko.mapping.fromJS(typeOptions, typesMapping, this.typeOptions);
            };

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
                this._deleteTag(item.text).fail(function (xhr) {
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
                    var tagToReplace = Enumerable.From(this.tags()).SingleOrDefault(undefined, function (x) {
                        return x.text.toUpperCase() === text.toUpperCase();
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
                        activityId: _this.id(),
                        text: text,
                        domainType: establishmentId ? 'Establishment' : 'Custom',
                        domainKey: establishmentId
                    };
                    _this.tags.push(tag);
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
                    var tagToRemove = Enumerable.From(_this.tags()).SingleOrDefault(undefined, function (x) {
                        return text && x.text.toUpperCase() === text.toUpperCase();
                    });
                    if (tagToRemove)
                        _this.tags.remove(tagToRemove);
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                });
                return deferred;
            };

            Activity.prototype._loadDocuments = function () {
                var _this = this;
                var url = $('#documents_get_url_format').text().format(this.id());
                $.ajax({
                    type: 'GET',
                    //url: App.Routes.WebApi.Activities.Documents.get(this.id(), null, this.modeText()),
                    url: url
                }).done(function (documents) {
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
                    success: function (data) {
                        $(inputElement).hide();
                        $(inputElement).removeAttr('disabled');
                        var textElement = $(inputElement).siblings('#documentTitle')[0];
                        $(textElement).show();
                    },
                    error: function (xhr) {
                        item.title(_this.previousDocumentTitle);
                        $(inputElement).hide();
                        $(inputElement).removeAttr('disabled');
                        var textElement = $(inputElement).siblings('#documentTitle')[0];
                        $(textElement).show();
                        $('#documentRenameErrorDialog > #message')[0].innerText = xhr.responseText;
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
        ViewModels.Activity = Activity;

        var ActivityTypeCheckBox = (function () {
            function ActivityTypeCheckBox(mappingOptions, owner) {
                var _this = this;
                this.id = mappingOptions.data.id;
                this.text = mappingOptions.data.type;
                this._owner = owner;

                var isChecked = Enumerable.From(this._owner.selectedTypeIds()).Any(function (x) {
                    return x == _this.id;
                });
                this.checked = ko.observable(isChecked);

                this.checked.subscribe(function (newValue) {
                    if (newValue)
                        _this._onChecked();
else
                        _this._onUnchecked();
                });
            }
            ActivityTypeCheckBox.prototype._onChecked = function () {
                var _this = this;
                var needsAdded = Enumerable.From(this._owner.selectedTypeIds()).All(function (x) {
                    return x != _this.id;
                });
                if (!needsAdded)
                    return;

                this._owner.saveSpinner.start();
                var url = $('#type_put_url_format').text().format(this._owner.id(), this.id);
                $.ajax({
                    url: url,
                    type: 'PUT'
                }).done(function () {
                    _this._owner.selectedTypeIds.push(_this.id);
                    setTimeout(function () {
                        _this.checked(true);
                    }, 0);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity type, please try again', true);
                    setTimeout(function () {
                        _this.checked(false);
                    }, 0);
                }).always(function () {
                    _this._owner.saveSpinner.stop();
                });
            };

            ActivityTypeCheckBox.prototype._onUnchecked = function () {
                var _this = this;
                var needsRemoved = Enumerable.From(this._owner.selectedTypeIds()).Any(function (x) {
                    return x == _this.id;
                });
                if (!needsRemoved)
                    return;

                this._owner.saveSpinner.start();
                var url = $('#type_delete_url_format').text().format(this._owner.id(), this.id);
                $.ajax({
                    url: url,
                    type: 'DELETE'
                }).done(function () {
                    _this._owner.selectedTypeIds.remove(_this.id);
                    setTimeout(function () {
                        _this.checked(false);
                    }, 0);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to remove this activity type, please try again', true);
                    setTimeout(function () {
                        _this.checked(true);
                    }, 0);
                }).always(function () {
                    _this._owner.saveSpinner.stop();
                });
            };
            return ActivityTypeCheckBox;
        })();
        ViewModels.ActivityTypeCheckBox = ActivityTypeCheckBox;

        var FormattedDateInput = (function () {
            function FormattedDateInput(isoFormattedDate, format) {
                var _this = this;
                this.input = ko.observable();
                this.format = ko.computed(function () {
                    return _this._computeDateFormat(_this.input());
                });
                this.date = ko.computed(function () {
                    var input = _this.input();
                    if (!input)
                        return undefined;
                    return moment(input, [_this.format().toUpperCase()]).toDate();
                });
                this.isoString = ko.computed(function () {
                    var date = _this.date();
                    if (!date)
                        return undefined;
                    return moment(date).utc().hours(0).format();
                });
                if (!isoFormattedDate)
                    return;

                var date = moment(isoFormattedDate).toDate();
                format = format || FormattedDateInput._defaultFormat;
                var input = moment(date).format(format.toUpperCase());
                this.input(input);

                this.input.subscribe(function (newValue) {
                    var trimmedValue = $.trim(newValue);
                    if (trimmedValue != newValue)
                        _this.input(trimmedValue);
                });

                this.format.subscribe(function (newValue) {
                    if (_this.kendoDatePicker)
                        _this.kendoDatePicker.options.format = newValue || FormattedDateInput._defaultFormat;
                });
            }
            FormattedDateInput.prototype._computeDateFormat = function (input) {
                if (!input)
                    return undefined;
                if (FormattedDateInput._yyyy.test(input))
                    return 'yyyy';
else if (FormattedDateInput._mYyyy.test(input))
                    return 'M/yyyy';
else if (FormattedDateInput._mmYyyy.test(input))
                    return 'MM/yyyy';
else if (FormattedDateInput._mDYyyy.test(input))
                    return 'M/d/yyyy';
else if (FormattedDateInput._mmDYyyy.test(input))
                    return 'MM/d/yyyy';
else if (FormattedDateInput._mDdYyyy.test(input))
                    return 'M/dd/yyyy';
                return 'MM/dd/yyyy';
            };

            //#endregion
            FormattedDateInput.prototype.isValid = function () {
                var input = this.input(), format = this.format();
                return !input || moment(input, format).isValid();
            };
            FormattedDateInput._defaultFormat = 'M/d/yyyy';

            FormattedDateInput._yyyy = new RegExp('^\\d{4}$');
            FormattedDateInput._mYyyy = new RegExp('^\\d{1}/\\d{4}$');
            FormattedDateInput._mmYyyy = new RegExp('^\\d{2}/\\d{4}$');
            FormattedDateInput._mxYyyy = new RegExp('^\\d{1,}/\\d{4}$');
            FormattedDateInput._mDYyyy = new RegExp('^\\d{1}/\\d{1}/\\d{4}$');
            FormattedDateInput._mmDYyyy = new RegExp('^\\d{2}/\\d{1}/\\d{4}$');
            FormattedDateInput._mDdYyyy = new RegExp('^\\d{1}/\\d{2}/\\d{4}$');
            FormattedDateInput._mmDdYyyy = new RegExp('^\\d{2}/\\d{2}/\\d{4}$');
            FormattedDateInput._mxDxYyyy = new RegExp('^\\d{1,}/\\d{1,}/\\d{4}$');
            return FormattedDateInput;
        })();
        ViewModels.FormattedDateInput = FormattedDateInput;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
