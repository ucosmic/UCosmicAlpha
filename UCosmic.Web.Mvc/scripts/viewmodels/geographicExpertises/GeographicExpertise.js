/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/tinymce/tinymce.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />
var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var GeographicExpertise = (function () {
            function GeographicExpertise(expertiseId) {
                /* True if any field changes. */
                this.dirtyFlag = ko.observable(false);
                this.initialLocations = [];
                this.selectedLocationValues = [];
                this._initialize(expertiseId);
            }
            GeographicExpertise.prototype._initialize = function (expertiseId) {
                this.id = ko.observable(expertiseId);
            };

            GeographicExpertise.prototype.setupWidgets = function (locationSelectorId) {
                var _this = this;
                this.locationSelectorId = locationSelectorId;

                /*
                There appears to be a number of bugs/undocumented behaviors associated
                with the KendoUI Multiselect when using a dataSource that gets data
                from service via ajax.
                
                1) The control will query the service as soon as focus us obtained.  Event
                with minLength at three, it will query the server with no keyword
                and the service will return ALL Places (quite large).  See note in
                GraphicExpertiseEdit.cshtml on how this problem was circumvented.
                (Note: autoBind: false did NOT fix this problem.)
                
                2) Setting the initial values (dataItems) does not work as expected when
                we started using the ajax datasource.  To solve the problem, we use
                the initial Places AS the datasource and then change the datasource
                later to the ajax service.
                */
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

                this.locations.extend({ atLeast: 1 });
                this.description.extend({ maxLength: 400 });

                ko.validation.group(this);
            };

            GeographicExpertise.prototype.setupSubscriptions = function () {
                var _this = this;
                this.description.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };

            GeographicExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();

                if (this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.description = ko.observable(null);
                    this.locations = ko.observableArray();
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);

                    deferred.resolve();
                } else {
                    var dataPact = $.Deferred();

                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.GeographicExpertise.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        }
                    });

                    // only process after all requests have been resolved
                    $.when(dataPact).done(function (data) {
                        ko.mapping.fromJS(data, {}, _this);

                        for (var i = 0; i < _this.locations().length; i += 1) {
                            _this.initialLocations.push({
                                officialName: _this.locations()[i].placeOfficialName(),
                                id: _this.locations()[i].placeId()
                            });

                            _this.selectedLocationValues.push(_this.locations()[i].placeId());
                        }

                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }

                return deferred;
            };

            GeographicExpertise.prototype.save = function (viewModel, event) {
                if (!this.isValid()) {
                    // TBD - need dialog here.
                    this.errors.showAllMessages();
                    return;
                }

                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    description: this.description,
                    locations: ko.observableArray()
                };

                for (var i = 0; i < this.locations().length; i += 1) {
                    mapSource.locations.push({
                        id: this.locations()[i].id,
                        version: this.locations()[i].version,
                        whenLastUpdated: this.locations()[i].whenLastUpdated,
                        whoLastUpdated: this.locations()[i].whoLastUpdated,
                        expertiseId: this.locations()[i].expertiseId,
                        placeOfficialName: this.locations()[i].placeOfficialName,
                        placeId: this.locations()[i].placeId
                    });
                }

                var model = ko.mapping.toJS(mapSource);

                var url = (viewModel.id() == 0) ? App.Routes.WebApi.GeographicExpertise.post() : App.Routes.WebApi.GeographicExpertise.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";

                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: model
                }).done(function (data, status, xhr) {
                }).fail(function (xhr, status, errorThrown) {
                    App.Failures.message(xhr, 'while trying to save your geographic expertise', true);
                }).always(function (xhr, status) {
                    location.href = App.Routes.Mvc.My.Profile.get("geographic-expertise");
                });
            };

            GeographicExpertise.prototype.cancel = function (item, event, mode) {
                if (this.dirtyFlag() == true) {
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
                                location.href = App.Routes.Mvc.My.Profile.get("geographic-expertise");
                            }
                        }
                    });
                } else {
                    location.href = App.Routes.Mvc.My.Profile.get("geographic-expertise");
                }
            };

            GeographicExpertise.prototype.updateLocations = function (items) {
                this.locations.removeAll();
                for (var i = 0; i < items.length; i += 1) {
                    var location = ko.mapping.fromJS({ id: 0, placeId: items[i].id, version: "" });
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
