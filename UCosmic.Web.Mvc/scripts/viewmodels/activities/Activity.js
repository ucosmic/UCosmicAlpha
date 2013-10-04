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
        var ActivityForm = (function () {
            //#endregion
            //#region Construction & Initialization
            function ActivityForm(activityId, activityWorkCopyId) {
                var _this = this;
                //#region Primary scalar observables & properties
                this.ready = ko.observable(false);
                this.activityId = ko.observable();
                this.mode = ko.observable();
                this.title = ko.observable();
                this.content = ko.observable();
                this.onGoing = ko.observable();
                this.isExternallyFunded = ko.observable();
                this.isInternallyFunded = ko.observable();
                this.updatedByPrincipal = ko.observable();
                this.updatedOnUtc = ko.observable();
                //#endregion
                //#region View convenience computeds
                this.isDraft = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode.toLowerCase() == 'draft';
                });
                this.isPublished = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode.toLowerCase() == 'public';
                });
                this.updatedOnDate = ko.computed(function () {
                    var updatedOnUtc = _this.updatedOnUtc();
                    if (!updatedOnUtc)
                        return undefined;
                    return moment(updatedOnUtc).format('M/D/YYYY');
                });
                //#endregion
                //#region Value subscriptions setup
                this._isDirty = ko.observable(false);
                this._descriptionIsDirtyCurrent = 0;
                this.saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this._isAutoSaving = false;
                this._isSaved = false;
                this._isDeleted = false;
                //#endregion
                //#region Places
                this.selectedPlaces = ko.observableArray();
                this.placeOptions = ko.observableArray();
                this.kendoPlaceIds = ko.observableArray();
                //#endregion
                //#region Types
                this.typeOptions = ko.observableArray();
                this.selectedTypeIds = ko.observableArray();
                //#endregion
                //#region Tags
                this.tags = ko.observableArray();
                this.newTag = ko.observable();
                this.documents = ko.observableArray();
                this.fileUploadErrors = ko.observableArray();
                this._invalidFileNames = ko.observableArray([]);
                this._originalId = activityId;
                this._workCopyId = activityWorkCopyId;

                ko.computed(function () {
                    if (_this._isDirty()) {
                        _this._autoSave();
                    }
                });
            }
            //#endregion
            //#region Initial data load
            ActivityForm.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();

                //#region load places dropdown, module types, and activity work copy
                var placeOptionsPact = $.Deferred();
                $.get($('#place_options_api').text()).done(function (data) {
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
                $.ajax({ url: $('#activity_api').text().format(this._workCopyId), cache: false }).done(function (data) {
                    dataPact.resolve(data);
                }).fail(function (xhr) {
                    dataPact.reject(xhr);
                });

                var placesPact = $.Deferred();
                $.ajax({ url: $('#places_api').text().format(this._workCopyId), cache: false }).done(function (data) {
                    placesPact.resolve(data);
                }).fail(function (xhr) {
                    placesPact.reject(xhr);
                });

                var typesPact = $.Deferred();
                $.ajax({ url: $('#types_api').text().format(this._workCopyId), cache: false }).done(function (data) {
                    typesPact.resolve(data);
                }).fail(function (xhr) {
                    typesPact.reject(xhr);
                });

                var tagsPact = $.Deferred();
                $.ajax({ url: $('#tags_api').text().format(this._workCopyId), cache: false }).done(function (data) {
                    tagsPact.resolve(data);
                }).fail(function (xhr) {
                    tagsPact.reject(xhr);
                });

                var documentsPact = $.Deferred();
                $.ajax({ url: $('#documents_api').text().format(this._workCopyId), cache: false }).done(function (data) {
                    documentsPact.resolve(data);
                }).fail(function (xhr) {
                    documentsPact.reject(xhr);
                });

                //#endregion
                //#region process after all have been loaded
                $.when(typeOptionsPact, placeOptionsPact, dataPact, placesPact, typesPact, tagsPact, documentsPact).done(function (typeOptions, placeOptions, data, selectedPlaces, selectedTypes, tags, documents) {
                    //#region populate activity data
                    var mapping = {
                        ignore: ['startsOn', 'endsOn', 'startsFormat', 'endsFormat']
                    };
                    ko.mapping.fromJS(data, mapping, _this);

                    _this.startsOn = new FormattedDateInput(data.startsOn, data.startsFormat);
                    _this.endsOn = new FormattedDateInput(data.endsOn, data.endsFormat);

                    //#endregion
                    //#region populate places multiselect
                    // map places multiselect datasource to locations
                    ko.mapping.fromJS(placeOptions, {}, _this.placeOptions);

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
                    ko.mapping.fromJS(documents, {}, _this.documents);

                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                });

                //#endregion
                return deferred;
            };

            //#endregion
            //#region Kendo widget setup
            ActivityForm.prototype.setupWidgets = function (fromDatePickerId, toDatePickerId, countrySelectorId, uploadFileId, newTagId) {
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
                this._initPlacesKendoMultiSelect();
                this._initDocumentsKendoUpload();
                this._initTagsKendoAutoComplete();
            };

            ActivityForm.prototype.setupValidation = function () {
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

                ko.validation.group(this);

                this.title.extend({
                    required: {
                        message: 'Title is required.'
                    },
                    minLength: 1,
                    maxLength: 500
                });
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

            ActivityForm.prototype.setupSubscriptions = function () {
                var _this = this;
                // autosave when fields change
                this.title.subscribe(function (newValue) {
                    _this._isDirty(true);
                });
                this.content.subscribe(function (newValue) {
                    _this._descriptionCheckIsDirty(newValue);
                });
                this.startsOn.input.subscribe(function (newValue) {
                    _this._isDirty(true);
                });
                this.endsOn.input.subscribe(function (newValue) {
                    _this._isDirty(true);
                });
                this.onGoing.subscribe(function (newValue) {
                    _this._isDirty(true);
                });
                this.isExternallyFunded.subscribe(function (newValue) {
                    _this._isDirty(true);
                });
                this.isInternallyFunded.subscribe(function (newValue) {
                    _this._isDirty(true);
                });

                window.onbeforeunload = function () {
                    if (!_this._hasData() && !_this._isDeleted) {
                        return "This activity currently has no data. If you continue, the activity will be kept and you can come back to add data later. If you intended to delete it, please stay on this page and click one of the 'Cancel' buttons provided instead.";
                    } else {
                        _this._autoSave();
                    }
                };
            };

            ActivityForm.prototype._descriptionCheckIsDirty = function (newValue) {
                ++this._descriptionIsDirtyCurrent;
                if (this._descriptionIsDirtyCurrent >= ActivityForm._descriptionIsDirtyAfter) {
                    this._isDirty(true);
                    this._descriptionIsDirtyCurrent = 0;
                }
            };

            ActivityForm.prototype._autoSave = function () {
                var _this = this;
                var deferred = $.Deferred();
                if (this._isSaved || this._isDeleted || this._isAutoSaving || (!this._isDirty() && this._descriptionIsDirtyCurrent == 0)) {
                    deferred.resolve();
                    return deferred;
                }

                this.saveSpinner.start();
                this._isAutoSaving = true;

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
                    isInternallyFunded: model.isInternallyFunded
                };
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data
                }).done(function () {
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                }).always(function () {
                    _this._isDirty(false);
                    _this.saveSpinner.stop();
                    _this._isAutoSaving = false;
                });

                return deferred;
            };

            ActivityForm.prototype._save = function (mode) {
                var _this = this;
                this._autoSave().done(function (data) {
                    if (!_this.isValid()) {
                        _this.errors.showAllMessages();
                        return;
                    }

                    _this.saveSpinner.start();

                    var url = $('#activity_replace_api').text().format(_this._workCopyId, _this._originalId, mode);
                    $.ajax({
                        type: 'PUT',
                        url: url
                    }).done(function () {
                        _this._isSaved = true;
                        location.href = App.Routes.Mvc.My.Profile.get();
                    }).fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to save your activity', true);
                    }).always(function () {
                        _this._isDirty(false);
                        _this.saveSpinner.stop();
                    });
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to save your activity', true);
                });
            };

            ActivityForm.prototype.saveDraft = function () {
                this._save('Draft');
            };

            ActivityForm.prototype.publish = function () {
                this._save('Public');
            };

            //#endregion
            //#region Canceling
            ActivityForm.prototype.cancel = function () {
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

                                _this._purge().done(function () {
                                    $dialog.dialog('close');
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

            ActivityForm.prototype._purge = function (async) {
                if (typeof async === "undefined") { async = true; }
                var _this = this;
                var deferred = $.Deferred();
                var url = $('#activity_api').text().format(this.activityId());
                $.ajax({
                    type: 'DELETE',
                    url: url,
                    async: async
                }).done(function () {
                    _this._isDeleted = true;
                    deferred.resolve();
                }).fail(function (xhr) {
                    deferred.reject(xhr);
                }).always(function () {
                    deferred.always();
                });

                return deferred;
            };

            ActivityForm.prototype._hasData = function () {
                var _hasData = this.title() || this.content() || this.onGoing() || this.startsOn.input() || this.endsOn.input() || this.isExternallyFunded() || this.isInternallyFunded() || this.selectedTypeIds().length || this.selectedPlaces().length || this.tags().length || this.documents().length;
                return _hasData;
            };

            ActivityForm.prototype._initPlacesKendoMultiSelect = function () {
                var _this = this;
                $('#countrySelector').kendoMultiSelect({
                    filter: 'contains',
                    ignoreCase: 'true',
                    dataTextField: 'officialName()',
                    dataValueField: 'id()',
                    dataSource: this.placeOptions(),
                    value: this.kendoPlaceIds(),
                    dataBound: function (e) {
                        _this._currentPlaceIds = e.sender.value().slice(0);
                    },
                    change: function (e) {
                        _this._onPlaceMultiSelectChange(e);
                    },
                    placeholder: '[Select Country/Location, Body of Water or Global]'
                });
            };

            ActivityForm.prototype._onPlaceMultiSelectChange = function (e) {
                // find out if a place was added or deleted
                var newPlaceIds = e.sender.value();
                var addedPlaceIds = $(newPlaceIds).not(this._currentPlaceIds).get();
                var removedPlaceIds = $(this._currentPlaceIds).not(newPlaceIds).get();

                if (addedPlaceIds.length === 1)
                    this._addPlaceId(addedPlaceIds[0], e);
else if (removedPlaceIds.length === 1)
                    this._removePlaceId(removedPlaceIds[0], e);
            };

            ActivityForm.prototype._addPlaceId = function (addedPlaceId, e) {
                var _this = this;
                var url = $('#place_api').text().format(this.activityId(), addedPlaceId);
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
                        activityId: _this.activityId(),
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

            ActivityForm.prototype._removePlaceId = function (removedPlaceId, e) {
                var _this = this;
                var url = $('#place_api').text().format(this.activityId(), removedPlaceId);
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

            ActivityForm.prototype._bindTypes = function (typeOptions, selectedTypes) {
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

            ActivityForm.prototype._initTagsKendoAutoComplete = function () {
                var _this = this;
                $('#newTag').kendoAutoComplete({
                    minLength: 3,
                    placeholder: '[Enter tag or keyword]',
                    dataTextField: 'text',
                    dataSource: this._getTagAutoCompleteDataSource(),
                    select: function (e) {
                        _this._onTagAutoCompleteSelect(e);
                    }
                });
            };

            ActivityForm.prototype._getTagAutoCompleteDataSource = function () {
                var dataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: $('#establishment_names_api').text(),
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

            ActivityForm.prototype._getTagEstablishmentId = function (text) {
                var establishmentId;
                var url = $('#establishment_names_api').text();
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

            ActivityForm.prototype._onTagAutoCompleteSelect = function (e) {
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

            ActivityForm.prototype.addTag = function () {
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

            ActivityForm.prototype.deleteTag = function (item) {
                this._deleteTag(item.text).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to delete this activity tag, please try again', true);
                });
            };

            ActivityForm.prototype._addOrReplaceTag = function (text, establishmentId) {
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

            ActivityForm.prototype._postTag = function (text, establishmentId) {
                var _this = this;
                var deferred = $.Deferred();
                var url = $('#tags_api').text().format(this.activityId());
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
                        activityId: _this.activityId(),
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

            ActivityForm.prototype._deleteTag = function (text) {
                var _this = this;
                var deferred = $.Deferred();
                var url = $('#tags_api').text().format(this.activityId());
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

            ActivityForm.prototype._initDocumentsKendoUpload = function () {
                var _this = this;
                $('#uploadFile').kendoUpload({
                    multiple: true,
                    showFileList: false,
                    localization: { select: 'Choose one or more documents to share...' },
                    async: { saveUrl: $('#documents_api').text().format(this.activityId()) },
                    select: function (e) {
                        _this._onDocumentKendoSelect(e);
                    },
                    upload: function (e) {
                        _this._onDocumentKendoUpload(e);
                    },
                    success: function (e) {
                        _this._onDocumentKendoSuccess(e);
                    },
                    error: function (e) {
                        _this._onDocumentKendoError(e);
                    }
                });
            };

            ActivityForm.prototype._onDocumentKendoSelect = function (e) {
                var _this = this;
                for (var i = 0; i < e.files.length; i++) {
                    var file = e.files[i];
                    $.ajax({
                        async: false,
                        type: 'POST',
                        url: $('#documents_validate_api').text(),
                        data: {
                            name: file.name,
                            length: file.size
                        }
                    }).fail(function (xhr) {
                        var isAlreadyInvalid = Enumerable.From(_this._invalidFileNames()).Any(function (x) {
                            return x == file.name;
                        });
                        if (!isAlreadyInvalid)
                            _this._invalidFileNames.push(file.name);
                        var message = xhr.status === 400 ? xhr.responseText : App.Failures.message(xhr, "while trying to upload '{0}'".format(file.name));
                        _this.fileUploadErrors.push({ message: message });
                    });
                }
            };

            ActivityForm.prototype._onDocumentKendoUpload = function (e) {
                var file = e.files[0];
                var isInvalidFileName = Enumerable.From(this._invalidFileNames()).Any(function (x) {
                    return x == file.name;
                });
                if (isInvalidFileName) {
                    e.preventDefault();
                    this._invalidFileNames.remove(file.name);
                }
            };

            ActivityForm.prototype._onDocumentKendoSuccess = function (e) {
                var _this = this;
                var location = e.XMLHttpRequest.getResponseHeader('location');
                $.get(location).done(function (data) {
                    var document = ko.mapping.fromJS(data);
                    _this.documents.push(document);
                });
            };

            ActivityForm.prototype._onDocumentKendoError = function (e) {
                var message = e.XMLHttpRequest.status != 500 && e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000 ? e.XMLHttpRequest.responseText : App.Failures.message(e.XMLHttpRequest, 'while uploading your document, please try again');
                this.fileUploadErrors.push({ message: message });
            };

            ActivityForm.prototype.documentIcon = function (documentId) {
                var url = $('#document_icon_api').text().format(this.activityId(), documentId);
                var params = { maxSide: ActivityForm.iconMaxSide };
                return '{0}?{1}'.format(url, $.param(params));
            };

            ActivityForm.prototype.deleteDocument = function (item, index) {
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
                                    url: $('#document_api').text().format(_this.activityId(), item.id())
                                }).done(function () {
                                    $dialog.dialog('close');
                                    _this.documents.splice(index, 1);
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

            ActivityForm.prototype.startDocumentTitleEdit = function (item, event) {
                var _this = this;
                var textElement = event.target;
                $(textElement).hide();
                this._previousDocumentTitle = item.title();
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

            ActivityForm.prototype.endDocumentTitleEdit = function (item, event) {
                var _this = this;
                var inputElement = event.target;
                $(inputElement).unbind('focusout');
                $(inputElement).unbind('keypress');
                $(inputElement).attr('disabled', 'disabled');

                var url = $('#document_api').text().format(this.activityId(), item.id());
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
                        item.title(_this._previousDocumentTitle);
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

            ActivityForm.prototype.dismissFileUploadError = function (index) {
                this.fileUploadErrors.splice(index, 1);
            };
            ActivityForm._descriptionIsDirtyAfter = 10;

            ActivityForm.iconMaxSide = 64;
            return ActivityForm;
        })();
        ViewModels.ActivityForm = ActivityForm;

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
                var url = $('#type_api').text().format(this._owner.activityId(), this.id);
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
                var url = $('#type_api').text().format(this._owner.activityId(), this.id);
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
