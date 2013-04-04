var ViewModels;
(function (ViewModels) {
    (function (Activities) {
        var Activity = (function () {
            function Activity(activityId) {
                this.locations = ko.observableArray();
                this.selectedLocations = ko.observableArray();
                this.activityTypes = ko.observableArray();
                this.addingTag = ko.observable(false);
                this.newTag = ko.observable();
                this.uploadingDocument = ko.observable(false);
                this.id = ko.observable(activityId);
            }
            Activity.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.getLocations(0)).done(function (data, textStatus, jqXHR) {
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
                    url: App.Routes.WebApi.Activities.get(this.id()),
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
                            this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.getDocumentProxyImage(this.id(), data.id));
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
            Activity.prototype.addActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if(existingIndex == -1) {
                    var newActivityType = ko.mapping.fromJS({
                        id: 0,
                        typeId: activityTypeId
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
                            this.addActivityType(this.activityTypes()[activityTypeIndex].id());
                        } else {
                            this.removeActivityType(this.activityTypes()[activityTypeIndex].id());
                        }
                    },
                    owner: this
                };
                return def;
            };
            Activity.prototype.updateLocations = function (locations) {
                this.values.locations = ko.observableArray();
                for(var i = 0; i < locations.length; i += 1) {
                    var location = ko.mapping.fromJS({
                        id: 0,
                        placeId: locations[i]
                    });
                    this.values.locations.push(location);
                }
            };
            Activity.prototype.addTag = function (item, event) {
                var newText = this.newTag();
                newText = (newText != null) ? newText.trim() : null;
                if((newText != null) && (newText.length != 0) && (!this.haveTag(newText))) {
                    var tag = {
                        id: 0,
                        number: 0,
                        text: newText,
                        domainTypeText: null,
                        domainKey: null,
                        modeText: this.modeText(),
                        isInstitution: false
                    };
                    var observableTag = ko.mapping.fromJS(tag);
                    this.values.tags.push(observableTag);
                }
                this.newTag(null);
            };
            Activity.prototype.removeTag = function (item, event) {
                this.values.tags.remove(item);
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
            Activity.prototype.validateUploadableFileTypeByExtension = function (activityId, inExtension) {
                var valid = true;
                var extension = inExtension;
                if((extension == null) || (extension.length == 0) || (extension.length > 255)) {
                    valid = false;
                } else {
                    if(extension[0] === ".") {
                        extension = extension.substring(1);
                    }
                    jQuery.ajax({
                        async: false,
                        type: 'POST',
                        url: App.Routes.WebApi.Activities.validateUploadFileTypeByExtension(activityId),
                        data: ko.toJSON(extension),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data, textStatus, jqXhr) {
                            valid = true;
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            valid = false;
                        }
                    });
                }
                return valid;
            };
            Activity.prototype.loadDocuments = function () {
                var _this = this;
                jQuery.ajax({
                    type: 'GET',
                    url: App.Routes.WebApi.Activities.getDocuments(this.id(), this.modeText()),
                    dataType: 'json',
                    success: function (documents, textStatus, jqXhr) {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {
                            }, this);
                            this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.getDocumentProxyImage(this.id(), data.id));
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
            Activity.prototype.deleteDocument = function (item, event) {
                var _this = this;
                jQuery.ajax({
                    type: 'DELETE',
                    url: App.Routes.WebApi.Activities.deleteDocument(this.id(), item.id()),
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.loadDocuments();
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert("Unable to delete document. " + textStatus + "|" + errorThrown);
                    }
                });
            };
            return Activity;
        })();
        Activities.Activity = Activity;        
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
