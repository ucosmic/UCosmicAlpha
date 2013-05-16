var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var GeographicExpertise = (function () {
            function GeographicExpertise(educationId) {
                this.inititializationErrors = "";
                this.saving = false;
                this.dirtyFlag = ko.observable(false);
                this.selectedLocations = ko.observableArray();
                this._initialize(educationId);
            }
            GeographicExpertise.prototype._initialize = function (expertiseId) {
                this.id = ko.observable(expertiseId);
            };
            GeographicExpertise.prototype.setupWidgets = function (locationSelectorId) {
                var _this = this;
                this.locationSelectorId = locationSelectorId;
                $("#" + locationSelectorId).kendoMultiSelect({
                    ignoreCase: true,
                    dataTextField: "officialName",
                    dataValueField: "id",
                    minLength: 3,
                    dataSource: new kendo.data.DataSource({
                        serverFiltering: true,
                        transport: {
                            read: function (options) {
                                if(options.data.filter != null) {
                                    $.ajax({
                                        url: App.Routes.WebApi.Places.get(),
                                        data: {
                                            keyword: (options.data.filter != null) ? options.data.filter.filters[0].value : null
                                        }
                                    });
                                }
                            }
                        }
                    }),
                    value: this.selectedLocations(),
                    change: function (event) {
                        _this.updateLocations(event.sender.value());
                    },
                    placeholder: "[Select Country/Location, Body of Water or Global]"
                });
            };
            GeographicExpertise.prototype.setupValidation = function () {
                ko.validation.rules['atLeast'] = {
                    validator: function (val, otherVal) {
                        return val.length >= otherVal;
                    },
                    message: 'At least {0} must be selected.'
                };
                ko.validation.registerExtenders();
                this.locations.extend({
                    atLeast: 1
                });
                this.description.extend({
                    maxLength: 400
                });
                ko.validation.group(this);
            };
            GeographicExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                if(this.id() == 0) {
                    this.version = ko.observable(null);
                    this.entityId = ko.observable(null);
                    this.description = ko.observable(null);
                    this.locations = ko.observableArray();
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    deferred.resolve();
                } else {
                    var locationsPact = $.Deferred();
                    $.get(App.Routes.WebApi.Places.get()).done(function (data, textStatus, jqXHR) {
                        locationsPact.resolve(data);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        locationsPact.reject(jqXHR, textStatus, errorThrown);
                    });
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.GeographicExpertises.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        }
                    });
                    $.when(locationsPact, dataPact).done(function (locations, data) {
                        ko.mapping.fromJS(data, {
                        }, _this);
                        for(var i = 0; i < _this.locations().length; i += 1) {
                            _this.selectedLocations.push(_this.locations()[i].placeId());
                        }
                        _this.description.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            GeographicExpertise.prototype.save = function (viewModel, event) {
                var _this = this;
                if(!this.isValid()) {
                    return;
                }
                while(this.saving) {
                    alert("Please wait while expertise is saved.");
                }
                var model = ko.mapping.toJS(this);
                this.saving = true;
                $.ajax({
                    type: 'PUT',
                    url: App.Routes.WebApi.GeographicExpertises.put(viewModel.id()),
                    data: model,
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        location.href = App.Routes.Mvc.My.Profile.get(1);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        alert(textStatus + " | " + errorThrown);
                        location.href = App.Routes.Mvc.My.Profile.get(1);
                    }
                });
            };
            GeographicExpertise.prototype.deleteExpertise = function (id) {
            };
            GeographicExpertise.prototype.cancel = function (item, event, mode) {
                if(this.dirtyFlag() == true) {
                    var me = this;
                    $("#cancelConfirmDialog").dialog({
                        modal: true,
                        resizable: false,
                        width: 450,
                        buttons: {
                            "Do not cancel": function () {
                                $(this).dialog("close");
                            },
                            "Cancel and lose changes": function () {
                                $(this).dialog("close");
                                location.href = App.Routes.Mvc.My.Profile.get(1);
                            }
                        }
                    });
                }
            };
            GeographicExpertise.prototype.updateLocations = function (locations) {
                this.locations.removeAll();
                for(var i = 0; i < locations.length; i += 1) {
                    var location = ko.mapping.fromJS({
                        id: 0,
                        placeId: locations[i],
                        version: ""
                    });
                    this.locations.push(location);
                }
                this.dirtyFlag(true);
            };
            return GeographicExpertise;
        })();
        GeographicExpertises.GeographicExpertise = GeographicExpertise;        
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
