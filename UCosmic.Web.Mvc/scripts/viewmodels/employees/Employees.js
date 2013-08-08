var ViewModels;
(function (ViewModels) {
    (function (Employees) {
        var FacultyAndStaff = (function () {
            function FacultyAndStaff(institutionInfo) {
                this.inititializationErrors = "";
                this._initialize(institutionInfo);
            }
            FacultyAndStaff.prototype._initialize = function (institutionInfo) {
                this.sammy = Sammy();
                this.initialLocations = new Array();
                this.selectedLocationValues = new Array();
                this.fromDate = ko.observable();
                this.toDate = ko.observable();
                this.institutionId = ko.observable(null);
                this.institutionOfficialName = ko.observable(null);
                this.institutionCountryOfficialName = ko.observable(null);
                this.institutionHasCampuses = ko.observable(false);
                this.activityTypes = ko.observableArray();
                this.selectedActivityIds = ko.observableArray();
                this.isHeatmapVisible = ko.observable(true);
                this.isPointmapVisible = ko.observable(false);
                this.isTableVisible = ko.observable(false);
                this.searchType = ko.observable('activities');
                this.selectedPlace = ko.observable(null);
                this.isGlobalView = ko.observable(true);
                this.loadSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(200));
                this.barchartWorldDataTable_cached = null;
                this.selectSearchType('activities');
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
                                    url: App.Routes.WebApi.Establishments.get(),
                                    data: {
                                        typeEnglishNames: [
                                            'University', 
                                            'University System'
                                        ]
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
                                url: App.Routes.WebApi.Establishments.getChildren(this.institutionId()),
                                data: {
                                    orderBy: [
                                        'rank-asc', 
                                        'name-asc'
                                    ]
                                }
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
                                            url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                            data: {
                                                orderBy: [
                                                    'rank-asc', 
                                                    'name-asc'
                                                ]
                                            }
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
                                                url: App.Routes.WebApi.Establishments.getChildren(collegeId),
                                                data: {
                                                    orderBy: [
                                                        'rank-asc', 
                                                        'name-asc'
                                                    ]
                                                }
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
                                    url: App.Routes.WebApi.Establishments.getChildren(this.institutionId()),
                                    data: {
                                        orderBy: [
                                            'rank-asc', 
                                            'name-asc'
                                        ]
                                    }
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
                                                url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                                data: {
                                                    orderBy: [
                                                        'rank-asc', 
                                                        'name-asc'
                                                    ]
                                                }
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
                                                    url: App.Routes.WebApi.Establishments.getChildren(campusId),
                                                    data: {
                                                        orderBy: [
                                                            'rank-asc', 
                                                            'name-asc'
                                                        ]
                                                    }
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
            FacultyAndStaff.prototype.setupRouting = function () {
                var _this = this;
                this.sammy.get('#/summary', function () {
                    _this.selectMap('heatmap');
                });
                this.sammy.get('#/search', function () {
                    _this.selectMap('pointmap');
                });
                this.sammy.get('#/results', function () {
                    _this.selectMap('resultstable');
                });
                this.sammy.run('#/summary');
            };
            FacultyAndStaff.prototype.setupMaps = function () {
                var me = this;
                this.google = window["google"];
                this.google.maps.visualRefresh = true;
                this.pointmap = new this.google.maps.Map($('#pointmap')[0], {
                    width: 680,
                    height: 500,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: new google.maps.LatLng(0, 0),
                    zoom: 1,
                    draggable: true,
                    scrollwheel: false
                });
                var dataTable = new this.google.visualization.DataTable();
                var colNames = new Array();
                dataTable.addColumn('string', 'Country');
                dataTable.addColumn('number', 'Total Activities');
                if(this.summary != null) {
                    if(((this.summary).placeActivityCounts() != null) && ((this.summary).placeActivityCounts().length > 0)) {
                        var placeActivityCounts = (this.summary).placeActivityCounts;
                        for(var i = 0; i < placeActivityCounts().length; i += 1) {
                            var rowData = new Array();
                            rowData.push(placeActivityCounts()[i].officialName());
                            rowData.push(placeActivityCounts()[i].count());
                            dataTable.addRow(rowData);
                        }
                    }
                }
                this.heatmapActivityData = dataTable;
                dataTable = new this.google.visualization.DataTable();
                colNames = new Array();
                dataTable.addColumn('string', 'Location');
                dataTable.addColumn('number', 'Total People');
                if(this.summary != null) {
                    if(((this.summary).placePeopleCounts() != null) && ((this.summary).placePeopleCounts().length > 0)) {
                        var placePeopleCounts = (this.summary).placePeopleCounts;
                        for(var i = 0; i < placePeopleCounts().length; i += 1) {
                            var rowData = new Array();
                            rowData.push(placePeopleCounts()[i].officialName());
                            rowData.push(placePeopleCounts()[i].count());
                            dataTable.addRow(rowData);
                        }
                    }
                }
                this.heatmapPeopleData = dataTable;
                this.heatmapOptions = {
                    width: 680,
                    height: 500,
                    region: 'world',
                    backgroundColor: 'lightBlue',
                    keepAspectRatio: false,
                    colorAxis: {
                        colors: [
                            '#FFFFFF', 
                            'green'
                        ]
                    }
                };
                this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
                this.google.visualization.events.addListener(this.heatmap, 'select', function () {
                    me.heatmapSelectHandler();
                });
                this.barchartActivityOptions = {
                    title: 'Activities',
                    vAxis: {
                        title: 'Count'
                    },
                    chartArea: {
                        left: 80
                    },
                    legend: {
                        position: 'none'
                    },
                    series: {
                        0: {
                            type: 'bars'
                        },
                        1: {
                            type: 'line',
                            color: 'black',
                            lineWidth: 0,
                            pointSize: 0,
                            visibleInLegend: false
                        }
                    }
                };
                this.barchartPeopleOptions = {
                    title: 'People',
                    vAxis: {
                        title: 'Count',
                        titleTextStyle: {
                            color: 'red'
                        }
                    }
                };
                this.barchart = new this.google.visualization.ColumnChart($('#facultystaff-summary-barchart')[0]);
            };
            FacultyAndStaff.prototype.getActivityDataTable = function (place) {
                var dt = new this.google.visualization.DataTable();
                dt.addColumn('string', 'Activity');
                dt.addColumn('number', 'Count');
                dt.addColumn({
                    type: 'number',
                    role: 'annotation'
                });
                if(place == null) {
                    for(var i = 0; i < (this.summary).worldActivityCounts().length; i += 1) {
                        var activityType = (this.summary).worldActivityCounts()[i].type();
                        var count = (this.summary).worldActivityCounts()[i].count();
                        dt.addRow([
                            activityType, 
                            count, 
                            count
                        ]);
                    }
                } else {
                    var i = 0;
                    while((i < (this.summary).placeActivityCounts().length) && ((this.summary).placeActivityCounts()[i].officialName !== place)) {
                        i += 1;
                    }
                    if(i < (this.summary).placeActivityCounts().length) {
                        var placeActivityCounts = (this.summary).placeActivityCounts()[i];
                        for(var j = 0; j < placeActivityCounts.typeCounts().length; j += 1) {
                            var activityType = placeActivityCounts.typeCounts[j].type();
                            var count = placeActivityCounts.typeCounts[j].count();
                            dt.addRow([
                                activityType, 
                                count, 
                                count
                            ]);
                        }
                    }
                }
                var view = new this.google.visualization.DataView(dt);
                view.setColumns([
                    0, 
                    1, 
                    1, 
                    2
                ]);
                return view;
            };
            FacultyAndStaff.prototype.getPeopleDataTable = function (place) {
                var dt = new this.google.visualization.DataTable();
                dt.addColumn('string', 'People');
                dt.addColumn('number', 'Count');
                dt.addColumn({
                    type: 'string',
                    role: 'annotation'
                });
                if(place == null) {
                    for(var i = 0; i < (this.summary).worldPeopleCounts().length; i += 1) {
                        var activityType = (this.summary).worldPeopleCounts()[i].type();
                        var count = (this.summary).worldPeopleCounts()[i].count();
                        dt.addRow([
                            activityType, 
                            count, 
                            String(count)
                        ]);
                    }
                } else {
                    var i = 0;
                    while((i < (this.summary).placePeopleCounts().length) && ((this.summary).placePeopleCounts()[i].officialName !== place)) {
                        i += 1;
                    }
                    if(i < (this.summary).placePeopleCounts().length) {
                        var placePeopleCounts = (this.summary).placePeopleCounts()[i];
                        for(var j = 0; j < placePeopleCounts.typeCounts().length; j += 1) {
                            var activityType = placePeopleCounts.typeCounts[j].type();
                            var count = placePeopleCounts.typeCounts[j].count();
                            dt.addRow([
                                activityType, 
                                count, 
                                String(count)
                            ]);
                        }
                    }
                }
                return dt;
            };
            FacultyAndStaff.prototype.load = function () {
                var _this = this;
                var me = this;
                var deferred = $.Deferred();
                this.loadSpinner.start();
                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get()).done(function (data, textStatus, jqXHR) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var summaryPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.FacultyStaff.getSummary(),
                    success: function (data, textStatus, jqXhr) {
                        summaryPact.resolve(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        summaryPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(typesPact, summaryPact).done(function (types, summary) {
                    _this.activityTypes = ko.mapping.fromJS(types);
                    for(var i = 0; i < _this.activityTypes().length; i += 1) {
                        _this.activityTypes()[i].checked = ko.computed(_this.defHasActivityTypeCallback(i));
                    }
                    _this.summary = ko.mapping.fromJS(summary);
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
                $("#bib-faculty-staff-summary").removeClass("current");
                $("#bib-faculty-staff-search").removeClass("current");
                if(type === "heatmap") {
                    $('#heatmapText').css("font-weight", "bold");
                    this.isHeatmapVisible(true);
                    if(this.searchType() === 'activities') {
                        this.heatmap.draw(this.heatmapActivityData, this.heatmapOptions);
                        var dataTable = this.getActivityDataTable(this.selectedPlace());
                        this.barchart.draw(dataTable, this.barchartActivityOptions);
                    } else {
                        this.heatmap.draw(this.heatmapPeopleData, this.heatmapOptions);
                        var dataTable = this.getPeopleDataTable(this.selectedPlace());
                        this.barchart.draw(dataTable, this.barchartPeopleOptions);
                    }
                    $("#bib-faculty-staff-summary").addClass("current");
                } else if(type === "pointmap") {
                    $('#pointmapText').css("font-weight", "bold");
                    this.isPointmapVisible(true);
                    $('#pointmap').css("display", "inline-block");
                    this.google.maps.event.trigger(this.pointmap, "resize");
                    $("#bib-faculty-staff-search").addClass("current");
                } else if(type === "resultstable") {
                    $('#resultstableText').css("font-weight", "bold");
                    this.isTableVisible(true);
                }
            };
            FacultyAndStaff.prototype.selectSearchType = function (type) {
                if(type === 'activities') {
                    this.setActivitiesSearch();
                } else {
                    this.setPeopleSearch();
                }
                if(this.heatmap != null) {
                    this.selectMap("heatmap");
                }
            };
            FacultyAndStaff.prototype.setActivitiesSearch = function () {
                $('#activitiesButton').css("font-weight", "bold");
                $('#peopleButton').css("font-weight", "normal");
                this.searchType('activities');
            };
            FacultyAndStaff.prototype.setPeopleSearch = function () {
                $('#activitiesButton').css("font-weight", "normal");
                $('#peopleButton').css("font-weight", "bold");
                this.searchType('people');
            };
            FacultyAndStaff.prototype.addActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if(existingIndex == -1) {
                    var newActivityType = ko.mapping.fromJS({
                        id: 0,
                        typeId: activityTypeId,
                        version: ""
                    });
                    this.selectedActivityIds.push(newActivityType);
                }
            };
            FacultyAndStaff.prototype.removeActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if(existingIndex != -1) {
                    var activityType = this.selectedActivityIds()[existingIndex];
                    this.selectedActivityIds.remove(activityType);
                }
            };
            FacultyAndStaff.prototype.getTypeName = function (id) {
                var name = "";
                var index = this.getActivityTypeIndexById(id);
                if(index != -1) {
                    name = this.activityTypes[index].type;
                }
                return name;
            };
            FacultyAndStaff.prototype.getActivityTypeIndexById = function (activityTypeId) {
                var index = -1;
                if((this.selectedActivityIds != null) && (this.selectedActivityIds().length > 0)) {
                    var i = 0;
                    while((i < this.selectedActivityIds().length) && (activityTypeId != this.selectedActivityIds()[i].typeId())) {
                        i += 1;
                    }
                    if(i < this.selectedActivityIds().length) {
                        index = i;
                    }
                }
                return index;
            };
            FacultyAndStaff.prototype.hasActivityType = function (activityTypeId) {
                return this.getActivityTypeIndexById(activityTypeId) != -1;
            };
            FacultyAndStaff.prototype.defHasActivityTypeCallback = function (activityTypeIndex) {
                var _this = this;
                var def = {
                    read: function () {
                        return _this.hasActivityType(_this.activityTypes()[activityTypeIndex].id());
                    },
                    write: function (checked) {
                        if(checked) {
                            _this.addActivityType(_this.activityTypes()[activityTypeIndex].id());
                        } else {
                            _this.removeActivityType(_this.activityTypes()[activityTypeIndex].id());
                        }
                    },
                    owner: this
                };
                return def;
            };
            FacultyAndStaff.prototype.heatmapSelectHandler = function () {
                var selection = this.heatmap.getSelection();
                if(this.searchType() === 'activities') {
                    var str = this.heatmapActivityData.getFormattedValue(selection[0].row, 0);
                } else {
                    var str = this.heatmapPeopleData.getFormattedValue(selection[0].row, 0);
                }
                this.selectedPlace(str);
            };
            FacultyAndStaff.prototype.globalViewClickHandler = function (item, event) {
                this.selectedPlace(null);
                this.selectMap('heatmap');
            };
            return FacultyAndStaff;
        })();
        Employees.FacultyAndStaff = FacultyAndStaff;        
    })(ViewModels.Employees || (ViewModels.Employees = {}));
    var Employees = ViewModels.Employees;
})(ViewModels || (ViewModels = {}));
