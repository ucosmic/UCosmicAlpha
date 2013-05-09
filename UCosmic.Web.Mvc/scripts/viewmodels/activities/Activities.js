var ViewModels;
(function (ViewModels) {
    (function (Activities) {
        var ActivitySearchInput = (function () {
            function ActivitySearchInput() { }
            return ActivitySearchInput;
        })();
        Activities.ActivitySearchInput = ActivitySearchInput;        
        var ActivityList = (function () {
            function ActivityList(personId) {
                this.personId = personId;
            }
            ActivityList.prototype.load = function () {
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
                var activitiesSearchInput = new ActivitySearchInput();
                activitiesSearchInput.personId = this.personId;
                activitiesSearchInput.orderBy = "";
                activitiesSearchInput.pageNumber = 1;
                activitiesSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.Activities.get(), activitiesSearchInput).done(function (data, textStatus, jqXHR) {
 {
                        dataPact.resolve(data);
                    }
                }).fail(function (jqXhr, textStatus, errorThrown) {
 {
                        dataPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(typesPact, locationsPact, dataPact).done(function (types, locations, data) {
                    _this.activityTypesList = types;
                    _this.activityLocationsList = locations;
 {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {
                            }, this);
                            this.proxyImageSource = App.Routes.WebApi.Activities.Documents.Thumbnail.get(this.id(), data.id);
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
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            ActivityList.prototype.deleteActivityById = function (activityId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.Activities.del(activityId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };
            ActivityList.prototype.deleteActivity = function (data, event, viewModel) {
                $("#confirmActivityDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteActivityById(data.id());
                                $(this).dialog("close");
                                location.href = App.Routes.Mvc.My.Profile.get();
                            }
                        }, 
                        {
                            text: "No, cancel delete",
                            click: function () {
                                $(this).dialog("close");
                            }
                        }, 
                        
                    ]
                });
            };
            ActivityList.prototype.editActivity = function (data, event, activityId) {
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.Activities.getEditState(activityId),
                    success: function (editState, textStatus, jqXHR) {
                        if(editState.isInEdit) {
                            $("#activityBeingEditedDialog").dialog({
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    Ok: function () {
                                        $(this).dialog("close");
                                        return;
                                    }
                                }
                            });
                        } else {
                            var element = event.target;
                            var url = null;
                            while((element != null) && (element.nodeName != 'TR')) {
                                element = element.parentElement;
                            }
                            if(element != null) {
                                url = element.attributes["href"].value;
                            }
                            if(url != null) {
                                location.href = url;
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            ActivityList.prototype.newActivity = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.Activities.post(),
                    success: function (newActivityId, textStatus, jqXHR) {
                        location.href = App.Routes.Mvc.My.Profile.activityEdit(newActivityId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            ActivityList.prototype.getTypeName = function (id) {
                var typeName = "";
                if(this.activityTypesList != null) {
                    var i = 0;
                    while((i < this.activityTypesList.length) && (id != this.activityTypesList[i].id)) {
                        i += 1;
                    }
                    if(i < this.activityTypesList.length) {
                        typeName = this.activityTypesList[i].type;
                    }
                }
                return typeName;
            };
            ActivityList.prototype.getLocationName = function (id) {
                var locationName = "";
                if(this.activityLocationsList != null) {
                    var i = 0;
                    while((i < this.activityLocationsList.length) && (id != this.activityLocationsList[i].id)) {
                        i += 1;
                    }
                    if(i < this.activityLocationsList.length) {
                        locationName = this.activityLocationsList[i].officialName;
                    }
                }
                return locationName;
            };
            ActivityList.prototype.activityDatesFormatted = function (startsOnStr, endsOnStr, onGoing, dateFormat) {
                var formattedDateRange = "";
                dateFormat = (dateFormat != null) ? dateFormat.toUpperCase() : "MM/DD/YYYY";
                if(startsOnStr == null) {
                    if(endsOnStr != null) {
                        formattedDateRange = moment(endsOnStr).format(dateFormat);
                    }
                } else {
                    formattedDateRange = moment(startsOnStr).format(dateFormat);
                    if(onGoing) {
                        formattedDateRange += " -";
                    } else if(endsOnStr != null) {
                        formattedDateRange += " - " + moment(endsOnStr).format(dateFormat);
                    }
                }
                if(formattedDateRange.length > 0) {
                    formattedDateRange += "\xa0\xa0";
                }
                return formattedDateRange;
            };
            ActivityList.prototype.activityTypesFormatted = function (types) {
                var formattedTypes = "";
                var location;
                for(var i = 0; i < this.activityTypesList.length; i += 1) {
                    for(var j = 0; j < types.length; j += 1) {
                        if(types[j].typeId() == this.activityTypesList[i].id) {
                            if(formattedTypes.length > 0) {
                                formattedTypes += "; ";
                            }
                            formattedTypes += this.activityTypesList[i].type;
                        }
                    }
                }
                return formattedTypes;
            };
            ActivityList.prototype.activityLocationsFormatted = function (locations) {
                var formattedLocations = "";
                var location;
                for(var i = 0; i < locations.length; i += 1) {
                    if(i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += this.getLocationName(locations[i].placeId());
                }
                return formattedLocations;
            };
            return ActivityList;
        })();
        Activities.ActivityList = ActivityList;        
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
