var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../typings/tinymce/tinymce.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    (function (InternationalAffiliations) {
        var InternationalAffiliation = (function () {
            function InternationalAffiliation(affiliationId) {
                /* True if any field changes. */
                this.dirtyFlag = ko.observable(false);
                this.initialLocations = [];
                this.selectedLocationValues = [];
                this._initialize(affiliationId);
            }
            InternationalAffiliation.prototype._initialize = function (affiliationId) {
                var fromToYearRange = 80;
                var thisYear = Number(moment().format('YYYY'));
                this.years = new Array();
                for (var i = 0; i < fromToYearRange; i += 1) {
                    this.years[i] = thisYear - i;
                }

                this.id = ko.observable(affiliationId);
            };

            InternationalAffiliation.prototype.setupWidgets = function (locationSelectorId) {
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
                    placeholder: "[Select Country/Location]"
                });

                $("#fromDate").kendoDropDownList({
                    dataSource: this.years,
                    value: me.from().toString(),
                    optionLabel: " ",
                    change: function (e) {
                        var toDateDropList = $("#toDate").data("kendoDropDownList");
                        if (toDateDropList.value() < this.value()) {
                            toDateDropList.value(this.value());
                        }
                        me.from(this.value());
                    }
                });

                $("#toDate").kendoDropDownList({
                    dataSource: this.years,
                    value: me.to(),
                    optionLabel: " ",
                    change: function (e) {
                        var fromDateDropList = $("#fromDate").data("kendoDropDownList");
                        if (fromDateDropList.value() > this.value()) {
                            fromDateDropList.value(this.value());
                        }
                        me.to(this.value());
                    }
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

                this.locations.extend({ atLeast: 1 });
                this.institution.extend({ required: true, maxLength: 200 });
                this.position.extend({ required: true, maxLength: 100 });
                this.from.extend({ required: true });

                ko.validation.group(this);
            };

            InternationalAffiliation.prototype.setupSubscriptions = function () {
                var _this = this;
                this.from.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.to.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.onGoing.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.institution.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.position.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };

            InternationalAffiliation.prototype.load = function () {
                var _this = this;
                var me = this;
                var deferred = $.Deferred();

                if (this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.from = ko.observable(0);
                    this.to = ko.observable(0);
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

            InternationalAffiliation.prototype.save = function (viewModel, event) {
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
                    from: this.from,
                    to: this.to,
                    onGoing: this.onGoing,
                    institution: this.institution,
                    position: this.position,
                    locations: ko.observableArray()
                };

                for (var i = 0; i < this.locations().length; i += 1) {
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

                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: model,
                    success: function (data, textStatus, jqXhr) {
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert(textStatus + " | " + errorThrown);
                    },
                    complete: function (jqXhr, textStatus) {
                        location.href = App.Routes.Mvc.My.Profile.get("international-affiliation");
                    }
                });
            };

            InternationalAffiliation.prototype.cancel = function (item, event, mode) {
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
                for (var i = 0; i < items.length; i += 1) {
                    var location = ko.mapping.fromJS({ id: 0, placeId: items[i].id, version: "" });
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
//# sourceMappingURL=InternationalAffiliation.js.map
