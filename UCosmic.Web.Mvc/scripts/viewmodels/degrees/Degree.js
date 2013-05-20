var ViewModels;
(function (ViewModels) {
    (function (Degrees) {
        var Degree = (function () {
            function Degree(educationId) {
                this.inititializationErrors = "";
                this.saving = false;
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
                                        pageSize: 2147483647
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
                        if((dataItem.countryName != null) && (dataItem.countryName.length > 0)) {
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
                if(value != null) {
                    value = $.trim(value);
                }
                if((value == null) || (value.length == 0)) {
                    me.value(null);
                    this.institutionOfficialName(null);
                    this.institutionId(null);
                }
            };
            Degree.prototype.setupValidation = function () {
                this.title.extend({
                    required: true,
                    minLength: 1,
                    maxLength: 256
                });
                this.yearAwarded.extend({
                    min: 1900
                });
                ko.validation.group(this);
            };
            Degree.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.Degrees.get(this.id()),
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
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            Degree.prototype.save = function (viewModel, event) {
                var _this = this;
                if(!this.isValid()) {
                    return;
                }
                while(this.saving) {
                    alert("Please wait while degree is saved.");
                }
                if(this.yearAwarded() != null) {
                    var yearAwaredStr = this.yearAwarded().toString();
                    yearAwaredStr = $.trim(yearAwaredStr);
                    if(yearAwaredStr.length == 0) {
                        this.yearAwarded(null);
                    }
                }
                this.checkInstitutionForNull();
                var model = ko.mapping.toJS(this);
                this.saving = true;
                $.ajax({
                    type: 'PUT',
                    url: App.Routes.WebApi.Degrees.put(viewModel.id()),
                    data: model,
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        location.href = App.Routes.Mvc.My.Profile.get(3);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        alert(textStatus + " | " + errorThrown);
                        location.href = App.Routes.Mvc.My.Profile.get(3);
                    }
                });
            };
            Degree.prototype.isEmpty = function () {
                if((this.title() == "New Degree") && (this.yearAwarded() == null) && (this.institutionId() == null)) {
                    return true;
                }
                return false;
            };
            Degree.prototype.cancel = function (item, event, mode) {
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
                                    url: App.Routes.WebApi.Degrees.del(me.id()),
                                    success: function (data, textStatus, jqXHR) {
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        alert(textStatus);
                                    }
                                });
                            }
                            location.href = App.Routes.Mvc.My.Profile.get(3);
                        }
                    }
                });
            };
            return Degree;
        })();
        Degrees.Degree = Degree;        
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
