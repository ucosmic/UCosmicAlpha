var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var GeographicExpertise = (function () {
            function GeographicExpertise(educationId) {
                this.inititializationErrors = "";
                this.saving = false;
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
                    filter: 'contains',
                    ignoreCase: true,
                    dataTextField: "officialName",
                    dataValueField: "id",
                    minLength: 3,
                    maxSelectedItems: 1,
                    dataSource: this.locationsDataSource,
                    value: this.selectedLocations(),
                    change: function (event) {
                        _this.updateLocations(event.sender.value());
                    },
                    placeholder: "[Select Country/Location, Body of Water or Global]"
                });
            };
            GeographicExpertise.prototype.setupValidation = function () {
                ko.validation.rules['numberNotNull'] = {
                    validator: function (val, otherVal) {
                        return val != null;
                    },
                    message: 'Required.'
                };
                ko.validation.registerExtenders();
                this.placeId.extend({
                    numberNotNull: 0
                });
                this.description.extend({
                    maxLength: 400
                });
                ko.validation.group(this);
            };
            GeographicExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
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
                    _this.locationsDataSource = locations;
                    ko.mapping.fromJS(data, {
                    }, _this);
                    _this.selectedLocations.push(_this.placeId());
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
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
            GeographicExpertise.prototype.isEmpty = function () {
                if((this.placeOfficialName() == "Global") && (this.description() == null)) {
                    return true;
                }
                return false;
            };
            GeographicExpertise.prototype.cancel = function (item, event, mode) {
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
                            if(me.isEmpty()) {
                                $.ajax({
                                    async: false,
                                    type: "DELETE",
                                    url: App.Routes.WebApi.GeographicExpertises.del(me.id()),
                                    success: function (data, textStatus, jqXHR) {
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        alert(textStatus);
                                    }
                                });
                            }
                            location.href = App.Routes.Mvc.My.Profile.get(1);
                        }
                    }
                });
            };
            GeographicExpertise.prototype.updateLocations = function (locations) {
                this.placeId(locations.length > 0 ? locations[0] : null);
            };
            return GeographicExpertise;
        })();
        GeographicExpertises.GeographicExpertise = GeographicExpertise;        
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
