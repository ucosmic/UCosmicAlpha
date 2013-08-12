var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../activities/ServiceApiModel.d.ts" />
    (function (Activities) {
        var ActivitySearchInput = (function () {
            function ActivitySearchInput() {
            }
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

                // only process after all requests have been resolved
                $.when(typesPact, locationsPact, dataPact).done(function (types, locations, data) {
                    _this.activityTypesList = types;
                    _this.activityLocationsList = locations;

                     {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {}, this);
                            this.proxyImageSource = App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: ActivityList.iconMaxSide });
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

            ActivityList.prototype.deleteActivity = function (data, e, viewModel) {
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

                                /* TBD - Don't reload page. */
                                location.href = App.Routes.Mvc.My.Profile.get();
                            }
                        },
                        {
                            text: "No, cancel delete",
                            click: function () {
                                $(this).dialog("close");
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };

            ActivityList.prototype.editActivity = function (activityId) {
                var returnValue = false;
                $.ajax({
                    type: 'GET',
                    async: false,
                    url: App.Routes.WebApi.Activities.getEditState(activityId)
                }).done(function (editState, textStatus, jqXHR) {
                    if (editState.isInEdit) {
                        var $dialog = $("#activityBeingEditedDialog");
                        $dialog.dialog({
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                Ok: function () {
                                    $dialog.dialog("close");
                                }
                            }
                        });
                    } else {
                        returnValue = true;
                    }
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to edit your activity', true);
                });
                return returnValue;
            };

            ActivityList.prototype.editActivityUrl = function (id) {
                return App.Routes.Mvc.My.Profile.activityEdit(id);
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

                if (this.activityTypesList != null) {
                    var i = 0;
                    while ((i < this.activityTypesList.length) && (id != this.activityTypesList[i].id)) {
                        i += 1;
                    }

                    if (i < this.activityTypesList.length) {
                        typeName = this.activityTypesList[i].type;
                    }
                }

                return typeName;
            };

            ActivityList.prototype.getLocationName = function (id) {
                var locationName = "";

                if (this.activityLocationsList != null) {
                    var i = 0;
                    while ((i < this.activityLocationsList.length) && (id != this.activityLocationsList[i].id)) {
                        i += 1;
                    }

                    if (i < this.activityLocationsList.length) {
                        locationName = this.activityLocationsList[i].officialName;
                    }
                }

                return locationName;
            };

            ActivityList.prototype.activityDatesFormatted = function (startsOnStr, endsOnStr, onGoing, dateFormat) {
                var formattedDateRange = "";

                /* May need a separate function to convert from CLR custom date formats to moment formats */
                dateFormat = (dateFormat != null) ? dateFormat.toUpperCase() : "MM/DD/YYYY";

                if (startsOnStr == null) {
                    if (endsOnStr != null) {
                        formattedDateRange = moment(endsOnStr).format(dateFormat);
                    }
                } else {
                    formattedDateRange = moment(startsOnStr).format(dateFormat);
                    if (onGoing) {
                        formattedDateRange += " (Ongoing)";
                    } else if (endsOnStr != null) {
                        formattedDateRange += " - " + moment(endsOnStr).format(dateFormat);
                    }
                }

                if (formattedDateRange.length > 0) {
                    formattedDateRange += "\xa0\xa0";
                }

                return formattedDateRange;
            };

            ActivityList.prototype.activityTypesFormatted = function (types) {
                var formattedTypes = "";
                var location;

                for (var i = 0; i < this.activityTypesList.length; i += 1) {
                    for (var j = 0; j < types.length; j += 1) {
                        if (types[j].typeId() == this.activityTypesList[i].id) {
                            if (formattedTypes.length > 0) {
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

                for (var i = 0; i < locations.length; i += 1) {
                    if (i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += this.getLocationName(locations[i].placeId());
                }

                return formattedLocations;
            };
            ActivityList.iconMaxSide = 64;
            return ActivityList;
        })();
        Activities.ActivityList = ActivityList;
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
