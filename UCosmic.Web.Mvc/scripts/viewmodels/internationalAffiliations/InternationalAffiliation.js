var ViewModels;
(function (ViewModels) {
    (function (InternationalAffiliations) {
        var InternationalAffiliation = (function () {
            function InternationalAffiliation(affiliationId) {
                this.inititializationErrors = "";
                this.saving = false;
                this.dirtyFlag = ko.observable(false);
                this.initialLocations = new Array();
                this.selectedLocationValues = new Array();
                this._initialize(affiliationId);
            }
            InternationalAffiliation.prototype._initialize = function (affiliationId) {
                if(affiliationId === "new") {
                    this.id = ko.observable(0);
                } else {
                    this.id = ko.observable(Number(affiliationId));
                }
            };
            InternationalAffiliation.prototype.setupWidgets = function (locationSelectorId) {
                var _this = this;
                this.locationSelectorId = locationSelectorId;
                var me = this;
                $("#" + locationSelectorId).kendoMultiSelect({
                    autoBind: true,
                    dataTextField: "officialName",
                    dataValueField: "id",
                    minLength: 3,
                    dataSource: me.initialLocations,
                    value: me.selectedLocationValues,
                    change: function (event) {
                        _this.updateLocations(event.sender.dataItems());
                    },
                    placeholder: "[Select Country/Location]"
                });
            };
            InternationalAffiliation.prototype.setupValidation = function () {
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
                this.institution.extend({
                    maxLength: 200
                });
                this.position.extend({
                    maxLength: 100
                });
                ko.validation.group(this);
            };
            InternationalAffiliation.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                if(this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.from = ko.observable(Date.now);
                    this.to = ko.observable(null);
                    this.onGoing = ko.observable(false);
                    this.institution = ko.observable(null);
                    this.position = ko.observable(null);
                    this.locations = ko.observableArray();
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    deferred.resolve();
                } else {
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.InternationalAffiliations.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        }
                    });
                    $.when(dataPact).done(function (data) {
                        ko.mapping.fromJS(data, {
                        }, _this);
                        for(var i = 0; i < _this.locations().length; i += 1) {
                            _this.initialLocations.push({
                                officialName: _this.locations()[i].placeOfficialName(),
                                id: _this.locations()[i].placeId()
                            });
                            _this.selectedLocationValues.push(_this.locations()[i].placeId());
                        }
                        _this.from.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.to.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.onGoing.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.institution.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.position.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            InternationalAffiliation.prototype.save = function (viewModel, event) {
                var _this = this;
                if(!this.isValid()) {
                    return;
                }
                while(this.saving) {
                    alert("Please wait while affiliation is saved.");
                }
                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    from: this.from,
                    to: this.to,
                    onGoing: this.onGoing,
                    institution: this.institution,
                    position: this.position,
                    locations: ko.observableArray()
                };
                for(var i = 0; i < this.locations().length; i += 1) {
                    mapSource.locations.push({
                        id: this.locations()[i].id,
                        version: this.locations()[i].version,
                        whenLastUpdated: this.locations()[i].whenLastUpdated,
                        whoLastUpdated: this.locations()[i].whoLastUpdated,
                        affiliationId: this.locations()[i].affiliationId,
                        placeOfficialName: this.locations()[i].placeOfficialName,
                        placeId: this.locations()[i].placeId
                    });
                }
                var model = ko.mapping.toJS(mapSource);
                var url = (viewModel.id() == 0) ? App.Routes.WebApi.InternationalAffiliations.post() : App.Routes.WebApi.InternationalAffiliations.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";
                this.saving = true;
                $.ajax({
                    type: type,
                    url: url,
                    data: model,
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        location.href = App.Routes.Mvc.My.Profile.get("international-affiliation");
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        alert(textStatus + " | " + errorThrown);
                        location.href = App.Routes.Mvc.My.Profile.get("international-affiliation");
                    }
                });
            };
            InternationalAffiliation.prototype.cancel = function (item, event, mode) {
                if(this.dirtyFlag() == true) {
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
                                location.href = App.Routes.Mvc.My.Profile.get("international-affiliation");
                            }
                        }
                    });
                } else {
                    location.href = App.Routes.Mvc.My.Profile.get("international-affiliation");
                }
            };
            InternationalAffiliation.prototype.updateLocations = function (items) {
                this.locations.removeAll();
                for(var i = 0; i < items.length; i += 1) {
                    var location = ko.mapping.fromJS({
                        id: 0,
                        placeId: items[i].id,
                        version: ""
                    });
                    this.locations.push(location);
                }
                this.dirtyFlag(true);
            };
            return InternationalAffiliation;
        })();
        InternationalAffiliations.InternationalAffiliation = InternationalAffiliation;        
    })(ViewModels.InternationalAffiliations || (ViewModels.InternationalAffiliations = {}));
    var InternationalAffiliations = ViewModels.InternationalAffiliations;
})(ViewModels || (ViewModels = {}));
