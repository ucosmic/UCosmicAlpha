var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="ServiceApiModel.d.ts" />
    (function (Degrees) {
        var Degree = (function () {
            function Degree(educationId) {
                /* True if any field changes. */
                this.dirtyFlag = ko.observable(false);
                this._initialize(educationId);
            }
            Degree.prototype._initialize = function (degreeId) {
                this.id = ko.observable(degreeId);
            };

            Degree.prototype.setupWidgets = function (institutionSelectorId) {
                var _this = this;
                this.institutionSelectorId = institutionSelectorId;

                $("#" + institutionSelectorId).kendoAutoComplete({
                    minLength: 3,
                    filter: "contains",
                    ignoreCase: true,
                    placeholder: "[Enter Institution]",
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
                                        pageSize: App.Constants.int32Max
                                    },
                                    success: function (results) {
                                        options.success(results.items);
                                    }
                                });
                            }
                        }
                    }),
                    change: function (e) {
                        _this.checkInstitutionForNull();
                    },
                    select: function (e) {
                        var me = $("#" + institutionSelectorId).data("kendoAutoComplete");
                        var dataItem = me.dataItem(e.item.index());
                        _this.institutionOfficialName(dataItem.officialName);
                        _this.institutionId(dataItem.id);
                        if ((dataItem.countryName != null) && (dataItem.countryName.length > 0)) {
                            _this.institutionCountryOfficialName(dataItem.countryName);
                        } else {
                            _this.institutionCountryOfficialName(null);
                        }
                    }
                });
            };

            Degree.prototype.checkInstitutionForNull = function () {
                var me = $("#" + this.institutionSelectorId).data("kendoAutoComplete");
                var value = (me.value() != null) ? me.value().toString() : null;
                if (value != null) {
                    value = $.trim(value);
                }
                if ((value == null) || (value.length == 0)) {
                    me.value(null);
                    this.institutionOfficialName(null);
                    this.institutionId(null);
                }
            };

            Degree.prototype.setupValidation = function () {
                this.title.extend({ required: true, minLength: 1, maxLength: 256 });
                this.yearAwarded.extend({ min: 1900 });

                ko.validation.group(this);
            };

            Degree.prototype.setupSubscriptions = function () {
                var _this = this;
                this.title.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.fieldOfStudy.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.yearAwarded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.institutionId.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };

            Degree.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();

                if (this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.title = ko.observable(null);
                    this.fieldOfStudy = ko.observable(null);
                    this.yearAwarded = ko.observable(null);
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    this.institutionId = ko.observable(null);
                    this.institutionOfficialName = ko.observable(null);
                    this.institutionCountryOfficialName = ko.observable(null);
                    deferred.resolve();
                } else {
                    var dataPact = $.Deferred();

                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.My.Degrees.get(this.id()),
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

                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }

                return deferred;
            };

            Degree.prototype.save = function (viewModel, event) {
                if (!this.isValid()) {
                    // TBD - need dialog here.
                    this.errors.showAllMessages();
                    return;
                }

                if (this.yearAwarded() != null) {
                    var yearAwaredStr = this.yearAwarded().toString();
                    yearAwaredStr = $.trim(yearAwaredStr);
                    if (yearAwaredStr.length == 0) {
                        this.yearAwarded(null);
                    }
                }

                /* If there is no institution, return institutionId as null, not 0 */
                this.checkInstitutionForNull();

                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    title: this.title,
                    fieldOfStudy: this.fieldOfStudy,
                    yearAwarded: this.yearAwarded,
                    institutionId: this.institutionId
                };

                var model = ko.mapping.toJS(mapSource);

                var url = (viewModel.id() == 0) ? App.Routes.WebApi.My.Degrees.post() : App.Routes.WebApi.My.Degrees.put(viewModel.id());

                var type = (viewModel.id() == 0) ? "POST" : "PUT";

                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: model,
                    success: function (data, textStatus, jqXhr) {
                    },
                    error: function (xhr) {
                        App.Failures.message(xhr, 'while trying to save your degree', true);
                    },
                    complete: function (jqXhr, textStatus) {
                        location.href = App.Routes.Mvc.My.Profile.get() + '#/formal-education';
                    }
                });
            };

            Degree.prototype.cancel = function (item, event, mode) {
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
                                location.href = App.Routes.Mvc.My.Profile.get("formal-education");
                            }
                        }
                    });
                } else {
                    //location.href = App.Routes.Mvc.My.Profile.get() + '#/formal-education';
                    history.back();
                }
            };
            return Degree;
        })();
        Degrees.Degree = Degree;
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
//# sourceMappingURL=Degree.js.map
