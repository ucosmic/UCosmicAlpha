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
        var FacultyAndStaff = (function () {
            function FacultyAndStaff(institutionInfo) {
                /* Initialization errors. */
                this.inititializationErrors = "";
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
                this.activityTypes = ko.observableArray();
                this.selectedActivityIds = ko.observableArray();
                this.isHeatmapVisible = ko.observable(true);
                this.isPointmapVisible = ko.observable(false);
                this.isTableVisible = ko.observable(false);
                this.searchType = ko.observable('activities');
                this.selectedPlace = ko.observable(null);
                this.isGlobalView = ko.observable(true);
                this.loadSpinner = new App.Spinner(new App.SpinnerOptions(200));

                this.globalActivityCountData = null;
                this.placeActivityCountData = null;
                this.globalPeopleCountData = null;
                this.placePeopleCountData = null;
                this.globalActivityTrendData = null;
                this.placeActivityTrendData = null;
                this.globalPeopleTrendData = null;
                this.placePeopleTrendData = null;

                this.totalCount = ko.observable(0);
                this.totalPlaceCount = ko.observable(0);

                this.selectSearchType('activities');

                if (institutionInfo != null) {
                    if (institutionInfo.InstitutionId != null) {
                        this.establishmentId(Number(institutionInfo.InstitutionId));
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
                    //optionLabel: { officialName: "ALL", id: 0 },
                    dataSource: [
                        { officialName: "USF System", id: 0 },
                        { officialName: "USF Tampa", id: 0 },
                        { officialName: "USF St. Petersburg", id: 0 },
                        { officialName: "USF Sarasota-Manatee", id: 0 }
                    ],
                    change: function (e) {
                        //var item = this.dataItem[e.sender.selectedIndex];
                    }
                });

                $("#" + departmentDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: { officialName: "ALL", id: 0 },
                    change: function (e) {
                        //var item = this.dataItem[e.sender.selectedIndex];
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
                //this.from.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.to.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.institutions.subscribe((newValue: any): void => { this.dirtyFlag(true); });
                //this.position.subscribe((newValue: any): void => { this.dirtyFlag(true); });
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
                    backgroundColor: 'lightBlue',
                    keepAspectRatio: false,
                    colorAxis: { colors: ['#FFFFFF', 'green'] }
                };

                this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
                this.google.visualization.events.addListener(this.heatmap, 'select', function () {
                    me.heatmapSelectHandler();
                });

                if (this.activityTypes() != null) {
                    this.barchartActivityOptions = {
                        title: 'Activities',
                        hAxis: {
                            textPosition: 'none'
                        },
                        vAxis: {
                            textPosition: 'none'
                        },
                        chartArea: {
                            left: 10,
                            width: '100%',
                            height: '100'
                        },
                        legend: { position: 'none' },
                        isStacked: true,
                        series: [
                            {
                                type: 'bars'
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
                    //this.barchartActivityOptions.series = new Array();
                    //for (var i = 0; i < this.activityTypes().length; i += 1) {
                    //    this.barchartActivityOptions.series.push({
                    //        i: {
                    //            type: 'bars',
                    //            color: this.activityTypes()[i].cssColor()
                    //        }
                    //    });
                    //}
                    //i = this.activityTypes().length;
                    //this.barchartActivityOptions.series.push({
                    //    i: {
                    //        type: 'line',
                    //        color: 'black',
                    //        lineWidth: 0,
                    //        pointSize: 0,
                    //        visibleInLegend: false
                    //    }
                    //});
                }

                this.barchartPeopleOptions = {
                    title: 'People',
                    vAxis: { title: 'Count' },
                    //axisTitlesPosition: 'in',
                    chartArea: { left: 80 },
                    legend: { position: 'none' },
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

                this.barchart = new this.google.visualization.ColumnChart($('#facultystaff-summary-barchart')[0]);

                /* ----- Setup LineChart ----- */
                this.linechartActivityOptions = {
                    title: 'Activities',
                    hAxis: {
                        textPosition: 'none'
                    },
                    vAxis: {
                        textPosition: 'none'
                    },
                    legend: { position: 'none' }
                };

                this.linechartPeopleOptions = {
                    title: 'People',
                    hAxis: {
                        textPosition: 'none'
                    },
                    vAxis: {
                        textPosition: 'none'
                    },
                    legend: { position: 'none' }
                };

                this.linechart = new this.google.visualization.LineChart($('#facultystaff-summary-linechart')[0]);
            };

            FacultyAndStaff.prototype.getHeatmapActivityDataTable = function () {
                if (this.globalActivityCountData == null) {
                    this.getActivityDataTable(null);
                }

                var dataTable = new this.google.visualization.DataTable();

                var colNames = new Array();
                dataTable.addColumn('string', 'Country');
                dataTable.addColumn('number', 'Total Activities');

                var placeCounts = (this.globalActivityCountData).placeCounts;
                if ((placeCounts != null) && (placeCounts.length > 0)) {
                    for (var i = 0; i < placeCounts.length; i += 1) {
                        var rowData = new Array();
                        rowData.push(placeCounts[i].officialName);
                        rowData.push(placeCounts[i].count);
                        dataTable.addRow(rowData);
                    }
                }

                return dataTable;
            };

            FacultyAndStaff.prototype.getHeatmapPeopleDataTable = function () {
                if (this.globalPeopleCountData() == null) {
                    this.getPeopleDataTable(null);
                }

                var dataTable = new this.google.visualization.DataTable();

                var colNames = new Array();
                dataTable.addColumn('string', 'Country');
                dataTable.addColumn('number', 'Total Activities');

                var placeCounts = (this.globalPeopleCountData).placeCounts;
                if ((placeCounts != null) && (placeCounts.length > 0)) {
                    for (var i = 0; i < placeCounts.length; i += 1) {
                        var rowData = new Array();
                        rowData.push(placeCounts[i].officialName);
                        rowData.push(placeCounts[i].count);
                        dataTable.addRow(rowData);
                    }
                }

                return dataTable;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getActivityDataTable = function (placeOfficialName) {
                var _this = this;
                if (placeOfficialName == null) {
                    if (this.globalActivityCountData == null) {
                        $.ajax({
                            type: "GET",
                            async: false,
                            data: { 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalActivityCountData = data;
                                _this.totalCount(_this.globalActivityCountData.globalCount);
                                _this.totalPlaceCount(_this.globalActivityCountData.countOfPlaces);
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                alert('Error getting data ' + textStatus + ' | ' + errorThrown);
                            }
                        });
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if (this.placeActivityCountData == null) {
                            $.ajax({
                                type: "GET",
                                async: false,
                                data: { 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placeActivityCountData = data;
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    alert('Error getting data ' + textStatus + ' | ' + errorThrown);
                                }
                            });
                        }
                    }
                }

                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Activity');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'number', role: 'annotation' });

                if (placeOfficialName == null) {
                    for (var i = 0; i < (this.globalActivityCountData).globalTypeCounts.length; i += 1) {
                        var activityType = (this.globalActivityCountData).globalTypeCounts[i].type;
                        var count = (this.globalActivityCountData).globalTypeCounts[i].count;
                        dt.addRow([activityType, count, count]);
                    }
                } else {
                    var placeActivityCounts = (this.placeActivityCountData).placeActivityCounts[0];
                    for (var j = 0; j < placeActivityCounts.typeCounts.length; j += 1) {
                        var activityType = placeActivityCounts.typeCounts[j].type;
                        var count = placeActivityCounts.typeCounts[j].count;
                        dt.addRow([activityType, count, count]);
                    }
                }

                var view = new this.google.visualization.DataView(dt);
                view.setColumns([0, 1, 1, 2]);

                //if (this.activityTypes() == null) {
                //}
                return view;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getPeopleDataTable = function (placeOfficialName) {
                var _this = this;
                if (placeOfficialName == null) {
                    if (this.globalActivityCountData == null) {
                        $.ajax({
                            type: "GET",
                            async: false,
                            data: { 'placeId': null },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                            success: function (data, textStatus, jqXhr) {
                                _this.globalActivityCountData = data;
                            },
                            error: function (jqXhr, textStatus, errorThrown) {
                                alert('Error getting data ' + textStatus + ' | ' + errorThrown);
                            }
                        });
                    }
                } else {
                    var placeId = this.getPlaceId(placeOfficialName);
                    if (placeId != null) {
                        if (this.placeActivityCountData == null) {
                            $.ajax({
                                type: "GET",
                                async: false,
                                data: { 'placeId': placeId },
                                dataType: 'json',
                                url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                                success: function (data, textStatus, jqXhr) {
                                    _this.placeActivityCountData = data;
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    alert('Error getting data ' + textStatus + ' | ' + errorThrown);
                                }
                            });
                        }
                    }
                }

                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'People');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'string', role: 'annotation' });

                if (placeOfficialName == null) {
                    for (var i = 0; i < (this.globalPeopleCountData).typeCounts.length; i += 1) {
                        var activityType = (this.globalPeopleCountData).typeCounts[i].type;
                        var count = (this.globalPeopleCountData).typeCounts[i].count;
                        dt.addRow([activityType, count, String(count)]);
                    }
                } else {
                    var placePeopleCounts = (this.placePeopleCountData).placePeopleCounts[0];
                    for (var j = 0; j < placePeopleCounts.typeCounts.length; j += 1) {
                        var activityType = placePeopleCounts.typeCounts[j].type;
                        var count = placePeopleCounts.typeCounts[j].count;
                        dt.addRow([activityType, count, String(count)]);
                    }
                }

                return dt;
            };

            /*
            *
            */
            FacultyAndStaff.prototype.getActivityTrendDataTable = function (place) {
                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Year');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'number', role: 'annotation' });

                //if (place == null) { /* Add world counts */
                //    for (var i = 0; i < (<any>this.globalActivityTrendData).globalData().length; i += 1) {
                //        var activityType = (<any>this.globalActivityTrendData).globalData()[i].type();
                //        var count = (<any>this.globalActivityTrendData).globalData()[i].count();
                //        dt.addRow([activityType, count, count]);
                //    }
                //} else { /* Add place counts */
                //    var i = 0;
                //    while ((i < (<any>this.summary).placeTrendActivityCounts().length) &&
                //           ((<any>this.summary).placeTrendActivityCounts()[i].officialName !== place)) {
                //        i += 1;
                //    }
                //    if (i < (<any>this.summary).placeTrendActivityCounts().length) {
                //        var placeTrendActivityCounts = (<any>this.summary).placeTrendActivityCounts()[i];
                //        for (var j = 0; j < placeTrendActivityCounts.typeCounts().length; j += 1) {
                //            var activityType = placeTrendActivityCounts.typeCounts[j].type();
                //            var count = placeTrendActivityCounts.typeCounts[j].count();
                //            dt.addRow([activityType, count, count]);
                //        }
                //    }
                //}
                var view = new this.google.visualization.DataView(dt);
                view.setColumns([0, 1, 1, 2]);

                return view;
            };

            FacultyAndStaff.prototype.getPeopleTrendDataTable = function (place) {
                var dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Year');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'string', role: 'annotation' });

                //if (place == null) { /* Add world counts */
                //    for (var i = 0; i < (<any>this.summary).worldTrendPeopleCounts().length; i += 1) {
                //        var activityType = (<any>this.summary).worldTrendPeopleCounts()[i].type();
                //        var count = (<any>this.summary).worldTrendPeopleCounts()[i].count();
                //        dt.addRow([activityType, count, String(count)]);
                //    }
                //} else { /* Add place counts */
                //    var i = 0;
                //    while ((i < (<any>this.summary).placeTrendPeopleCounts().length) &&
                //           ((<any>this.summary).placeTrendPeopleCounts()[i].officialName !== place)) {
                //        i += 1;
                //    }
                //    if (i < (<any>this.summary).placeTrendPeopleCounts().length) {
                //        var placeTrendPeopleCounts = (<any>this.summary).placePeopleCounts()[i];
                //        for (var j = 0; j < placeTrendPeopleCounts.typeCounts().length; j += 1) {
                //            var activityType = placeTrendPeopleCounts.typeCounts[j].type();
                //            var count = placeTrendPeopleCounts.typeCounts[j].count();
                //            dt.addRow([activityType, count, String(count)]);
                //        }
                //    }
                //}
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

                // only process after all requests have been resolved
                $.when(typesPact, placesPact).done(function (types, places) {
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
                    _this.places = ko.mapping.fromJS(places);

                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
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

            FacultyAndStaff.prototype.selectMap = function (type) {
                //debugger;
                $('#heatmapText').css("font-weight", "normal");
                this.isHeatmapVisible(false);

                $('#pointmapText').css("font-weight", "normal");
                this.isPointmapVisible(false);

                $('#resultstableText').css("font-weight", "normal");
                this.isTableVisible(false);

                $("#bib-faculty-staff-summary").removeClass("current");
                $("#bib-faculty-staff-search").removeClass("current");

                if (type === "heatmap") {
                    $('#heatmapText').css("font-weight", "bold");

                    this.isHeatmapVisible(true);

                    var dataTable = null;

                    if (this.searchType() === 'activities') {
                        dataTable = this.getHeatmapActivityDataTable();
                        this.heatmap.draw(dataTable, this.heatmapOptions);

                        dataTable = this.getActivityDataTable(this.selectedPlace());
                        this.barchart.draw(dataTable, this.barchartActivityOptions);

                        dataTable = this.getActivityTrendDataTable(this.selectedPlace());
                        this.linechart.draw(dataTable, this.linechartActivityOptions);
                    } else {
                        dataTable = this.getHeatmapPeopleDataTable();
                        this.heatmap.draw(dataTable, this.heatmapOptions);

                        dataTable = this.getPeopleDataTable(this.selectedPlace());
                        this.barchart.draw(dataTable, this.barchartPeopleOptions);

                        dataTable = this.getPeopleTrendDataTable(this.selectedPlace());
                        this.linechart.draw(dataTable, this.linechartPeopleOptions);
                    }

                    $("#bib-faculty-staff-summary").addClass("current");
                } else if (type === "pointmap") {
                    $('#pointmapText').css("font-weight", "bold");
                    this.isPointmapVisible(true);
                    $('#pointmap').css("display", "inline-block");

                    //fspointmap.draw(fspointmapData, fspointmapOptions)
                    this.google.maps.event.trigger(this.pointmap, "resize");
                    $("#bib-faculty-staff-search").addClass("current");
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
                debugger;
                var selection = this.heatmap.getSelection();
                var str = '';
                if (this.searchType() === 'activities') {
                    //var str = this.heatmapActivityData.getFormattedValue(selection[0].row, 0);
                } else {
                    //var str = this.heatmapPeopleData.getFormattedValue(selection[0].row, 0);
                }
                this.selectedPlace(str);
            };

            FacultyAndStaff.prototype.globalViewClickHandler = function (item, event) {
                this.selectedPlace(null);
                this.selectMap('heatmap');
            };

            FacultyAndStaff.prototype.getPlaceId = function (officialName) {
                //debugger;
                var i = 0;
                while ((i < this.places.length) && (officialName !== this.places[i].officialName)) {
                    i += 1;
                }
                return (i < this.places.length) ? this.places[i].officialName : null;
            };
            return FacultyAndStaff;
        })();
        Employees.FacultyAndStaff = FacultyAndStaff;
    })(ViewModels.Employees || (ViewModels.Employees = {}));
    var Employees = ViewModels.Employees;
})(ViewModels || (ViewModels = {}));
