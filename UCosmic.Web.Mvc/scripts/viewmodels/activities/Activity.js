var ViewModels;
(function (ViewModels) {
    (function (Activities) {
        var Activity = (function () {
            function Activity(activityId) {
                this.ready = ko.observable(false);
                this.locations = ko.observableArray();
                this.selectedLocations = ko.observableArray();
                this.activityTypes = ko.observableArray();
                this.newTag = ko.observable();
                this.fileUploadErrors = ko.observableArray();
                this.inititializationErrors = "";
                this.AUTOSAVE_KEYCOUNT = 10;
                this.keyCounter = 0;
                this.dirtyFlag = ko.observable(false);
                this.saving = false;
                this.saveSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(200));
                this._initialize(activityId);
            }
            Activity.iconMaxSide = 64;
            Activity.prototype._initialize = function (activityId) {
                var _this = this;
                this.id = ko.observable(activityId);
                this.dirty = ko.computed(function () {
                    if(_this.dirtyFlag()) {
                        _this.autoSave(_this, null);
                    }
                });
            };
            Activity.prototype.dismissFileUploadError = function (index) {
                this.fileUploadErrors.splice(index, 1);
            };
            Activity.prototype.setupWidgets = function (fromDatePickerId, toDatePickerId, countrySelectorId, uploadFileId, newTagId) {
                var _this = this;
                $("#" + fromDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
                $("#" + toDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
                $("#" + countrySelectorId).kendoMultiSelect({
                    filter: 'contains',
                    ignoreCase: 'true',
                    dataTextField: "officialName()",
                    dataValueField: "id()",
                    dataSource: this.locations(),
                    change: function (event) {
                        _this.updateLocations(event.sender.value());
                    },
                    placeholder: "[Select Country/Location, Body of Water or Global]"
                });
                var invalidFileNames = [];
                $("#" + uploadFileId).kendoUpload({
                    multiple: true,
                    showFileList: false,
                    localization: {
                        select: 'Choose one or more documents to share...'
                    },
                    async: {
                        saveUrl: App.Routes.WebApi.Activities.Documents.post(this.id(), this.modeText())
                    },
                    select: function (e) {
                        for(var i = 0; i < e.files.length; i++) {
                            var file = e.files[i];
                            $.ajax({
                                async: false,
                                type: 'POST',
                                url: App.Routes.WebApi.Activities.Documents.validateUpload(),
                                data: {
                                    fileName: file.name,
                                    length: file.size
                                }
                            }).fail(function (xhr) {
                                if(xhr.status === 400) {
                                    if($.inArray(e.files[i].name, invalidFileNames) < 0) {
                                        invalidFileNames.push(file.name);
                                    }
                                    _this.fileUploadErrors.push({
                                        message: xhr.responseText
                                    });
                                }
                            });
                        }
                    },
                    upload: function (e) {
                        for(var i = 0; i < e.files.length; i++) {
                            var indexOfInvalidName = $.inArray(e.files[i].name, invalidFileNames);
                            if(indexOfInvalidName >= 0) {
                                e.preventDefault();
                                invalidFileNames.splice(indexOfInvalidName, 1);
                                return;
                            }
                        }
                    },
                    success: function (e) {
                        _this.loadDocuments();
                    }
                });
                $("#" + newTagId).kendoAutoComplete({
                    minLength: 3,
                    placeholder: "[Enter tag or keyword]",
                    dataTextField: "officialName",
                    dataSource: new kendo.data.DataSource({
                        serverFiltering: true,
                        transport: {
                            read: function (options) {
                                $.ajax({
                                    url: App.Routes.WebApi.Establishments.get(),
                                    data: {
                                        keyword: options.data.filter.filters[0].value,
                                        pageNumber: 1,
                                        pageSize: 2147483647
                                    },
                                    success: function (results) {
                                        options.success(results.items);
                                    }
                                });
                            }
                        }
                    }),
                    select: function (e) {
                        var me = $("#" + newTagId).data("kendoAutoComplete");
                        var dataItem = me.dataItem(e.item.index());
                        _this.newEstablishment = {
                            officialName: dataItem.officialName,
                            id: dataItem.id
                        };
                    }
                });
            };
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
                        var YYYYPattern = new RegExp("^\\d{4}$");
                        var MMYYYYPattern = new RegExp("^\\d{1,}/\\d{4}$");
                        var MMDDYYYYPattern = new RegExp("^\\d{1,}/\\d{1,}/\\d{4}$");
                        if((val != null) && (val.length > 0)) {
                            val = $.trim(val);
                            if(YYYYPattern.test(val)) {
                                val = "01/01/" + val;
                                format = "YYYY";
                            } else if(MMYYYYPattern.test(val)) {
                                format = "MM/YYYY";
                            } else if(MMDDYYYYPattern.test(val)) {
                                format = "MM/DD/YYYY";
                            }
                            valid = (format != null) ? moment(val, format).isValid() : false;
                        }
                        return valid;
                    },
                    message: "Date must be valid."
                };
                ko.validation.registerExtenders();
                ko.validation.group(this.values);
                this.values.title.extend({
                    required: true,
                    minLength: 1,
                    maxLength: 500
                });
                this.values.locations.extend({
                    atLeast: 1
                });
                this.values.types.extend({
                    atLeast: 1
                });
                this.values.startsOn.extend({
                    nullSafeDate: {
                        message: "Start date must valid."
                    }
                });
                this.values.endsOn.extend({
                    nullSafeDate: {
                        message: "End date must valid."
                    }
                });
            };
            Activity.prototype.setupSubscriptions = function () {
                var _this = this;
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
                this.values.types.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };
            Activity.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Locations.get()).done(function (data, textStatus, jqXHR) {
                    locationsPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });
                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get()).done(function (data, textStatus, jqXHR) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var dataPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.Activities.getEdit(this.id()),
                    success: function (data, textStatus, jqXhr) {
                        dataPact.resolve(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        dataPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(typesPact, locationsPact, dataPact).done(function (types, locations, data) {
                    _this.activityTypes = ko.mapping.fromJS(types);
                    _this.locations = ko.mapping.fromJS(locations);
 {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {
                            }, this);
                            this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, {
                                maxSide: Activity.iconMaxSide
                            }));
                        };
                        var mapping = {
                            'documents': {
                                create: function (options) {
                                    return new augmentedDocumentModel(options.data);
                                }
                            },
                            'startsOn': {
                                create: function (options) {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                                }
                            },
                            'endsOn': {
                                create: function (options) {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                                }
                            }
                        };
                        ko.mapping.fromJS(data, mapping, _this);
                    }
                    for(var i = 0; i < _this.values.locations().length; i += 1) {
                        _this.selectedLocations.push(_this.values.locations()[i].placeId());
                    }
                    for(var i = 0; i < _this.activityTypes().length; i += 1) {
                        _this.activityTypes()[i].checked = ko.computed(_this.defHasActivityTypeCallback(i));
                    }
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            Activity.prototype.keyCountAutoSave = function (newValue) {
                this.keyCounter += 1;
                if(this.keyCounter >= this.AUTOSAVE_KEYCOUNT) {
                    this.dirtyFlag(true);
                    this.keyCounter = 0;
                }
            };
            Activity.prototype.getDateFormat = function (dateStr) {
                var format = null;
                var YYYYPattern = new RegExp("^\\d{4}$");
                var MMYYYYPattern = new RegExp("^\\d{1,}/\\d{4}$");
                var MMDDYYYYPattern = new RegExp("^\\d{1,}/\\d{1,}/\\d{4}$");
                if((dateStr != null) && (dateStr.length > 0)) {
                    dateStr = $.trim(dateStr);
                    if(YYYYPattern.test(dateStr)) {
                        format = "yyyy";
                    } else if(MMYYYYPattern.test(dateStr)) {
                        format = "MM/yyyy";
                    } else {
                        format = "MM/dd/yyyy";
                    }
                }
                return format;
            };
            Activity.prototype.convertDate = function (date) {
                var formatted = null;
                var YYYYPattern = new RegExp("^\\d{4}$");
                var MMYYYYPattern = new RegExp("^\\d{1,}/\\d{4}$");
                var MMDDYYYYPattern = new RegExp("^\\d{1,}/\\d{1,}/\\d{4}$");
                if(typeof (date) === "object") {
                    formatted = moment(date).format();
                } else {
                    var dateStr = date;
                    if((dateStr != null) && (dateStr.length > 0)) {
                        dateStr = $.trim(dateStr);
                        if(YYYYPattern.test(dateStr)) {
                            dateStr = "01/01/" + dateStr;
                            formatted = moment(dateStr, [
                                "MM/DD/YYYY"
                            ]).format();
                        } else if(MMYYYYPattern.test(dateStr)) {
                            formatted = moment(dateStr, [
                                "MM/YYYY"
                            ]).format();
                        } else if(MMDDYYYYPattern.test(dateStr)) {
                            formatted = moment(dateStr, [
                                "MM/DD/YYYY"
                            ]).format();
                        }
                    }
                }
                return formatted;
            };
            Activity.prototype.autoSave = function (viewModel, event) {
                var _this = this;
                var deferred = $.Deferred();
                if(this.saving) {
                    deferred.resolve();
                    return deferred;
                }
                if(!this.dirtyFlag() && (this.keyCounter == 0)) {
                    deferred.resolve();
                    return deferred;
                }
                this.saving = true;
                var model = ko.mapping.toJS(this);
                if(model.values.startsOn != null) {
                    var dateStr = $("#fromDatePicker").get(0).value;
                    model.values.dateFormat = this.getDateFormat(dateStr);
                    model.values.startsOn = this.convertDate(model.values.startsOn);
                }
                if((this.values.onGoing != null) && (this.values.onGoing())) {
                    model.values.endsOn = null;
                } else {
                    if(model.values.endsOn != null) {
                        model.values.endsOn = this.convertDate(model.values.endsOn);
                    }
                }
                this.saveSpinner.start();
                $.ajax({
                    type: 'PUT',
                    url: App.Routes.WebApi.Activities.put(viewModel.id()),
                    data: ko.toJSON(model),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data, textStatus, jqXhr) {
                        _this.dirtyFlag(false);
                        _this.saveSpinner.stop();
                        _this.saving = false;
                        deferred.resolve();
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.dirtyFlag(false);
                        _this.saveSpinner.stop();
                        _this.saving = false;
                        deferred.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                return deferred;
            };
            Activity.prototype.save = function (viewModel, event, mode) {
                var _this = this;
                this.autoSave(viewModel, event).done(function (data, textStatus, jqXHR) {
                    if(!_this.values.isValid()) {
                        _this.values.errors.showAllMessages();
                        return;
                    }
                    _this.saveSpinner.start();
                    $.ajax({
                        async: false,
                        type: 'PUT',
                        url: App.Routes.WebApi.Activities.putEdit(viewModel.id()),
                        data: ko.toJSON(mode),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data, textStatus, jqXhr) {
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "; " + errorThrown);
                        },
                        complete: function (jqXhr, textStatus) {
                            _this.dirtyFlag(false);
                            _this.saveSpinner.stop();
                            location.href = App.Routes.Mvc.My.Profile.get();
                        }
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this.saveSpinner.stop();
                    location.href = App.Routes.Mvc.My.Profile.get();
                });
            };
            Activity.prototype.cancel = function (item, event, mode) {
                $("#cancelConfirmDialog").dialog({
                    modal: true,
                    resizable: false,
                    width: 450,
                    buttons: {
                        "Do not cancel": function () {
                            $(this).dialog("close");
                        },
                        "Cancel and lose changes": function () {
                            $.ajax({
                                async: false,
                                type: 'DELETE',
                                url: App.Routes.WebApi.Activities.del(item.id()),
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function (data, textStatus, jqXhr) {
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    alert(textStatus + "; " + errorThrown);
                                }
                            });
                            $(this).dialog("close");
                            location.href = App.Routes.Mvc.My.Profile.get();
                        }
                    }
                });
            };
            Activity.prototype.addActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if(existingIndex == -1) {
                    var newActivityType = ko.mapping.fromJS({
                        id: 0,
                        typeId: activityTypeId,
                        version: ""
                    });
                    this.values.types.push(newActivityType);
                }
            };
            Activity.prototype.removeActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if(existingIndex != -1) {
                    var activityType = this.values.types()[existingIndex];
                    this.values.types.remove(activityType);
                }
            };
            Activity.prototype.getTypeName = function (id) {
                var name = "";
                var index = this.getActivityTypeIndexById(id);
                if(index != -1) {
                    name = this.activityTypes[index].type;
                }
                return name;
            };
            Activity.prototype.getActivityTypeIndexById = function (activityTypeId) {
                var index = -1;
                if((this.values.types != null) && (this.values.types().length > 0)) {
                    var i = 0;
                    while((i < this.values.types().length) && (activityTypeId != this.values.types()[i].typeId())) {
                        i += 1;
                    }
                    if(i < this.values.types().length) {
                        index = i;
                    }
                }
                return index;
            };
            Activity.prototype.hasActivityType = function (activityTypeId) {
                return this.getActivityTypeIndexById(activityTypeId) != -1;
            };
            Activity.prototype.defHasActivityTypeCallback = function (activityTypeIndex) {
                var _this = this;
                var def = {
                    read: function () {
                        return _this.hasActivityType(_this.activityTypes()[activityTypeIndex].id());
                    },
                    write: function (checked) {
                        if(checked) {
                            _this.addActivityType(_this.activityTypes()[activityTypeIndex].id());
                        } else {
                            _this.removeActivityType(_this.activityTypes()[activityTypeIndex].id());
                        }
                    },
                    owner: this
                };
                return def;
            };
            Activity.prototype.updateLocations = function (locations) {
                this.values.locations.removeAll();
                for(var i = 0; i < locations.length; i += 1) {
                    var location = ko.mapping.fromJS({
                        id: 0,
                        placeId: locations[i],
                        version: ""
                    });
                    this.values.locations.push(location);
                }
                this.dirtyFlag(true);
            };
            Activity.prototype.addTag = function (item, event) {
                var newText = null;
                var domainTypeText = "Custom";
                var domainKey = null;
                var isInstitution = false;
                if(this.newEstablishment == null) {
                    newText = this.newTag();
                } else {
                    newText = this.newEstablishment.officialName;
                    domainTypeText = "Establishment";
                    domainKey = this.newEstablishment.id;
                    isInstitution = true;
                    this.newEstablishment = null;
                }
                newText = (newText != null) ? $.trim(newText) : null;
                if((newText != null) && (newText.length != 0) && (!this.haveTag(newText))) {
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
            };
            Activity.prototype.removeTag = function (item, event) {
                this.values.tags.remove(item);
                this.dirtyFlag(true);
            };
            Activity.prototype.haveTag = function (text) {
                return this.tagIndex(text) != -1;
            };
            Activity.prototype.tagIndex = function (text) {
                var i = 0;
                while((i < this.values.tags().length) && (text != this.values.tags()[i].text())) {
                    i += 1;
                }
                return ((this.values.tags().length > 0) && (i < this.values.tags().length)) ? i : -1;
            };
            Activity.prototype.loadDocuments = function () {
                var _this = this;
                $.ajax({
                    type: 'GET',
                    url: App.Routes.WebApi.Activities.Documents.get(this.id(), null, this.modeText()),
                    dataType: 'json',
                    success: function (documents, textStatus, jqXhr) {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {
                            }, this);
                            this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, {
                                maxSide: Activity.iconMaxSide
                            }));
                        };
                        var mapping = {
                            create: function (options) {
                                return new augmentedDocumentModel(options.data);
                            }
                        };
                        var observableDocs = ko.mapping.fromJS(documents, mapping);
                        _this.values.documents.removeAll();
                        for(var i = 0; i < observableDocs().length; i += 1) {
                            _this.values.documents.push(observableDocs()[i]);
                        }
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert("Unable to update documents list. " + textStatus + "|" + errorThrown);
                    }
                });
            };
            Activity.prototype.deleteDocument = function (item, index, event) {
                var _this = this;
                $.ajax({
                    type: 'DELETE',
                    url: App.Routes.WebApi.Activities.Documents.del(this.id(), item.id()),
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.values.documents.splice(index, 1);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert("Unable to delete document. " + textStatus + "|" + errorThrown);
                    }
                });
            };
            Activity.prototype.startDocumentTitleEdit = function (item, event) {
                var _this = this;
                var textElement = event.target;
                $(textElement).hide();
                this.previousDocumentTitle = item.title();
                var inputElement = $(textElement).siblings("#documentTitleInput")[0];
                $(inputElement).show();
                $(inputElement).focusout(event, function (event) {
                    _this.endDocumentTitleEdit(item, event);
                });
                $(inputElement).keypress(event, function (event) {
                    if(event.which == 13) {
                        inputElement.blur();
                    }
                });
            };
            Activity.prototype.endDocumentTitleEdit = function (item, event) {
                var _this = this;
                var inputElement = event.target;
                $(inputElement).unbind("focusout");
                $(inputElement).unbind("keypress");
                $(inputElement).attr("disabled", "disabled");
                $.ajax({
                    type: 'PUT',
                    url: App.Routes.WebApi.Activities.Documents.rename(this.id(), item.id()),
                    data: ko.toJSON(item.title()),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        $(inputElement).hide();
                        $(inputElement).removeAttr("disabled");
                        var textElement = $(inputElement).siblings("#documentTitle")[0];
                        $(textElement).show();
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        item.title(_this.previousDocumentTitle);
                        $(inputElement).hide();
                        $(inputElement).removeAttr("disabled");
                        var textElement = $(inputElement).siblings("#documentTitle")[0];
                        $(textElement).show();
                        $("#documentRenameErrorDialog > #message")[0].innerText = jqXhr.responseText;
                        $("#documentRenameErrorDialog").dialog({
                            modal: true,
                            resizable: false,
                            width: 400,
                            buttons: {
                                Ok: function () {
                                    $(this).dialog("close");
                                }
                            }
                        });
                    }
                });
            };
            return Activity;
        })();
        Activities.Activity = Activity;        
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
