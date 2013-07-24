var ViewModels;
(function (ViewModels) {
    (function (Employees) {
        var FacultyAndStaff = (function () {
            function FacultyAndStaff(institutionInfo) {
                this.inititializationErrors = "";
                this._initialize(institutionInfo);
            }
            FacultyAndStaff.prototype._initialize = function (institutionInfo) {
                this.initialLocations = new Array();
                this.selectedLocationValues = new Array();
                this.fromDate = ko.observable();
                this.toDate = ko.observable();
                this.institutionId = ko.observable(null);
                this.institutionOfficialName = ko.observable(null);
                this.institutionCountryOfficialName = ko.observable(null);
                this.institutionHasCampuses = ko.observable(false);
                this.activityTypes = ko.observableArray();
                this.isHeatmapVisible = ko.observable(true);
                this.isPointmapVisible = ko.observable(false);
                this.isTableVisible = ko.observable(false);
                this.searchType = ko.observable('activities');
                if(institutionInfo != null) {
                    if(institutionInfo.InstitutionId != null) {
                        this.institutionId(Number(institutionInfo.InstitutionId));
                    }
                    if(institutionInfo.ActivityTypes != null) {
                        for(var i = 0; i < institutionInfo.ActivityTypes.length; i += 1) {
                            this.activityTypes.push(ko.observable({
                                id: institutionInfo.ActivityTypes[i].Id,
                                type: institutionInfo.ActivityTypes[i].Name,
                                filter: ko.observable(true)
                            }));
                        }
                    }
                    if(institutionInfo.InstitutionHasCampuses != null) {
                        this.institutionHasCampuses(Boolean(institutionInfo.InstitutionHasCampuses));
                    }
                }
            };
            FacultyAndStaff.prototype.setupWidgets = function (locationSelectorId, fromDatePickerId, toDatePickerId, institutionSelectorId, campusDropListId, collegeDropListId, departmentDropListId) {
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
                $("#" + fromDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
                $("#" + toDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
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
                                    url: App.Routes.WebApi.Establishments.getUniversities(),
                                    dataType: 'json',
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
                $("#" + departmentDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: {
                        officialName: "ALL",
                        id: 0
                    },
                    change: function (e) {
                    },
                    dataBound: function (e) {
                        if((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if(item == null) {
                                this.text("");
                                $("#departmenDiv").hide();
                            } else {
                                $("#departmenDiv").show();
                            }
                        } else {
                            $("#departmenDiv").hide();
                        }
                    }
                });
                var collegeDropListDataSource = null;
                if(!this.institutionHasCampuses()) {
                    collegeDropListDataSource = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.Establishments.getChildren(this.institutionId(), true)
                            }
                        }
                    });
                }
                $("#" + collegeDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: {
                        officialName: "ALL",
                        id: 0
                    },
                    dataSource: collegeDropListDataSource,
                    change: function (e) {
                        var selectedIndex = e.sender.selectedIndex;
                        if(selectedIndex != -1) {
                            var item = this.dataItem(selectedIndex);
                            if((item != null) && (item.id != 0)) {
                                var dataSource = new kendo.data.DataSource({
                                    transport: {
                                        read: {
                                            url: App.Routes.WebApi.Establishments.getChildren(item.id, true)
                                        }
                                    }
                                });
                                $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(dataSource);
                            }
                        }
                    },
                    dataBound: function (e) {
                        if((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if((item != null) && (item.id != 0)) {
                                var collegeId = item.id;
                                if(collegeId != null) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(collegeId, true)
                                            }
                                        }
                                    });
                                    $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        }
                    }
                });
                if(this.institutionHasCampuses()) {
                    $("#" + campusDropListId).kendoDropDownList({
                        dataTextField: "officialName",
                        dataValueField: "id",
                        optionLabel: {
                            officialName: "ALL",
                            id: 0
                        },
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.Establishments.getChildren(this.institutionId(), true)
                                }
                            }
                        }),
                        change: function (e) {
                            var selectedIndex = e.sender.selectedIndex;
                            if((selectedIndex != null) && (selectedIndex != -1)) {
                                var item = this.dataItem(selectedIndex);
                                if((item != null) && (item.id != 0)) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(item.id, true)
                                            }
                                        }
                                    });
                                    $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        },
                        dataBound: function (e) {
                            if((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                                var item = this.dataItem(this.selectedIndex);
                                if((item != null) && (item.id != 0)) {
                                    var campusId = item.id;
                                    if(campusId != null) {
                                        var dataSource = new kendo.data.DataSource({
                                            transport: {
                                                read: {
                                                    url: App.Routes.WebApi.Establishments.getChildren(campusId, true)
                                                }
                                            }
                                        });
                                        $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(dataSource);
                                    }
                                } else {
                                    $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(null);
                                }
                            }
                        }
                    });
                }
            };
            FacultyAndStaff.prototype.setupValidation = function () {
            };
            FacultyAndStaff.prototype.setupSubscriptions = function () {
            };
            FacultyAndStaff.prototype.load = function () {
                var _this = this;
                var me = this;
                var deferred = $.Deferred();
                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get()).done(function (data, textStatus, jqXHR) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });
                $.when(typesPact).done(function (types) {
                    _this.activityTypes = ko.mapping.fromJS(types);
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            FacultyAndStaff.prototype.checkInstitutionForNull = function () {
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
            FacultyAndStaff.prototype.updateLocations = function (items) {
                if(this.locations != null) {
                    this.locations.removeAll();
                    for(var i = 0; i < items.length; i += 1) {
                        var location = ko.mapping.fromJS({
                            id: 0,
                            placeId: items[i].id,
                            version: ""
                        });
                        this.locations.push(location);
                    }
                }
            };
            FacultyAndStaff.prototype.selectMap = function (type) {
                $('#heatmapText').css("font-weight", "normal");
                this.isHeatmapVisible(false);
                $('#pointmapText').css("font-weight", "normal");
                this.isPointmapVisible(false);
                $('#resultstableText').css("font-weight", "normal");
                this.isTableVisible(false);
                if(type === "heatmap") {
                    $('#heatmapText').css("font-weight", "bold");
                    this.isHeatmapVisible(true);
                } else if(type === "pointmap") {
                    $('#pointmapText').css("font-weight", "bold");
                    this.isPointmapVisible(true);
                } else if(type === "resultstable") {
                    $('#resultstableText').css("font-weight", "bold");
                    this.isTableVisible(true);
                }
            };
            return FacultyAndStaff;
        })();
        Employees.FacultyAndStaff = FacultyAndStaff;        
    })(ViewModels.Employees || (ViewModels.Employees = {}));
    var Employees = ViewModels.Employees;
})(ViewModels || (ViewModels = {}));
