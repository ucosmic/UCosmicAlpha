var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var GeographicExpertise = (function () {
            function GeographicExpertise(educationId) {
                this.inititializationErrors = "";
                this.saving = false;
                this._initialize(educationId);
            }
            GeographicExpertise.prototype._initialize = function (expertiseId) {
                this.id = ko.observable(expertiseId);
            };
            GeographicExpertise.prototype.setupWidgets = function (locationSelectorId) {
                var _this = this;
                this.locationSelectorId = locationSelectorId;
                $("#" + locationSelectorId).kendoAutoComplete({
                    minLength: 3,
                    filter: "contains",
                    ignoreCase: true,
                    placeholder: "[Enter Location]",
                    dataTextField: "officialName",
                    dataSource: new kendo.data.DataSource({
                        serverFiltering: true,
                        transport: {
                            read: function (options) {
                                $.ajax({
                                    url: App.Routes.WebApi.Places.get(),
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
                    select: function (e) {
                        var me = $("#" + locationSelectorId).data("kendoAutoComplete");
                        var dataItem = me.dataItem(e.item.index());
                        _this.placeId(dataItem.id);
                        if((dataItem.placeOfficialName != null) && (dataItem.placeOfficialName.length > 0)) {
                            _this.placeOfficialName(dataItem.placeOfficialName);
                        } else {
                            _this.placeOfficialName(null);
                        }
                    }
                });
            };
            GeographicExpertise.prototype.setupValidation = function () {
                this.placeId.extend({
                    required: true
                });
                ko.validation.group(this);
            };
            GeographicExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
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
                $.when(dataPact).done(function (data) {
                    ko.mapping.fromJS(data, {
                    }, _this);
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            GeographicExpertise.prototype.save = function (viewModel, event) {
                var _this = this;
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
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        alert(textStatus + " | " + errorThrown);
                    }
                });
                location.href = App.Routes.Mvc.My.Profile.get(3);
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
            return GeographicExpertise;
        })();
        GeographicExpertises.GeographicExpertise = GeographicExpertise;        
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
