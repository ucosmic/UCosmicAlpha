var Activities;
(function (Activities) {
    var ViewModels;
    (function (ViewModels) {
        var ActivityForm = (function () {
            function ActivityForm() {
                var _this = this;
                this.ready = ko.observable(false);
                this.mode = ko.observable();
                this.updatedOnUtc = ko.observable();
                this.isDraft = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode == ViewModels.ActivityMode.draft;
                });
                this.isPublished = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode == ViewModels.ActivityMode.published;
                });
                this.updatedOnDate = ko.computed(function () {
                    var updatedOnUtc = _this.updatedOnUtc();
                    if (!updatedOnUtc)
                        return undefined;
                    return moment(updatedOnUtc).format('M/D/YYYY');
                });
                this.isSaving = ko.observable(false);
                this.saveSpinner = new App.Spinner({ delay: 200, });
                this._isDirty = ko.observable(false);
                this._descriptionIsDirtyCurrent = 0;
                this._isAutoSaving = false;
                this._isSaved = false;
                this._isDeleted = false;
                this.cancelSpinner = new App.Spinner();
                this.placeOptions = ko.observableArray();
                this.kendoPlaceIds = ko.observableArray();
                this.typeOptions = ko.observableArray();
                this.tags = ko.observableArray();
                this.tagInput = ko.observable();
                this.documents = ko.observableArray();
                this.deleteDocumentSpinner = new App.Spinner();
            }
            ActivityForm.bind = function (bindings) {
                var viewModel = new ActivityForm();
                viewModel.bind(bindings).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load the activity editor', true);
                });
                return viewModel;
            };
            ActivityForm.prototype.bind = function (bindings) {
                var _this = this;
                this._originalId = bindings.activityId;
                this._workCopyId = bindings.workCopyId;
                this._dataUrl = bindings.dataUrlFormat.format(bindings.activityId);
                this._placeOptionsUrl = bindings.placeOptionsUrlFormat;
                this._typeOptionsUrl = bindings.typeOptionsUrlFormat;
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                $.ajax({ url: this._dataUrl, cache: false, })
                    .done(function (data) { dataPact.resolve(data); })
                    .fail(function (xhr) { dataPact.reject(xhr); });
                var placeOptionsPact = $.Deferred();
                $.get(this._placeOptionsUrl)
                    .done(function (data) { placeOptionsPact.resolve(data); })
                    .fail(function (xhr) { placeOptionsPact.reject(xhr); });
                var typeOptionsPact = $.Deferred();
                $.get(this._typeOptionsUrl)
                    .done(function (data) { typeOptionsPact.resolve(data); })
                    .fail(function (xhr) { typeOptionsPact.reject(xhr); });
                $.when(dataPact, placeOptionsPact, typeOptionsPact)
                    .done(function (data, placeOptions, typeOptions) {
                    _this._applyBindings(bindings.target, data, placeOptions, typeOptions);
                    deferred.resolve();
                })
                    .fail(function (xhr) {
                    deferred.reject(xhr);
                });
                return deferred;
            };
            ActivityForm.prototype._applyBindings = function (target, data, placeOptions, typeOptions) {
                this._bindData(data);
                this._bindPlaceOptions(placeOptions);
                this._bindTypeOptions(typeOptions);
                this._bindValidation();
                this._bindSubscriptions();
                ko.applyBindings(this, target);
                this._bindKendo();
                this.ready(true);
            };
            ActivityForm.prototype._bindData = function (data) {
                var _this = this;
                var mapping = {
                    types: {
                        create: function (options) {
                            return options.data.typeId;
                        },
                    },
                    places: {
                        create: function (options) {
                            return options.data.placeId;
                        },
                    },
                    documents: {
                        create: function (options) {
                            return new ActivityDocumentForm(options.data, _this);
                        },
                    },
                    ignore: ['startsOn', 'endsOn', 'startsFormat', 'endsFormat'],
                };
                ko.mapping.fromJS(data, mapping, this);
                this.startsOn = new FormattedDateInput(data.startsOn, data.startsFormat);
                this.endsOn = new FormattedDateInput(data.endsOn, data.endsFormat);
            };
            ActivityForm.prototype._bindValidation = function () {
                var _this = this;
                ko.validation.rules['atLeast'] = {
                    validator: function (value, minLength) {
                        return value.length >= minLength;
                    },
                    message: 'At least {0} must be selected.'
                };
                ko.validation.rules['formattedDate'] = {
                    validator: function (value, params) {
                        return params.isValid();
                    },
                    message: 'The {0} is not valid.'
                };
                ko.validation.rules['startBeforeEnd'] = {
                    validator: function (value, params) {
                        var isValid = !params.startsOn.date() || !params.endsOn.date() || params.onGoing()
                            || params.startsOn.date() <= params.endsOn.date();
                        return isValid;
                    },
                    message: 'When both start and end date are specified, end date must be equal to or after start date.'
                };
                ko.validation.registerExtenders();
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
                    },
                });
                this.endsOn.input.extend({
                    formattedDate: {
                        params: this.endsOn,
                        message: 'End date is not valid.',
                    },
                });
                this.dateValues = ko.computed(function () {
                    var value = '{0}{1}{2}'.format(_this.startsOn.isoString(), _this.endsOn.isoString(), _this.onGoing());
                    return value;
                });
                this.dateValues.extend({
                    startBeforeEnd: this
                });
                ko.validation.group(this);
            };
            ActivityForm.prototype._bindSubscriptions = function () {
                var _this = this;
                this.title.subscribe(function () { _this._isDirty(true); });
                this.content.subscribe(function () { _this._descriptionCheckIsDirty(); });
                this.startsOn.input.subscribe(function () { _this._isDirty(true); });
                this.endsOn.input.subscribe(function () { _this._isDirty(true); });
                this.onGoing.subscribe(function () { _this._isDirty(true); });
                this.isExternallyFunded.subscribe(function () { _this._isDirty(true); });
                this.isInternallyFunded.subscribe(function () { _this._isDirty(true); });
                ko.computed(function () {
                    if (_this._isDirty()) {
                        _this._autoSave();
                    }
                });
                this.isSaving.subscribe(function (newValue) {
                    if (newValue)
                        _this.saveSpinner.start();
                    else
                        _this.saveSpinner.stop();
                });
                window.onbeforeunload = function () {
                    if (!_this._hasData() && !_this._isDeleted) {
                        return "This activity currently has no data. If you continue, the activity will be kept and you can come back to add data later. If you intended to delete it, please stay on this page and click one of the 'Cancel' buttons provided instead.";
                    }
                    else {
                        _this._autoSave();
                    }
                };
            };
            ActivityForm.prototype._bindKendo = function () {
                this._bindDatePickers();
                this._bindPlacesKendoMultiSelect();
                this._bindDocumentsKendoUpload();
                this._bindTagsKendoAutoComplete();
            };
            ActivityForm.prototype._descriptionCheckIsDirty = function () {
                ++this._descriptionIsDirtyCurrent;
                if (this._descriptionIsDirtyCurrent >= ActivityForm._descriptionIsDirtyAfter) {
                    this._isDirty(true);
                    this._descriptionIsDirtyCurrent = 0;
                }
            };
            ActivityForm.prototype._autoSave = function (isNested) {
                var _this = this;
                var deferred = $.Deferred();
                if (this._isSaved || this._isDeleted || this._isAutoSaving ||
                    (!this._isDirty() && this._descriptionIsDirtyCurrent == 0)) {
                    deferred.resolve();
                    return deferred;
                }
                this._isAutoSaving = true;
                this.isSaving(true);
                var model = ko.mapping.toJS(this);
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
                    url: this.$activityUrlFormat.text().format(this.activityId()),
                    data: data,
                })
                    .done(function () {
                    deferred.resolve();
                })
                    .fail(function (xhr) {
                    deferred.reject(xhr);
                })
                    .always(function () {
                    _this._isDirty(false);
                    _this._isAutoSaving = false;
                    if (!isNested || !_this.isValid())
                        _this.isSaving(false);
                });
                return deferred;
            };
            ActivityForm.prototype._save = function (mode) {
                var _this = this;
                this._autoSave(true)
                    .done(function () {
                    if (!_this.isValid()) {
                        _this.errors.showAllMessages();
                        return;
                    }
                    var url = _this.$activityReplaceUrlFormat.text()
                        .format(_this.activityId(), _this._originalId, mode);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                    })
                        .done(function () {
                        _this._isSaved = true;
                        location.href = Routes.Mvc.Employees.Activities.byPerson(_this.personId());
                    })
                        .fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to save your activity', true);
                        _this.isSaving(false);
                    })
                        .always(function () {
                        _this._isDirty(false);
                    });
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to save your activity', true);
                });
            };
            ActivityForm.prototype.saveDraft = function () {
                this._save('Draft');
            };
            ActivityForm.prototype.publish = function () {
                this._save('Public');
            };
            ActivityForm.prototype.cancel = function () {
                var _this = this;
                this.$cancelDialog.dialog({
                    dialogClass: 'jquery-ui no-close',
                    closeOnEscape: false,
                    modal: true,
                    resizable: false,
                    width: 450,
                    buttons: [
                        {
                            text: 'Cancel and lose changes',
                            click: function () {
                                var $buttons = _this.$cancelDialog.parents('.ui-dialog').find('button');
                                $.each($buttons, function () {
                                    $(this).attr('disabled', 'disabled');
                                });
                                _this.cancelSpinner.start();
                                _this._purge()
                                    .done(function () {
                                    _this.$cancelDialog.dialog('close');
                                    location.href = Routes.Mvc.Employees.Activities.byPerson(_this.personId());
                                })
                                    .fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to discard your activity edits', true);
                                })
                                    .always(function () {
                                    $.each($buttons, function () {
                                        $(this).removeAttr('disabled');
                                    });
                                    _this.cancelSpinner.stop();
                                });
                            }
                        },
                        {
                            text: 'Do not cancel',
                            click: function () {
                                _this.$cancelDialog.dialog('close');
                            },
                            'data-css-link': true
                        }]
                });
            };
            ActivityForm.prototype._purge = function (async) {
                var _this = this;
                if (async === void 0) { async = true; }
                var deferred = $.Deferred();
                var url = this.$activityUrlFormat.text().format(this.activityId());
                $.ajax({
                    type: 'DELETE',
                    url: url,
                    async: async,
                })
                    .done(function () {
                    _this._isDeleted = true;
                    deferred.resolve();
                })
                    .fail(function (xhr) {
                    deferred.reject(xhr);
                })
                    .always(function () {
                    deferred.always();
                });
                return deferred;
            };
            ActivityForm.prototype._hasData = function () {
                var _hasData = this.title() || this.content() || this.onGoing() || this.startsOn.input()
                    || this.endsOn.input() || this.isExternallyFunded() || this.isInternallyFunded()
                    || this.types().length || this.places().length || this.tags().length
                    || this.documents().length;
                return _hasData ? true : false;
            };
            ActivityForm.prototype._bindDatePickers = function () {
                this.$startsOn.kendoDatePicker({
                    value: this.startsOn.date(),
                    format: this.startsOn.format(),
                    open: function (e) {
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
            };
            ActivityForm.prototype._bindPlaceOptions = function (placeOptions) {
                ko.mapping.fromJS(placeOptions, {}, this.placeOptions);
                this.kendoPlaceIds(this.places().slice(0));
            };
            ActivityForm.prototype._bindPlacesKendoMultiSelect = function () {
                var _this = this;
                this.$placeOptions.kendoMultiSelect({
                    filter: 'contains',
                    ignoreCase: 'true',
                    dataTextField: 'officialName()',
                    dataValueField: 'id()',
                    dataSource: this.placeOptions(),
                    value: this.kendoPlaceIds(),
                    change: function (e) {
                        _this._onPlaceMultiSelectChange(e);
                    },
                    placeholder: '[Select Country / Location, Body of Water, or Global]'
                });
            };
            ActivityForm.prototype._onPlaceMultiSelectChange = function (e) {
                var oldPlaceIds = this.places();
                var newPlaceIds = e.sender.value();
                var addedPlaceIds = $(newPlaceIds).not(oldPlaceIds).get();
                var removedPlaceIds = $(oldPlaceIds).not(newPlaceIds).get();
                if (addedPlaceIds.length === 1)
                    this._addPlaceId(addedPlaceIds[0], e);
                else if (removedPlaceIds.length === 1)
                    this._removePlaceId(removedPlaceIds[0], e);
            };
            ActivityForm.prototype._addPlaceId = function (addedPlaceId, e) {
                var _this = this;
                var url = this.$placeUrlFormat.text()
                    .format(this.activityId(), addedPlaceId);
                this.isSaving(true);
                $.ajax({
                    type: 'PUT',
                    url: url,
                })
                    .done(function () {
                    _this.places.push(addedPlaceId);
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this location, please try again', true);
                    var restored = _this.places().slice(0);
                    e.sender.dataSource.filter({});
                    e.sender.value(restored);
                    _this.places(restored);
                })
                    .always(function () { _this.isSaving(false); });
            };
            ActivityForm.prototype._removePlaceId = function (removedPlaceId, e) {
                var _this = this;
                var url = this.$placeUrlFormat.text()
                    .format(this.activityId(), removedPlaceId);
                this.isSaving(true);
                $.ajax({
                    type: 'DELETE',
                    url: url,
                })
                    .done(function () {
                    _this.places.remove(removedPlaceId);
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to remove this location, please try again', true);
                    e.sender.value(_this.places());
                })
                    .always(function () { _this.isSaving(false); });
            };
            ActivityForm.prototype._bindTypeOptions = function (typeOptions) {
                var _this = this;
                var typesMapping = {
                    create: function (options) {
                        var checkBox = new ActivityTypeCheckBox(options, _this);
                        return checkBox;
                    }
                };
                ko.mapping.fromJS(typeOptions, typesMapping, this.typeOptions);
            };
            ActivityForm.prototype._bindTagsKendoAutoComplete = function () {
                var _this = this;
                this.$tagInput.kendoAutoComplete({
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
                var _this = this;
                var dataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: _this.$tagsAutoCompleteUrl.text(),
                                data: {
                                    keyword: options.data.filter.filters[0].value,
                                    pageNumber: 1,
                                    pageSize: 250
                                },
                            })
                                .done(function (results) {
                                options.success(results.items);
                            })
                                .fail(function (xhr) {
                                App.Failures.message(xhr, 'while trying to search for tags', true);
                            });
                        }
                    }
                });
                return dataSource;
            };
            ActivityForm.prototype._onTagAutoCompleteSelect = function (e) {
                var _this = this;
                var dataItem = e.sender.dataItem(e.item.index());
                this._addOrReplaceTag(dataItem.text)
                    .done(function () {
                    _this.tagInput('');
                    e.preventDefault();
                    e.sender.value('');
                    e.sender.element.focus();
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
            };
            ActivityForm.prototype.addTag = function () {
                var _this = this;
                var text = this.tagInput();
                if (text)
                    text = $.trim(text);
                this._addOrReplaceTag(text)
                    .done(function () {
                    _this.tagInput('');
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity tag, please try again', true);
                });
            };
            ActivityForm.prototype.deleteTag = function (item) {
                this._deleteTag(item.text())
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to delete this activity tag, please try again', true);
                });
            };
            ActivityForm.prototype._addOrReplaceTag = function (text) {
                var _this = this;
                var deferred = $.Deferred();
                if (!text) {
                    deferred.resolve();
                }
                else {
                    text = $.trim(text);
                    var tagToReplace = Enumerable.From(this.tags())
                        .SingleOrDefault(undefined, function (x) {
                        return x.text().toUpperCase() === text.toUpperCase();
                    });
                    if (tagToReplace) {
                        this._deleteTag(text)
                            .done(function () {
                            _this._postTag(text)
                                .done(function () { deferred.resolve(); })
                                .fail(function (xhr) { deferred.reject(xhr); });
                        })
                            .fail(function (xhr) { deferred.reject(xhr); });
                    }
                    else {
                        this._postTag(text)
                            .done(function () { deferred.resolve(); })
                            .fail(function (xhr) { deferred.reject(xhr); });
                    }
                }
                return deferred;
            };
            ActivityForm.prototype._postTag = function (text) {
                var _this = this;
                var deferred = $.Deferred();
                var url = this.$tagsUrlFormat.text().format(this.activityId());
                this.isSaving(true);
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: {
                        text: text,
                    },
                })
                    .done(function () {
                    var tag = {
                        activityId: _this.activityId(),
                        text: text,
                        domainType: ViewModels.ActivityTagDomainType.custom,
                        domainKey: undefined,
                    };
                    var observableTag = ko.mapping.fromJS(tag);
                    _this.tags.push(observableTag);
                    deferred.resolve();
                })
                    .fail(function (xhr) { deferred.reject(xhr); })
                    .always(function () { _this.isSaving(false); });
                return deferred;
            };
            ActivityForm.prototype._deleteTag = function (text) {
                var _this = this;
                var deferred = $.Deferred();
                var url = this.$tagsUrlFormat.text().format(this.activityId());
                this.isSaving(true);
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    data: {
                        text: text,
                    },
                })
                    .done(function () {
                    var tagToRemove = Enumerable.From(_this.tags())
                        .SingleOrDefault(undefined, function (x) {
                        return text && x.text().toUpperCase() === text.toUpperCase();
                    });
                    if (tagToRemove)
                        _this.tags.remove(tagToRemove);
                    deferred.resolve();
                })
                    .fail(function (xhr) { deferred.reject(xhr); })
                    .always(function () { _this.isSaving(false); });
                return deferred;
            };
            ActivityForm.prototype._bindDocumentsKendoUpload = function () {
                var _this = this;
                $('#files_upload').kendoUpload({
                    multiple: true,
                    showFileList: false,
                    localization: { select: 'Choose one or more documents to share...' },
                    async: { saveUrl: this.$documentsUrlFormat.text().format(this.activityId()), },
                    select: function (e) { _this._onDocumentKendoSelect(e); },
                    upload: function (e) { _this._onDocumentKendoUpload(e); },
                    progress: function (e) { _this._onDocumentKendoProgress(e); },
                    success: function (e) { _this._onDocumentKendoSuccess(e); },
                    error: function (e) { _this._onDocumentKendoError(e); },
                    complete: function () { _this.isSaving(false); },
                });
            };
            ActivityForm.prototype._onDocumentKendoSelect = function (e) {
                this.isSaving(true);
                for (var i = 0; i < e.files.length; i++) {
                    var file = e.files[i];
                    this.documents.push(new ActivityDocumentForm(file, this));
                }
            };
            ActivityForm.prototype._onDocumentKendoUpload = function (e) {
                var file = e.files[0];
                var form = Enumerable.From(this.documents())
                    .First(function (x) {
                    return x.isUpload() && x.fileName() === file.name;
                });
                if (!form || form.uploadError())
                    e.preventDefault();
                var hasUploads = Enumerable.From(this.documents())
                    .Any(function (x) {
                    return x.isUpload() && !x.uploadError();
                });
                if (!hasUploads)
                    this.isSaving(false);
            };
            ActivityForm.prototype._onDocumentKendoProgress = function (e) {
                var form = Enumerable.From(this.documents())
                    .FirstOrDefault(undefined, function (x) {
                    return x.isUpload() && !x.uploadError() && x.fileName() === e.files[0].name;
                });
                if (!form)
                    return;
                form.uploadProgress(e.percentComplete);
            };
            ActivityForm.prototype._onDocumentKendoSuccess = function (e) {
                var form = Enumerable.From(this.documents())
                    .FirstOrDefault(undefined, function (x) {
                    return x.isUpload() && !x.uploadError() && x.fileName() === e.files[0].name;
                });
                if (form) {
                    form.uploadProgress(100);
                    var location = e.XMLHttpRequest.getResponseHeader
                        ? e.XMLHttpRequest.getResponseHeader('location')
                        : e.response.location;
                    $.get(location)
                        .done(function (data) {
                        form.completeUpload(data);
                    });
                }
            };
            ActivityForm.prototype._onDocumentKendoError = function (e) {
                var message = e.XMLHttpRequest.status != 500 && e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000
                    ? e.XMLHttpRequest.responseText
                    : App.Failures.message(e.XMLHttpRequest, "while uploading '{0}', please try again".format(e.files[0].name));
                var form = Enumerable.From(this.documents())
                    .FirstOrDefault(undefined, function (x) {
                    return x.isUpload() && !x.uploadError() && x.fileName() === e.files[0].name;
                });
                if (form)
                    form.uploadError(message);
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
                var isChecked = Enumerable.From(this._owner.types())
                    .Any(function (x) {
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
                var needsAdded = Enumerable.From(this._owner.types())
                    .All(function (x) {
                    return x != _this.id;
                });
                if (!needsAdded)
                    return;
                this._owner.isSaving(true);
                var url = this._owner.$typeUrlFormat.text().format(this._owner.activityId(), this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                })
                    .done(function () {
                    _this._owner.types.push(_this.id);
                    setTimeout(function () {
                        _this.checked(true);
                    }, 0);
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to add this activity type, please try again', true);
                    setTimeout(function () {
                        _this.checked(false);
                    }, 0);
                })
                    .always(function () { _this._owner.isSaving(false); });
            };
            ActivityTypeCheckBox.prototype._onUnchecked = function () {
                var _this = this;
                var needsRemoved = Enumerable.From(this._owner.types())
                    .Any(function (x) {
                    return x == _this.id;
                });
                if (!needsRemoved)
                    return;
                this._owner.isSaving(true);
                var url = this._owner.$typeUrlFormat.text()
                    .format(this._owner.activityId(), this.id);
                $.ajax({
                    url: url,
                    type: 'DELETE',
                })
                    .done(function () {
                    _this._owner.types.remove(_this.id);
                    setTimeout(function () {
                        _this.checked(false);
                    }, 0);
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to remove this activity type, please try again', true);
                    setTimeout(function () {
                        _this.checked(true);
                    }, 0);
                })
                    .always(function () { _this._owner.isSaving(false); });
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
            FormattedDateInput.prototype.isValid = function () {
                var input = this.input(), format = this.format() || 'M/D/YYYY';
                return !input || moment(input, format.toUpperCase()).isValid();
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
        var ActivityDocumentForm = (function () {
            function ActivityDocumentForm(arg0, owner) {
                var _this = this;
                this.activityId = ko.observable();
                this.documentId = ko.observable();
                this.title = ko.observable();
                this.fileName = ko.observable();
                this.byteCount = ko.observable();
                this.size = ko.observable();
                this.extension = ko.observable();
                this.isUpload = ko.observable();
                this.uploadError = ko.observable();
                this.uploadProgress = ko.observable();
                this.displayExtension = ko.computed(function () {
                    var extension = _this.extension();
                    return extension ? extension.toLowerCase() : '';
                });
                this.displayName = ko.computed(function () {
                    return '{0}{1}'.format(_this.title(), _this.displayExtension());
                });
                this.uploadPercent = ko.computed(function () {
                    return '{0}%'.format(_this.uploadProgress() || 0);
                });
                this.isEditingTitle = ko.observable(false);
                this.renameError = ko.observable();
                this.isSavingTitle = ko.observable(false);
                this._owner = owner;
                if (typeof arg0.documentId === 'undefined')
                    this._constructUploading(arg0);
                else
                    this._constructUploaded(arg0);
            }
            ActivityDocumentForm.prototype._constructUploaded = function (data) {
                ko.mapping.fromJS(data, {}, this);
                this._bindValidation();
            };
            ActivityDocumentForm.prototype._constructUploading = function (file) {
                var _this = this;
                this._bindValidation();
                this.fileName(file.name);
                this.extension(file.extension);
                this.title(file.extension ? file.name.substr(0, file.name.lastIndexOf('.')) : file.name);
                this.isUpload(true);
                if (!this.title.isValid()) {
                    this.uploadError(this.title.error);
                }
                else {
                    $.ajax({
                        async: false,
                        type: 'POST',
                        url: this._owner.$documentsValidateUrlFormat.text().format(this._owner.activityId()),
                        data: {
                            name: file.name,
                            length: file.size,
                        },
                    })
                        .fail(function (xhr) {
                        var message = xhr.status === 400
                            ? xhr.responseText
                            : App.Failures.message(xhr, "while trying to upload '{0}'".format(file.name));
                        _this.uploadError(message);
                    });
                }
                if (!this.uploadError())
                    this.uploadProgress(1);
            };
            ActivityDocumentForm.prototype._bindValidation = function () {
                var _this = this;
                ko.validation.rules['uniqueDocumentName'] = {
                    validator: function (value, params) {
                        var otherDocumentForms = Enumerable.From(params._owner.documents())
                            .Except([params]).ToArray();
                        var duplicateDocument = Enumerable.From(otherDocumentForms)
                            .FirstOrDefault(undefined, function (x) {
                            return x.displayName().toUpperCase() == params.displayName().toUpperCase();
                        });
                        if (!duplicateDocument)
                            return true;
                        this.message = ActivityDocumentForm._duplicateNameMessageFormat
                            .format(params.displayName(), duplicateDocument.displayName());
                        return false;
                    },
                };
                ko.validation.registerExtenders();
                this.title.extend({
                    required: {
                        message: 'Document name is required.'
                    },
                    maxLength: {
                        params: 64,
                        message: ActivityDocumentForm._maxLengthMessageFormat,
                    },
                    uniqueDocumentName: this,
                });
                ko.validation.group(this);
                this.title.subscribe(function (newValue) {
                    if (_this.title.error && _this.title().length > 64 && _this.title.error.indexOf('{1}') >= 0)
                        _this.title.error = _this.title.error.format(undefined, _this.title().length);
                });
                this.uploadProgress.subscribe(function (newValue) {
                    if (newValue < 0)
                        _this.uploadProgress(0);
                    else if (newValue > 100)
                        _this.uploadProgress(100);
                });
            };
            ActivityDocumentForm.prototype.completeUpload = function (data) {
                ko.mapping.fromJS(data, {}, this);
                this.isUpload(false);
            };
            ActivityDocumentForm.prototype.iconSrc = function (img) {
                if (!this.activityId() || !this.documentId())
                    return $(img).attr('src');
                var url = $(img).data('src-format').format(this.activityId(), this.documentId());
                var params = { maxSide: ActivityForm.iconMaxSide };
                return '{0}?{1}'.format(url, $.param(params));
            };
            ActivityDocumentForm.prototype.editTitle = function () {
                if (this.isSavingTitle())
                    return;
                this._stashedTitle = this.title();
                this.isEditingTitle(true);
                this.$titleInput.focus();
            };
            ActivityDocumentForm.prototype.blurTitle = function (item, e) {
                if (e.which == 13) {
                    this.$titleInput.blur();
                }
                return true;
            };
            ActivityDocumentForm.prototype.cancelTitle = function () {
                this.title(this._stashedTitle);
                this.isEditingTitle(false);
            };
            ActivityDocumentForm.prototype.saveTitle = function () {
                var _this = this;
                var title = this.title();
                if (!title || !this.title.isValid())
                    return;
                this.isSavingTitle(true);
                this.isEditingTitle(false);
                $.ajax({
                    type: 'PUT',
                    url: this._owner.$documentUrlFormat.text().format(this.activityId(), this.documentId()),
                    data: {
                        title: this.title()
                    },
                })
                    .fail(function (xhr) {
                    var message = xhr.status === 400 && xhr.responseText && xhr.responseText.length < 1000
                        ? xhr.responseText
                        : App.Failures.message(xhr, 'while trying to rename this document');
                    _this.renameError(message);
                    _this.isEditingTitle(true);
                })
                    .always(function () {
                    _this.isSavingTitle(false);
                });
            };
            ActivityDocumentForm.prototype.purge = function (item, index) {
                var _this = this;
                this._owner.$deleteDocumentDialog.dialog({
                    dialogClass: 'jquery-ui no-close',
                    closeOnEscape: false,
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                var $buttons = _this._owner.$deleteDocumentDialog.parents('.ui-dialog').find('button');
                                $.each($buttons, function () {
                                    $(this).attr('disabled', 'disabled');
                                });
                                _this._owner.deleteDocumentSpinner.start();
                                $.ajax({
                                    type: 'DELETE',
                                    url: _this._owner.$documentUrlFormat.text().format(_this.activityId(), item.documentId()),
                                })
                                    .done(function () {
                                    _this._owner.$deleteDocumentDialog.dialog('close');
                                    _this._owner.documents.remove(_this);
                                })
                                    .fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to delete your activity document', true);
                                })
                                    .always(function () {
                                    $.each($buttons, function () {
                                        $(this).removeAttr('disabled');
                                    });
                                    _this._owner.deleteDocumentSpinner.stop();
                                });
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                _this._owner.$deleteDocumentDialog.dialog('close');
                            },
                            'data-css-link': true
                        }]
                });
            };
            ActivityDocumentForm.prototype.dismissUploadError = function () {
                this._owner.documents.remove(this);
            };
            ActivityDocumentForm._maxLengthMessageFormat = 'Document name cannot be longer than {0} characters. You entered {1} characters.';
            ActivityDocumentForm._duplicateNameMessageFormat = "The file name '{0}' is not allowed because this activity already has a file with the same name. " +
                "Please rename or delete the existing '{1}' first.";
            return ActivityDocumentForm;
        })();
        ViewModels.ActivityDocumentForm = ActivityDocumentForm;
    })(ViewModels = Activities.ViewModels || (Activities.ViewModels = {}));
})(Activities || (Activities = {}));
