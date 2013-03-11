var ViewModels;
(function (ViewModels) {
    (function (Activities) {
        var ActivitySearchInput = (function () {
            function ActivitySearchInput() { }
            return ActivitySearchInput;
        })();
        Activities.ActivitySearchInput = ActivitySearchInput;        
        var ActivityList = (function () {
            function ActivityList(bindingId, personId) {
                this.personId = personId;
                this._initialize(bindingId);
            }
            ActivityList.prototype._initialize = function (bindingId) {
                var _this = this;
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Locations.get()).done(function (data, textStatus, jqXHR) {
                    locationsPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });
                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Types.get()).done(function (data, textStatus, jqXHR) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var dataPact = $.Deferred();
                var activitiesSearchInput = new ActivitySearchInput();
                activitiesSearchInput.personId = this.personId;
                activitiesSearchInput.orderBy = "";
                activitiesSearchInput.pageNumber = 1;
                activitiesSearchInput.pageSize = 10;
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.Activities.get(),
                    data: activitiesSearchInput,
                    success: function (data, textStatus, jqXHR) {
                        dataPact.resolve(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        dataPact.reject(jqXHR, textStatus, errorThrown);
                    },
                    dataType: 'json'
                });
                $.when(typesPact, locationsPact, dataPact).then(function (types, locations, data) {
                    _this.activityTypesList = types;
                    _this.activityLocationsList = locations;
                    ko.mapping.fromJS(data, {
                    }, _this);
                    ko.applyBindings(_this, $("#" + bindingId)[0]);
                }, function (xhr, textStatus, errorThrown) {
                });
            };
            ActivityList.prototype.deleteActivityById = function (activityId) {
                $.ajax({
                    type: "DELETE",
                    url: App.Routes.WebApi.Activities.Delete.get() + activityId.toString(),
                    success: function (data, textStatus, jqXHR) {
                        alert(textStatus);
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
                                viewModel.deleteActivityById(data.revisionId());
                                $(this).dialog("close");
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
                var element = event.srcElement;
                var url = null;
                while((element != null) && (element.nodeName != 'TR')) {
                    element = element.parentElement;
                }
                if(element != null) {
                    url = element.attributes["href"].value;
                }
                if(url != null) {
                    if(activityId == null) {
                        location.href = url;
                    } else {
                        location.href = url + activityId.toString();
                    }
                }
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
                    while((i < this.activityLocationsList.length) && (id != this.activityLocationsList[i].placeId)) {
                        i += 1;
                    }
                    if(i < this.activityLocationsList.length) {
                        locationName = this.activityLocationsList[i].officialName;
                    }
                }
                return locationName;
            };
            ActivityList.prototype.activityDatesFormatted = function (startsOnStr, endsOnStr) {
                var formattedDateRange = "";
                var startsOn = (startsOnStr != null) ? new Date(startsOnStr) : null;
                var endsOn = (endsOnStr != null) ? new Date(endsOnStr) : null;
                if(startsOn == null) {
                    if(endsOn != null) {
                        formattedDateRange = endsOn.getMonth() + "/" + endsOn.getDate() + "/" + endsOn.getFullYear();
                    }
                } else {
                    formattedDateRange = startsOn.getMonth() + "/" + startsOn.getDate() + "/" + startsOn.getFullYear();
                    if(endsOn != null) {
                        formattedDateRange += " - " + endsOn.getMonth() + "/" + endsOn.getDate() + "/" + endsOn.getFullYear();
                    }
                }
                if(formattedDateRange.length > 0) {
                    formattedDateRange += "\xa0\xa0";
                }
                return formattedDateRange;
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
