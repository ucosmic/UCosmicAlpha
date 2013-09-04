var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../activities/ServiceApiModel.d.ts" />
    (function (Employees) {
        var FacultyAndStaffSelect = (function () {
            function FacultyAndStaffSelect() {
                this.loadSpinner = new App.Spinner(new App.SpinnerOptions(200));
            }
            FacultyAndStaffSelect.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                this.loadSpinner.start();
                $.ajax({
                    type: "GET",
                    async: true,
                    dataType: 'json',
                    url: App.Routes.WebApi.Establishments.get(),
                    data: {
                        pageNumber: 1,
                        pageSize: App.Constants.int32Max,
                        typeEnglishNames: ['University', 'University System'],
                        orderBy: 'name-asc'
                    },
                    success: function (data, textStatus, jqXhr) {
                        _this.institutions = ko.mapping.fromJS(data);
                        deferred.resolve();
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        deferred.reject(errorThrown);
                    },
                    complete: function (jqXhr, textStatus) {
                        _this.loadSpinner.stop();
                    }
                });

                return deferred;
            };

            FacultyAndStaffSelect.prototype.selectInstitutionUrl = function (institutionId) {
                return App.Routes.Mvc.FacultyStaff.Institution.select(institutionId);
            };
            return FacultyAndStaffSelect;
        })();
        Employees.FacultyAndStaffSelect = FacultyAndStaffSelect;

        var FacultyAndStaff = (function () {
            function FacultyAndStaff(institutionInfo) {
                /* Initialization errors. */
                this.inititializationErrors = "";
                /* If you add or remove from this list, also look at _getHeatmapActivityDataTable()
                and _getHeatmapPeopleDataTable() to update the custom place tooltips text. */
                this.geochartCustomPlaces = [
                    {
                        name: 'Antarctica',
                        id: 'antarctica',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Southern Ocean',
                        id: 'southernOcean',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Indian Ocean',
                        id: 'indianOcean',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Pacific Ocean',
                        id: 'pacificOcean',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Atlantic Ocean',
                        id: 'atlanticOcean',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Gulf of Mexico',
                        id: 'gulfOfMexico',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Caribbean',
                        id: 'caribbean',
                        activityCount: 0,
                        peopleCount: 0
                    },
                    {
                        name: 'Arctic Ocean',
                        id: 'arcticOcean',
                        activityCount: 0,
                        peopleCount: 0
                    }
                ];
                this._initialize(institutionInfo);
            }
            FacultyAndStaff.prototype._initialize = function (institutionInfo) {
                this.sammy = Sammy();
                this.initialLocations = [];
                this.selectedLocationValues = [];
                this.fromDate = ko.observable();
                this.toDate = ko.observable();
                this.establishmentId = ko.observable(null);
                this.establishmentOfficialName = ko.observable(null);
                this.establishmentCountryOfficialName = ko.observable(null);
                this.institutionHasCampuses = ko.observable(false);
                this.institutionDropListData = [];
                this.activityTypes = ko.observableArray();
                this.selectedActivityIds = ko.observableArray();
                this.isHeatmapVisible = ko.observable(true);
                this.isPointmapVisible = ko.observable(false);
                this.isExpertVisible = ko.observable(false);
                this.isTableVisible = ko.observable(false);
                this.mapType = ko.observable('heatmap');
                this.searchType = ko.observable('activities');
                this.selectedPlace = ko.observable(null);
                this.isGlobalView = ko.observable(true);
                this.loadSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this.loadCountSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this.loadTrendSpinner = new App.Spinner(new App.SpinnerOptions(200));

                this.globalActivityCountData = null;
                this.placeActivityCountData = null;
                this.globalPeopleCountData = null;
                this.placePeopleCountData = null;
                this.globalActivityTrendData = null;
                this.placeActivityTrendData = null;
                this.globalPeopleTrendData = null;
                this.placePeopleTrendData = null;

                this.heatmapActivityDataTable = null;
                this.heatmapPeopleDataTable = null;

                this.totalCount = ko.observable(0);
                this.totalPlaceCount = ko.observable(0);

                this.degreeCount = ko.observable(0);

                this.selectSearchType('activities');

                if (institutionInfo != null) {
                    if (institutionInfo.InstitutionId != null) {
                        this.establishmentId(Number(institutionInfo.InstitutionId));

                        this.institutionDropListData.push({
                            "officialName": institutionInfo.InstitutionOfficialName,
                            "id": institutionInfo.InstitutionId
                        });
                    }

                    if (institutionInfo.ActivityTypes != null) {
                        for (var i = 0; i < institutionInfo.ActivityTypes.length; i += 1) {
                            this.activityTypes.push(ko.observable({
                                id: institutionInfo.ActivityTypes[i].Id,
                                type: institutionInfo.ActivityTypes[i].Name,
                                filter: ko.observable(true)
                            }));
                        }
                    }

                    if (institutionInfo.InstitutionHasCampuses != null) {
                        this.institutionHasCampuses(Boolean(institutionInfo.InstitutionHasCampuses));
                    }

                    if ((institutionInfo.InstitutionCampusIds != null) && (institutionInfo.InstitutionCampusIds.length > 0)) {
                        for (var i = 0; i < institutionInfo.InstitutionCampusIds.length; i += 1) {
                            this.institutionDropListData.push({
                                "officialName": institutionInfo.InstitutionCampusOfficialNames[i],
                                "id": institutionInfo.InstitutionCampusIds[i]
                            });
                        }
                    }
                }
            };

            FacultyAndStaff.prototype.setupWidgets = function (locationSelectorId, fromDatePickerId, toDatePickerId, establishmentDropListId, campusDropListId, collegeDropListId, departmentDropListId) {
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

                $("#" + fromDatePickerId).kendoDatePicker({
                    /* If user clicks date picker button, reset format */
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });

                $("#" + toDatePickerId).kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });

                this.establishmentDropListId = establishmentDropListId;

                //$("#" + establishmentDropListId).kendoAutoComplete({
                //    minLength: 3,
                //    filter: "contains",
                //    ignoreCase: true,
                //    placeholder: "[Enter Institution]",
                //    dataTextField: "officialName",
                //    dataSource: new kendo.data.DataSource({
                //        serverFiltering: true,
                //        transport: {
                //            read: (options: any): void => {
                //                $.ajax({
                //                    url: App.Routes.WebApi.Establishments.get(),
                //                    data: {
                //                        typeEnglishNames: ['University', 'University System']
                //                    },
                //                    success: (results: any): void => {
                //                        options.success(results.items);
                //                    }
                //                });
                //            }
                //        }
                //    }),
                //    change: (e: any): void => {
                //        this.checkInstitutionForNull();
                //    },
                //    select: (e: any): void => {
                //        var me = $("#" + establishmentDropListId).data("kendoAutoComplete");
                //        var dataItem = me.dataItem(e.item.index());
                //        this.establishmentOfficialName(dataItem.officialName);
                //        this.establishmentId(dataItem.id);
                //        if ((dataItem.countryName != null) && (dataItem.countryName.length > 0)) {
                //            this.establishmentCountryOfficialName(dataItem.countryName);
                //        }
                //        else {
                //            this.establishmentCountryOfficialName(null);
                //        }
                //    }
                //});
                $("#" + establishmentDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    dataSource: this.institutionDropListData,
                    change: function (e) {
                        var item = this.dataItem(e.sender.selectedIndex);
                        me.clearCachedData();
                        me.establishmentId(item.id);
                        me.establishmentOfficialName(item.officialName);
                        me.selectMap(me.mapType());
                    }
                });

                $("#" + departmentDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: { officialName: "ALL", id: 0 },
                    change: function (e) {
                        //var item = this.dataItem(e.sender.selectedIndex);
                    },
                    dataBound: function (e) {
                        if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if (item == null) {
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

                if (!this.institutionHasCampuses()) {
                    collegeDropListDataSource = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.Establishments.getChildren(this.establishmentId()),
                                data: { orderBy: ['rank-asc', 'name-asc'] }
                            }
                        }
                    });
                }

                $("#" + collegeDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: { officialName: "ALL", id: 0 },
                    dataSource: collegeDropListDataSource,
                    change: function (e) {
                        var selectedIndex = e.sender.selectedIndex;
                        if (selectedIndex != -1) {
                            var item = this.dataItem(selectedIndex);
                            if ((item != null) && (item.id != 0)) {
                                var dataSource = new kendo.data.DataSource({
                                    transport: {
                                        read: {
                                            url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                            data: { orderBy: ['rank-asc', 'name-asc'] }
                                        }
                                    }
                                });

                                $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(dataSource);
                            }
                        }
                    },
                    dataBound: function (e) {
                        if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if ((item != null) && (item.id != 0)) {
                                var collegeId = item.id;
                                if (collegeId != null) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(collegeId),
                                                data: { orderBy: ['rank-asc', 'name-asc'] }
                                            }
                                        }
                                    });

                                    $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        }
                    }
                });

                if (this.institutionHasCampuses()) {
                    $("#" + campusDropListId).kendoDropDownList({
                        dataTextField: "officialName",
                        dataValueField: "id",
                        optionLabel: { officialName: "ALL", id: 0 },
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.Establishments.getChildren(this.establishmentId()),
                                    data: { orderBy: ['rank-asc', 'name-asc'] }
                                }
                            }
                        }),
                        change: function (e) {
                            var selectedIndex = e.sender.selectedIndex;
                            if ((selectedIndex != null) && (selectedIndex != -1)) {
                                var item = this.dataItem(selectedIndex);
                                if ((item != null) && (item.id != 0)) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                                data: { orderBy: ['rank-asc', 'name-asc'] }
                                            }
                                        }
                                    });

                                    $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        },
                        dataBound: function (e) {
                            if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                                var item = this.dataItem(this.selectedIndex);
                                if ((item != null) && (item.id != 0)) {
                                    var campusId = item.id;
                                    if (campusId != null) {
                                        var dataSource = new kendo.data.DataSource({
                                            transport: {
                                                read: {
                                                    url: App.Routes.WebApi.Establishments.getChildren(campusId),
                                                    data: { orderBy: ['rank-asc', 'name-asc'] }
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
                //var activities = new Array();
                //for (var i = 0; i < this.activityTypes().length; i += 1) {
                //    activities.push({ type: this.activityTypes()[i].type(), selected: false });
                //}
                //$("#heatmapActivityDropList").kendoDropDownList({
                //    dataTextField: "type",
                //    dataValueField: "selected",
                //    dataSource: activities
                //});
            };

            FacultyAndStaff.prototype.setupValidation = function () {
                //ko.validation.rules['atLeast'] = {
                //    validator: (val: any, otherVal: any): boolean => {
                //        return val.length >= otherVal;
                //    },
                //    message: 'At least {0} must be selected.'
                //};
                //ko.validation.registerExtenders();
                //this.locations.extend({ atLeast: 1 });
                //this.institutions.extend({ required: true, maxLength: 200 });
                //this.from.extend({ required: true });
                //ko.validation.group(this);
            };

            FacultyAndStaff.prototype.setupSubscriptions = function () {
                var _this = this;
                //this.from.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.to.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.institutions.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.position.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                this.selectedPlace.subscribe(function (newValue) {
                    _this.selectMap('heatmap');
                });
            };

            FacultyAndStaff.prototype.setupRouting = function () {
                var _this = this;
                this.sammy.get('#/summary', function () {
                    _this.selectMap('heatmap');
                });
                this.sammy.get('#/search', function () {
                    _this.selectMap('pointmap');
                });
                this.sammy.get('#/expert', function () {
                    _this.selectMap('expert');
                });
                this.sammy.get('#/results', function () {
                    _this.selectMap('resultstable');
                });

                this.sammy.run('#/summary');
            };

            FacultyAndStaff.prototype.setupMaps = function () {
                var me = this;

                /* ----- Setup Pointmap ----- */
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

                this.heatmapOptions = {
                    //is3D: true,
                    width: 680,
                    height: 500,
                    //magnifyingGlass: { enable: true, zoomFactor: 7.5 },
                    region: 'world',
                    //backgroundColor: 'lightBlue',
                    keepAspectRatio: false,
                    colorAxis: { colors: ['#FFFFFF', 'green'] },
                    backgroundColor: { fill: 'transparent' },
                    datalessRegionColor: 'FFFFFF'
                };

                this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
                this.google.visualization.events.addListener(this.heatmap, 'select', function () {
                    me.heatmapSelectHandler();
                });

                if (this.activityTypes() != null) {
                    this.barchartActivityOptions = {
                        //title: 'Global Activities',
                        //titlePosition: 'out',
                        //titleTextStyle: {
                        //    color: 'black',
                        //    fontSize: 14,
                        //    bold: true
                        //},
                        hAxis: {
                            textPosition: 'none'
                        },
                        vAxis: {
                            textPosition: 'none'
                        },
                        chartArea: {
                            top: 8,
                            left: 10,
                            width: '100%',
                            height: '75%'
                        },
                        legend: { position: 'none' },
                        isStacked: true,
                        series: [
                            {
                                type: 'bars',
                                color: 'green'
                            },
                            {
                                type: 'line',
                                color: 'black',
                                lineWidth: 0,
                                pointSize: 0,
                                visibleInLegend: false
                            }
                        ]
                    };
                }

                this.barchartPeopleOptions = {
                    //title: 'Global People',
                    //titlePosition: 'out',
                    //titleTextStyle: {
                    //    color: 'black',
                    //    fontSize: 14,
                    //    bold: true
                    //},
                    hAxis: {
                        textPosition: 'none'
                    },
                    vAxis: {
                        textPosition: 'none'
                    },
                    chartArea: {
                        top: 8,
                        left: 10,
                        width: '100%',
                        height: '75%'
                    },
                    legend: { position: 'none' },
                    isStacked: true,
                    series: [
                        {
                            type: 'bars',
                            color: 'green'
                        },
                        {
                            type: 'line',
                            color: 'black',
                            lineWidth: 0,
                            pointSize: 0,
                            visibleInLegend: false
                        }
                    ]
                };

                this.barchart = new this.google.visualization.ColumnChart($('#facultystaff-summary-barchart')[0]);

                /* ----- Setup LineChart ----- */
                this.linechartActivityOptions = {
                    chartArea: {
                        top: 8,
                        left: 40,
                        width: '85%',
                        height: '60%'
                    },
                    //title: 'Global Activity Trend',
                    //titlePosition: 'out',
                    //titleTextStyle: {
                    //    color: 'black',
                    //    fontSize: 14,
                    //    bold: true
                    //},
                    colors: ['green'],
                    legend: { position: 'none' }
                };

                this.linechartPeopleOptions = {
                    chartArea: {
                        top: 8,
                        left: 40,
                        width: '85%',
                        height: '60%'
                    },
                    //title: 'Global People Trend',
                    //titlePosition: 'out',
                    //titleTextStyle: {
                    //    color: 'black',
                    //    fontSize: 14,
                    //    bold: true
                    //},
                    colors: ['green'],
                    legend: { position: 'none' }
                };

                this.linechart = new this.google.visualization.LineChart($('#facultystaff-summary-linechart')[0]);
            };

            FacultyAndStaff.prototype.getHeatmapActivityDataTable = function () {
                var _this = this;
                var deferred = $.Deferred();

                if (this.globalActivityCountData == null) {
                    this.loadSpinner.start();
                    this.getActivityDataTable(null).done(function () {
                        deferred.resolve(_this._getHeatmapActivityDataTable());
                        _this.loadSpinner.stop();
                    });
                } else {
                    deferred.resolve(this._getHeatmapActivityDataTable());
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getHeatmapActivityDataTable = function () {
                if (this.heatmapActivityDataTable == null) {
                    var dataTable = new this.google.visualization.DataTable();

                    var colNames = new Array();
                    dataTable.addColumn('string', 'Country');
                    dataTable.addColumn('number', 'Total Activities');

                    var placeCounts = (this.globalActivityCountData).placeCounts;
                    if ((placeCounts != null) && (placeCounts.length > 0)) {
                        for (var i = 0; i < this.geochartCustomPlaces.length; i += 1) {
                            this.geochartCustomPlaces[i].activityCount = 0;
                        }

                        for (var i = 0; i < placeCounts.length; i += 1) {
                            var rowData = new Array();
                            rowData.push(placeCounts[i].officialName);
                            rowData.push(placeCounts[i].count);
                            dataTable.addRow(rowData);

                            var officialName = placeCounts[i].officialName;
                            var count = placeCounts[i].count;
                            var j = -1;

                            if ((officialName === "North Atlantic Ocean") || (officialName === "South Atlantic Ocean")) {
                                j = this.getCustomPlaceIndexByName("Atlantic Ocean");
                            } else if ((officialName === "North Pacific Ocean") || (officialName === "Pacific Ocean") || (officialName === "South Pacific Ocean")) {
                                j = this.getCustomPlaceIndexByName("Pacific Ocean");
                            } else if (officialName === "Arctic Ocean") {
                                j = this.getCustomPlaceIndexByName("Arctic Ocean");
                            } else if (officialName === "Gulf of Mexico") {
                                j = this.getCustomPlaceIndexByName("Gulf of Mexico");
                            } else if (officialName === "Caribbean Ocean") {
                                j = this.getCustomPlaceIndexByName("Caribbean");
                            } else if (officialName === "Indian Ocean") {
                                j = this.getCustomPlaceIndexByName("Indian Ocean");
                            } else if (officialName === "Southern Ocean") {
                                j = this.getCustomPlaceIndexByName("Southern Ocean");
                            } else if (officialName === "Antarctica") {
                                j = this.getCustomPlaceIndexByName("Antarctica");
                            }

                            if (j >= 0) {
                                this.geochartCustomPlaces[j].activityCount += count;
                            }
                        }
                    }

                    this.heatmapActivityDataTable = dataTable;
                }

                return this.heatmapActivityDataTable;
            };

            FacultyAndStaff.prototype.getHeatmapPeopleDataTable = function () {
                var _this = this;
                var deferred = $.Deferred();

                if (this.globalPeopleCountData == null) {
                    this.loadSpinner.start();
                    this.getPeopleDataTable(null).done(function () {
                        deferred.resolve(_this._getHeatmapPeopleDataTable());
                        _this.loadSpinner.stop();
                    });
                } else {
                    deferred.resolve(this._getHeatmapPeopleDataTable());
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getHeatmapPeopleDataTable = function () {
                if (this.heatmapPeopleDataTable == null) {
                    var dataTable = new this.google.visualization.DataTable();

                    var colNames = new Array();
                    dataTable.addColumn('string', 'Country');
                    dataTable.addColumn('number', 'Total People');

                    var placeCounts = (this.globalPeopleCountData).placeCounts;
                    if ((placeCounts != null) && (placeCounts.length > 0)) {
                        for (var i = 0; i < this.geochartCustomPlaces.length; i += 1) {
                            this.geochartCustomPlaces[i].peopleCount = 0;
                        }

                        for (var i = 0; i < placeCounts.length; i += 1) {
                            var rowData = new Array();
                            rowData.push(placeCounts[i].officialName);
                            rowData.push(placeCounts[i].count);
                            dataTable.addRow(rowData);

                            var officialName = placeCounts[i].officialName;
                            var count = placeCounts[i].count;
                            var j = -1;

                            if ((officialName === "North Atlantic Ocean") || (officialName === "South Atlantic Ocean")) {
                                j = this.getCustomPlaceIndexByName("Atlantic Ocean");
                            } else if ((officialName === "North Pacific Ocean") || (officialName === "Pacific Ocean") || (officialName === "South Pacific Ocean")) {
                                j = this.getCustomPlaceIndexByName("Pacific Ocean");
                            } else if (officialName === "Arctic Ocean") {
                                j = this.getCustomPlaceIndexByName("Arctic Ocean");
                            } else if (officialName === "Gulf of Mexico") {
                                j = this.getCustomPlaceIndexByName("Gulf of Mexico");
                            } else if (officialName === "Caribbean Ocean") {
                                j = this.getCustomPlaceIndexByName("Caribbean");
                            } else if (officialName === "Indian Ocean") {
                                j = this.getCustomPlaceIndexByName("Indian Ocean");
                            } else if (officialName === "Southern Ocean") {
                                j = this.getCustomPlaceIndexByName("Southern Ocean");
                            } else if (officialName === "Antarctica") {
                                j = this.getCustomPlaceIndexByName("Antarctica");
                            }

                            if (j >= 0) {
                                this.geochartCustomPlaces[j].peopleCount += count;
                            }
                        }
                    }

                    this.heatmapPeopleDataTable = dataTable;
                }

                return this.heatmapPeopleDataTable;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getActivityDataTable = function (placeOfficialName) {
                var _this = this;
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    if (this.globalActivityCountData == null) {
                        this.loadCountSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalActivityCountData = data;
                                deferred.resolve(_this._getActivityDataTable(null));
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                _this.loadCountSpinner.stop();
                            }
                        });
                    } else {
                        deferred.resolve(this._getActivityDataTable(null));
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if ((this.placeActivityCountData == null) || ((this.placeActivityCountData).placeId != placeId)) {
                            this.loadCountSpinner.start();
                            $.ajax({
                                type: "GET",
                                async: true,
                                data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placeActivityCountData = data;
                                    deferred.resolve(_this._getActivityDataTable(placeOfficialName));
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    deferred.reject(errorThrown);
                                },
                                complete: function (jqXhr, textStatus) {
                                    _this.loadCountSpinner.stop();
                                }
                            });
                        } else {
                            deferred.resolve(this._getActivityDataTable(placeOfficialName));
                        }
                    } else {
                        deferred.reject("Unknown PlaceId");
                    }
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getActivityDataTable = function (placeOfficialName) {
                var view = null;
                var dt = null;

                if (placeOfficialName == null) {
                    dt = new this.google.visualization.DataTable();

                    dt.addColumn('string', 'Activity');
                    dt.addColumn('number', 'Count');
                    dt.addColumn({ type: 'number', role: 'annotation' });

                    for (var i = 0; i < (this.globalActivityCountData).typeCounts.length; i += 1) {
                        var activityType = (this.globalActivityCountData).typeCounts[i].type;
                        var count = (this.globalActivityCountData).typeCounts[i].count;
                        dt.addRow([activityType, count, count]);
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        dt = new this.google.visualization.DataTable();

                        dt.addColumn('string', 'Activity');
                        dt.addColumn('number', 'Count');
                        dt.addColumn({ type: 'number', role: 'annotation' });

                        for (var i = 0; i < (this.placeActivityCountData).typeCounts.length; i += 1) {
                            var activityType = (this.placeActivityCountData).typeCounts[i].type;
                            var count = (this.placeActivityCountData).typeCounts[i].count;
                            dt.addRow([activityType, count, count]);
                        }
                    }
                }

                view = new this.google.visualization.DataView(dt);
                view.setColumns([0, 1, 1, 2]);

                return view;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getPeopleDataTable = function (placeOfficialName) {
                var _this = this;
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    if (this.globalPeopleCountData == null) {
                        this.loadCountSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalPeopleCountData = data;
                                deferred.resolve(_this._getPeopleDataTable(null));
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                _this.loadCountSpinner.stop();
                            }
                        });
                    } else {
                        deferred.resolve(this._getPeopleDataTable(null));
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if ((this.placePeopleCountData == null) || ((this.placePeopleCountData).placeId != placeId)) {
                            this.loadCountSpinner.start();
                            $.ajax({
                                type: "GET",
                                async: true,
                                data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placePeopleCountData = data;
                                    deferred.resolve(_this._getPeopleDataTable(placeOfficialName));
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    deferred.reject(errorThrown);
                                },
                                complete: function (jqXhr, textStatus) {
                                    _this.loadCountSpinner.stop();
                                }
                            });
                        } else {
                            deferred.resolve(this._getPeopleDataTable(placeOfficialName));
                        }
                    } else {
                        deferred.reject("Unknown placeId.");
                    }
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getPeopleDataTable = function (placeOfficialName) {
                var view = null;
                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Activity');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'number', role: 'annotation' });

                if (placeOfficialName == null) {
                    for (var i = 0; i < (this.globalPeopleCountData).typeCounts.length; i += 1) {
                        var activityType = (this.globalPeopleCountData).typeCounts[i].type;
                        var count = (this.globalPeopleCountData).typeCounts[i].count;
                        dt.addRow([activityType, count, count]);
                    }
                } else {
                    for (var i = 0; i < (this.placePeopleCountData).typeCounts.length; i += 1) {
                        var activityType = (this.placePeopleCountData).typeCounts[i].type;
                        var count = (this.placePeopleCountData).typeCounts[i].count;
                        dt.addRow([activityType, count, count]);
                    }
                }

                view = new this.google.visualization.DataView(dt);
                view.setColumns([0, 1, 1, 2]);

                return view;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getActivityTrendDataTable = function (placeOfficialName) {
                var _this = this;
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    if (this.globalActivityTrendData == null) {
                        this.loadTrendSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getActivityTrend(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalActivityTrendData = data;
                                deferred.resolve(_this._getActivityTrendDataTable(null));
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                _this.loadTrendSpinner.stop();
                            }
                        });
                    } else {
                        deferred.resolve(this._getActivityTrendDataTable(null));
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if ((this.placeActivityTrendData == null) || ((this.placeActivityTrendData).placeId != placeId)) {
                            this.loadTrendSpinner.start();
                            $.ajax({
                                type: "GET",
                                async: true,
                                data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getActivityTrend(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placeActivityTrendData = data;
                                    deferred.resolve(_this._getActivityTrendDataTable(placeOfficialName));
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    deferred.reject(errorThrown);
                                },
                                complete: function (jqXhr, textStatus) {
                                    _this.loadTrendSpinner.stop();
                                }
                            });
                        } else {
                            deferred.resolve(this._getActivityTrendDataTable(placeOfficialName));
                        }
                    } else {
                        deferred.reject();
                    }
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getActivityTrendDataTable = function (placeOfficialName) {
                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Year');
                dt.addColumn('number', 'Count');

                if (placeOfficialName == null) {
                    for (var i = 0; i < (this.globalActivityTrendData).trendCounts.length; i += 1) {
                        var year = (this.globalActivityTrendData).trendCounts[i].year.toString();
                        var count = (this.globalActivityTrendData).trendCounts[i].count;
                        dt.addRow([year, count]);
                    }
                } else {
                    for (var i = 0; i < (this.placeActivityTrendData).trendCounts.length; i += 1) {
                        var year = (this.placeActivityTrendData).trendCounts[i].year.toString();
                        var count = (this.placeActivityTrendData).trendCounts[i].count;
                        dt.addRow([year, count]);
                    }
                }

                return dt;
            };

            FacultyAndStaff.prototype.getPeopleTrendDataTable = function (placeOfficialName) {
                var _this = this;
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    if (this.globalPeopleTrendData == null) {
                        this.loadTrendSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getPeopleTrend(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalPeopleTrendData = data;
                                deferred.resolve(_this._getPeopleTrendDataTable(null));
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                _this.loadTrendSpinner.stop();
                            }
                        });
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if ((this.placePeopleTrendData == null) || ((this.placePeopleTrendData).placeId != placeId)) {
                            this.loadTrendSpinner.start();
                            $.ajax({
                                type: "GET",
                                async: true,
                                data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getPeopleTrend(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placePeopleTrendData = data;
                                    deferred.resolve(_this._getPeopleTrendDataTable(placeOfficialName));
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    deferred.reject(errorThrown);
                                },
                                complete: function (jqXhr, textStatus) {
                                    _this.loadTrendSpinner.stop();
                                }
                            });
                        }
                    } else {
                        deferred.reject("Unkown placeId");
                    }
                }

                return deferred;
            };

            FacultyAndStaff.prototype._getPeopleTrendDataTable = function (placeOfficialName) {
                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Year');
                dt.addColumn('number', 'Count');

                if (placeOfficialName == null) {
                    for (var i = 0; i < (this.globalPeopleTrendData).trendCounts.length; i += 1) {
                        var year = (this.globalPeopleTrendData).trendCounts[i].year.toString();
                        var count = (this.globalPeopleTrendData).trendCounts[i].count;
                        dt.addRow([year, count]);
                    }
                } else {
                    for (var i = 0; i < (this.placePeopleTrendData).trendCounts.length; i += 1) {
                        var year = (this.placePeopleTrendData).trendCounts[i].year.toString();
                        var count = (this.placePeopleTrendData).trendCounts[i].count;
                        dt.addRow([year, count]);
                    }
                }

                return dt;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getDegreeCount = function (placeOfficialName) {
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getDegreeCount(),
                        success: function (data, textStatus, jqXhr) {
                            deferred.resolve(data.count);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            deferred.reject(errorThrown);
                        },
                        complete: function (jqXhr, textStatus) {
                            //this.loadSpinner.stop();
                        }
                    });
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        // this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getDegreeCount(),
                            success: function (data, textStatus, jqXhr) {
                                deferred.resolve(data.count);
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                //this.loadSpinner.stop();
                            }
                        });
                    } else {
                        deferred.reject("Unknown PlaceId");
                    }
                }

                return deferred;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getDegreePeopleCount = function (placeOfficialName) {
                var deferred = $.Deferred();

                if (placeOfficialName == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getDegreePeopleCount(),
                        success: function (data, textStatus, jqXhr) {
                            deferred.resolve(data.count);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            deferred.reject(errorThrown);
                        },
                        complete: function (jqXhr, textStatus) {
                            //this.loadSpinner.stop();
                        }
                    });
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        //this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getDegreePeopleCount(),
                            success: function (data, textStatus, jqXhr) {
                                deferred.resolve(data.count);
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                deferred.reject(errorThrown);
                            },
                            complete: function (jqXhr, textStatus) {
                                //this.loadSpinner.stop();
                            }
                        });
                    } else {
                        deferred.reject("Unknown PlaceId");
                    }
                }

                return deferred;
            };

            FacultyAndStaff.prototype.makeActivityTooltip = function (name, count) {
                return "<b>" + name + "</b><br/>Total Activities: " + count.toString();
            };

            FacultyAndStaff.prototype.makePeopleTooltip = function (name, count) {
                return "<b>" + name + "</b><br/>Total People: " + count.toString();
            };

            FacultyAndStaff.prototype.updateCustomGeochartPlaceTooltips = function (selector) {
                var id = "";
                var name = "";
                var count = 0;

                for (var i = 0; i < this.geochartCustomPlaces.length; i += 1) {
                    if (selector === 'activities') {
                        id = this.geochartCustomPlaces[i].id;
                        name = this.geochartCustomPlaces[i].name;
                        count = this.geochartCustomPlaces[i].activityCount;
                        $("#" + id).tooltip({
                            //position: {
                            //    my: "bottom+10 right+10"
                            //},
                            track: true,
                            tooltipClass: "geochartTooltip",
                            items: "#" + id,
                            content: this.makeActivityTooltip(name, count)
                        });
                    } else {
                        id = this.geochartCustomPlaces[i].id;
                        name = this.geochartCustomPlaces[i].name;
                        count = this.geochartCustomPlaces[i].activityCount;
                        $("#" + id).tooltip({
                            //position: {
                            //    my: "bottom+10 right+10"
                            //},
                            track: true,
                            tooltipClass: "geochartTooltip",
                            items: "#" + id,
                            content: this.makePeopleTooltip(name, count)
                        });
                    }
                }
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

                var placesPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    data: { isCountry: true },
                    dataType: 'json',
                    url: App.Routes.WebApi.Places.get(),
                    success: function (data, textStatus, jqXhr) {
                        placesPact.resolve(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        placesPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });

                var watersPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    data: { isWater: true },
                    dataType: 'json',
                    url: App.Routes.WebApi.Places.get(),
                    success: function (data, textStatus, jqXhr) {
                        watersPact.resolve(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        watersPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });

                // only process after all requests have been resolved
                $.when(typesPact, placesPact, watersPact).done(function (types, places, waters) {
                    _this.activityTypes = ko.mapping.fromJS(types);

                    for (var i = 0; i < _this.activityTypes().length; i += 1) {
                        _this.activityTypes()[i].checked = ko.computed(_this.defHasActivityTypeCallback(i));
                    }

                    //ko.mapping.fromJS(data, {}, this);
                    ///* Initialize the list of selected locations with current locations in values. */
                    //for (var i = 0; i < this.locations().length; i += 1) {
                    //    this.initialLocations.push({
                    //        officialName: this.locations()[i].placeOfficialName(),
                    //        id: this.locations()[i].placeId()
                    //    });
                    //    this.selectedLocationValues.push(this.locations()[i].placeId());
                    //}
                    _this.places = places.concat(waters);

                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                }).always(function () {
                    _this.loadSpinner.stop();
                });

                return deferred;
            };

            FacultyAndStaff.prototype.checkInstitutionForNull = function () {
                var me = $("#" + this.establishmentDropListId).data("kendoAutoComplete");
                var value = (me.value() != null) ? me.value().toString() : null;
                if (value != null) {
                    value = $.trim(value);
                }
                if ((value == null) || (value.length == 0)) {
                    me.value(null);
                    this.establishmentOfficialName(null);
                    this.establishmentId(null);
                }
            };

            FacultyAndStaff.prototype.updateLocations = function (items) {
                if (this.locations != null) {
                    this.locations.removeAll();
                    for (var i = 0; i < items.length; i += 1) {
                        var location = ko.mapping.fromJS({ id: 0, placeId: items[i].id, version: "" });
                        this.locations.push(location);
                    }
                }
            };

            // --------------------------------------------------------------------------------
            /*
            *
            */
            // --------------------------------------------------------------------------------
            FacultyAndStaff.prototype.selectMap = function (type) {
                var _this = this;
                this.mapType(type);

                $('#heatmapText').css("font-weight", "normal");
                this.isHeatmapVisible(false);

                $('#pointmapText').css("font-weight", "normal");
                this.isPointmapVisible(false);

                $('#expertText').css("font-weight", "normal");
                this.isExpertVisible(false);

                $('#resultstableText').css("font-weight", "normal");
                this.isTableVisible(false);

                $("#bib-faculty-staff-summary").removeClass("current");
                $("#bib-faculty-staff-search").removeClass("current");
                $("#bib-faculty-staff-expert").removeClass("current");

                if (type === "heatmap") {
                    $('#heatmapText').css("font-weight", "bold");

                    this.isHeatmapVisible(true);

                    if (this.searchType() === 'activities') {
                        this.getActivityDataTable(this.selectedPlace()).done(function (dataTable) {
                            _this.barchart.draw(dataTable, _this.barchartActivityOptions);
                            if (_this.selectedPlace() != null) {
                                _this.totalCount(_this.placeActivityCountData.count);
                                _this.totalPlaceCount(_this.placeActivityCountData.countOfPlaces);
                            }

                            _this.getHeatmapActivityDataTable().done(function (dataTable) {
                                _this.heatmap.draw(dataTable, _this.heatmapOptions);
                                if (_this.selectedPlace() == null) {
                                    _this.totalCount(_this.globalActivityCountData.count);
                                    _this.totalPlaceCount(_this.globalActivityCountData.countOfPlaces);
                                }
                                _this.updateCustomGeochartPlaceTooltips(_this.searchType());
                            });
                        });

                        this.getActivityTrendDataTable(this.selectedPlace()).done(function (dataTable) {
                            _this.linechart.draw(dataTable, _this.linechartActivityOptions);
                        });

                        this.getDegreeCount(this.selectedPlace()).done(function (count) {
                            _this.degreeCount(count);
                        });
                    } else {
                        this.getPeopleDataTable(this.selectedPlace()).done(function (dataTable) {
                            _this.barchart.draw(dataTable, _this.barchartPeopleOptions);
                            if (_this.selectedPlace() != null) {
                                _this.totalCount(_this.placePeopleCountData.count);
                                _this.totalPlaceCount(_this.placePeopleCountData.countOfPlaces);
                            }

                            _this.getHeatmapPeopleDataTable().done(function (dataTable) {
                                _this.heatmap.draw(dataTable, _this.heatmapOptions);
                                if (_this.selectedPlace() == null) {
                                    _this.totalCount(_this.globalPeopleCountData.count);
                                    _this.totalPlaceCount(_this.globalPeopleCountData.countOfPlaces);
                                }
                                _this.updateCustomGeochartPlaceTooltips(_this.searchType());
                            });
                        });

                        this.getPeopleTrendDataTable(this.selectedPlace()).done(function (dataTable) {
                            _this.linechart.draw(dataTable, _this.linechartPeopleOptions);
                        });

                        this.getDegreePeopleCount(this.selectedPlace()).done(function (count) {
                            _this.degreeCount(count);
                        });
                    }

                    $("#bib-faculty-staff-summary").addClass("current");
                } else if (type === "pointmap") {
                    $('#pointmapText').css("font-weight", "bold");
                    this.isPointmapVisible(true);
                    $('#pointmap').css("display", "inline-block");

                    //fspointmap.draw(fspointmapData, fspointmapOptions)
                    this.google.maps.event.trigger(this.pointmap, "resize");
                    $("#bib-faculty-staff-search").addClass("current");
                } else if (type === "expert") {
                    $('#expertText').css("font-weight", "bold");
                    this.isExpertVisible(true);
                    $('#expert').css("display", "inline-block");
                    $("#bib-faculty-staff-expert").addClass("current");
                } else if (type === "resultstable") {
                    $('#resultstableText').css("font-weight", "bold");
                    this.isTableVisible(true);
                }
            };

            FacultyAndStaff.prototype.selectSearchType = function (type) {
                if (type === 'activities') {
                    this.setActivitiesSearch();
                } else {
                    this.setPeopleSearch();
                }

                if (this.heatmap != null) {
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
                if (existingIndex == -1) {
                    var newActivityType = ko.mapping.fromJS({ id: 0, typeId: activityTypeId, version: "" });
                    this.selectedActivityIds.push(newActivityType);
                }
            };

            FacultyAndStaff.prototype.removeActivityType = function (activityTypeId) {
                var existingIndex = this.getActivityTypeIndexById(activityTypeId);
                if (existingIndex != -1) {
                    var activityType = this.selectedActivityIds()[existingIndex];
                    this.selectedActivityIds.remove(activityType);
                }
            };

            FacultyAndStaff.prototype.getTypeName = function (id) {
                var name = "";
                var index = this.getActivityTypeIndexById(id);
                if (index != -1) {
                    name = this.activityTypes[index].type;
                }
                return name;
            };

            FacultyAndStaff.prototype.getActivityTypeIndexById = function (activityTypeId) {
                var index = -1;

                if ((this.selectedActivityIds != null) && (this.selectedActivityIds().length > 0)) {
                    var i = 0;
                    while ((i < this.selectedActivityIds().length) && (activityTypeId != this.selectedActivityIds()[i].typeId())) {
                        i += 1;
                    }

                    if (i < this.selectedActivityIds().length) {
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
                        if (checked) {
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
                if ((selection != null) && (selection.length > 0)) {
                    var str = '';
                    if (this.searchType() === 'activities') {
                        str = this.heatmapActivityDataTable.getFormattedValue(selection[0].row, 0);
                    } else {
                        str = this.heatmapPeopleDataTable.getFormattedValue(selection[0].row, 0);
                    }
                    this.selectedPlace(str);
                }
            };

            FacultyAndStaff.prototype.expertClickHandler = function (item, event) {
                this.selectMap('expert');
            };

            FacultyAndStaff.prototype.globalViewClickHandler = function (item, event) {
                this.selectedPlace(null);
                this.selectMap('heatmap');
            };

            FacultyAndStaff.prototype.getPlaceId = function (officialName) {
                var i = 0;
                while ((i < this.places.length) && (officialName !== this.places[i].officialName)) {
                    i += 1;
                }
                return (i < this.places.length) ? this.places[i].id : null;
            };

            FacultyAndStaff.prototype.getCustomPlaceIndexByName = function (officialName) {
                var i = 0;
                while ((i < this.geochartCustomPlaces.length) && (officialName !== this.geochartCustomPlaces[i].name)) {
                    i += 1;
                }
                return (i < this.geochartCustomPlaces.length) ? i : -1;
            };

            FacultyAndStaff.prototype.clearCachedData = function () {
                this.globalActivityCountData = null;
                this.placeActivityCountData = null;
                this.globalPeopleCountData = null;
                this.placePeopleCountData = null;
                this.globalActivityTrendData = null;
                this.placeActivityTrendData = null;
                this.globalPeopleTrendData = null;
                this.placePeopleTrendData = null;
                this.heatmapActivityDataTable = null;
                this.heatmapPeopleDataTable = null;
            };

            FacultyAndStaff.prototype.customPlaceClick = function (event, item, officialName) {
                this.selectedPlace(officialName);
            };
            return FacultyAndStaff;
        })();
        Employees.FacultyAndStaff = FacultyAndStaff;
    })(ViewModels.Employees || (ViewModels.Employees = {}));
    var Employees = ViewModels.Employees;
})(ViewModels || (ViewModels = {}));
