/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../activities/ServiceApiModel.d.ts" />

module ViewModels.Employees {

    // ================================================================================
    /* 
    */
    // ================================================================================
    export class FacultyAndStaff {

        google: any;
        sammy: Sammy.Application;

        /* Initialization errors. */
        inititializationErrors: string = "";

        /* True if any field changes. */
        ///dirtyFlag: KnockoutObservable<boolean> = ko.observable(false);

        searchType: KnockoutObservable<string>;
        selectedPlace: KnockoutObservable<string>;

        /* Element id of institution autocomplete */
        institutionSelectorId: string;
        institutionId: KnockoutObservable<any>;
        institutionOfficialName: KnockoutObservable<string>;
        institutionCountryOfficialName: KnockoutObservable<string>;

        institutionHasCampuses: KnockoutObservable<boolean>;

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray<any>;
        selectedActivityIds: KnockoutObservableArray<any>;

        /* Locations for multiselect. */
        locationSelectorId: string;
        initialLocations: any[];        // Bug - To overcome bug in Multiselect.
        selectedLocationValues: any[];

        fromDate: KnockoutObservable<Date>;
        toDate: KnockoutObservable<Date>;
        institutions: KnockoutObservable<string>;
        locations: KnockoutObservableArray<any>;

        errors: KnockoutValidationErrors;
        isValid: () => boolean;
        isAnyMessageShown: () => boolean;

        isHeatmapVisible: KnockoutObservable<boolean>;
        isPointmapVisible: KnockoutObservable<boolean>;
        isTableVisible: KnockoutObservable<boolean>;

        heatmap: any;
        heatmapOptions: any;
        heatmapActivityData: any;
        heatmapPeopleData: any;
        isGlobalView: KnockoutObservable<boolean>;

        barchart: any;
        barchartActivityOptions: any;
        barchartPeopleOptions: any;
        barchartWorldDataTable_cached: any;

        linechart: any;
        linechartActivityOptions: any;
        linechartPeopleOptions: any;

        pointmap: google.maps.Map;
        pointmapOptions: any;
        pointmapData: any;
        
        //resultsTable: any;
        //resultsTableOptions: any;
        //resultsTableData: any;

        summary: KnockoutObservable<any>;
        loadSpinner: ViewModels.Spinner;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize(institutionInfo: any): void {
            this.sammy = Sammy();
            this.initialLocations = [];        // Bug - To overcome bug in Multiselect.
            this.selectedLocationValues = [];
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
            this.selectedPlace = ko.observable(null); // null for global view
            this.isGlobalView = ko.observable(true);
            this.loadSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(200));
            this.barchartWorldDataTable_cached = null;

            this.selectSearchType('activities');

            if (institutionInfo != null) {

                if (institutionInfo.InstitutionId != null) {
                    this.institutionId(Number(institutionInfo.InstitutionId));
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

        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor(institutionInfo: any) {
            this._initialize(institutionInfo);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------   
        setupWidgets(locationSelectorId: string,
                fromDatePickerId: string,
                toDatePickerId: string,
                institutionSelectorId: string,
                campusDropListId: string,
                collegeDropListId: string,
                departmentDropListId: string
            ): void {

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
                change: (event: any) => {
                    this.updateLocations(event.sender.dataItems());
                },
                placeholder: "[Select Country/Location]"
            });

            $("#" + fromDatePickerId).kendoDatePicker({
                /* If user clicks date picker button, reset format */
                open: function (e) { this.options.format = "MM/dd/yyyy"; }
            });

            $("#" + toDatePickerId).kendoDatePicker({
                open: function (e) { this.options.format = "MM/dd/yyyy"; }
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
                        read: (options: any): void => {
                            $.ajax({
                                url: App.Routes.WebApi.Establishments.get(),
                                data: {
                                    typeEnglishNames: ['University', 'University System']
                                },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                change: (e: any): void => {
                    this.checkInstitutionForNull();
                },
                select: (e: any): void => {
                    var me = $("#" + institutionSelectorId).data("kendoAutoComplete");
                    var dataItem = me.dataItem(e.item.index());
                    this.institutionOfficialName(dataItem.officialName);
                    this.institutionId(dataItem.id);
                    if ((dataItem.countryName != null) && (dataItem.countryName.length > 0)) {
                        this.institutionCountryOfficialName(dataItem.countryName);
                    }
                    else {
                        this.institutionCountryOfficialName(null);
                    }
                }
            });

            $("#" + departmentDropListId ).kendoDropDownList({
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
                        }
                        else {
                            $("#departmenDiv").show();
                        }
                    }
                    else {
                        $("#departmenDiv").hide();
                    }
                }
            });

            var collegeDropListDataSource = null;

            if (!this.institutionHasCampuses()) {
                collegeDropListDataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: App.Routes.WebApi.Establishments.getChildren(this.institutionId()),
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
                                url: App.Routes.WebApi.Establishments.getChildren(this.institutionId()),
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

                                    $("#" + collegeDropListId ).data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                            else {
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
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
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
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        setupSubscriptions(): void {
            //this.from.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.to.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.institutions.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.position.subscribe((newValue: any): void => { this.dirtyFlag(true); });
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        setupRouting(): void {
            this.sammy.get('#/summary', ():void => { this.selectMap('heatmap'); });
            this.sammy.get('#/search', (): void => { this.selectMap('pointmap'); });
            this.sammy.get('#/results', (): void => { this.selectMap('resultstable'); });

            this.sammy.run('#/summary');
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupMaps(): void {
            var me = this;

            /* ----- Setup Pointmap ----- */

            this.google = window["google"];
            this.google.maps.visualRefresh = true;

            this.pointmap = new this.google.maps.Map($('#pointmap')[0], {
                width: 680,
                height: 500,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: new google.maps.LatLng(0, 0), // americas on left, australia on right
                zoom: 1, // zoom out
                draggable: true, // allow map panning
                scrollwheel: false // prevent mouse wheel zooming
            });

            /* ----- Setup Heatmap Activity (chart) ----- */

            //var countryData = new Array();
            var dataTable = new this.google.visualization.DataTable();

            var colNames = new Array();

            dataTable.addColumn('string', 'Country');
            dataTable.addColumn('number', 'Total Activities');

            if (this.summary != null) {

                //if (((<any>this.summary).placeActivityCounts() != null) &&
                //    ((<any>this.summary).placeActivityCounts().length > 0)) {
                //    var placeActivityCounts: KnockoutObservable<any> = (<any>this.summary).placeActivityCounts;
                //    if ((placeActivityCounts()[0].typeCounts() != null) &&
                //         (placeActivityCounts()[0].typeCounts().length > 0)) {
                //        //--for (var i = 0; i < placeActivityCounts()[0].typeCounts().length; i += 1) {
                //            //--colNames.push(placeActivityCounts()[0].typeCounts()[i].type());
                //            //--dataTable.addColumn('number', placeActivityCounts()[0].typeCounts()[i].type());
                //        dataTable.addColumn({ type: 'string', role: 'tooltip' });
                //        //--}
                //    }
                //}
                //countryData.push(colNames);

                if (((<any>this.summary).placeActivityCounts() != null) &&
                    ((<any>this.summary).placeActivityCounts().length > 0)) {
                    var placeActivityCounts: KnockoutObservable<any> = (<any>this.summary).placeActivityCounts;
          
                    for (var i = 0; i < placeActivityCounts().length; i += 1) {

                        var rowData = new Array();

                        rowData.push(placeActivityCounts()[i].officialName());
                        rowData.push(placeActivityCounts()[i].count());

                        //if ((placeActivityCounts()[0].typeCounts() != null) &&
                        //     (placeActivityCounts()[0].typeCounts().length > 0)) {
                        //    var tooltipText = "";
                        //    for (var j = 0; j < placeActivityCounts()[i].typeCounts().length; j += 1) {
                        //        tooltipText += placeActivityCounts()[i].typeCounts()[j].type() + ": " +
                        //                      placeActivityCounts()[i].typeCounts()[j].count();
                        //        //--rowData.push(Number(placeActivityCounts()[i].typeCounts()[j].count()));
                        //        //--rowData.push(tooltipText);
                        //    }
                        //    rowData.push(tooltipText);
                        //}

                        //--countryData.push(rowData);
                        dataTable.addRow(rowData)
                    }
                }
            }

            //$.ajax({
            //    type: "GET",
            //    async: false,
            //    url: App.Routes.WebApi.Activities.placeActivityCounts.post(),
            //    success: function (data, textStatus, jqXHR) {
            //        for (var i = 0; i < data.length; i += 1) {
            //            countryData.push([data[i].officialName, data[i].count]);
            //        }
            //    },
            //    error: function (jqXhr, textStatus, errorThrown) {
            //        //debugger;
            //    },
            //    dataType: 'json'
            //});

            //this.heatmapData = this.google.visualization.arrayToDataTable(countryData);
            this.heatmapActivityData = dataTable;


            /* ----- Setup Heatmap Activity (chart) ----- */
            dataTable = new this.google.visualization.DataTable();

            colNames = new Array();

            dataTable.addColumn('string', 'Location');
            dataTable.addColumn('number', 'Total People');

            if (this.summary != null) {

                if (((<any>this.summary).placePeopleCounts() != null) &&
                    ((<any>this.summary).placePeopleCounts().length > 0)) {
                    var placePeopleCounts: KnockoutObservable<any> = (<any>this.summary).placePeopleCounts;

                    for (var i = 0; i < placePeopleCounts().length; i += 1) {

                        var rowData = new Array();

                        rowData.push(placePeopleCounts()[i].officialName());
                        rowData.push(placePeopleCounts()[i].count());

                        dataTable.addRow(rowData)
                    }
                }
            }

            this.heatmapPeopleData = dataTable;

            this.heatmapOptions = {
                //is3D: true,
                width: 680,
                height: 500,
                //magnifyingGlass: { enable: true, zoomFactor: 7.5 },
                region: 'world', //'150',    // 002 Africa, 142 Asia
                backgroundColor: 'lightBlue',
                keepAspectRatio: false,
                colorAxis: { colors: ['#FFFFFF', 'green'] }
                //tooltip:{trigger: 'none'}
                //displayMode: 'markers'
            };

            this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
            this.google.visualization.events.addListener(this.heatmap, 'select', function () { me.heatmapSelectHandler(); });


            /* ----- Setup ColumnChart ----- */

            this.barchartActivityOptions = {
                title: 'Activities',
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
                title: 'Activities'
                //vAxis: { title: 'Count' },
                ////axisTitlesPosition: 'in',
                //chartArea: { left: 80 },
                //legend: { position: 'none' },
                //series: {
                //    0: {
                //        type: 'bars'
                //    },
                //    1: {
                //        type: 'line',
                //        color: 'black',
                //        lineWidth: 0,
                //        pointSize: 0,
                //        visibleInLegend: false
                //    }
                //}
            };

            this.linechartActivityOptions = {
                title: 'People'
                //vAxis: { title: 'Count' },
                ////axisTitlesPosition: 'in',
                //chartArea: { left: 80 },
                //legend: { position: 'none' },
                //series: {
                //    0: {
                //        type: 'bars'
                //    },
                //    1: {
                //        type: 'line',
                //        color: 'black',
                //        lineWidth: 0,
                //        pointSize: 0,
                //        visibleInLegend: false
                //    }
                //}
            };

            this.linechart = new this.google.visualization.LineChart($('#facultystaff-summary-linechart')[0]);
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        getActivityDataTable(place: string): any {

            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Activity');
            dt.addColumn('number', 'Count');
            dt.addColumn({ type: 'number', role: 'annotation' });

            if (place == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.summary).worldActivityCounts().length; i += 1) {
                    var activityType = (<any>this.summary).worldActivityCounts()[i].type();
                    var count = (<any>this.summary).worldActivityCounts()[i].count();
                    dt.addRow([activityType, count, count]);
                }
            } else { /* Add place counts */
                var i = 0;
                while ( (i < (<any>this.summary).placeActivityCounts().length) &&
                       ((<any>this.summary).placeActivityCounts()[i].officialName !== place)) {
                    i += 1;
                }

                if (i < (<any>this.summary).placeActivityCounts().length) {
                    var placeActivityCounts = (<any>this.summary).placeActivityCounts()[i];
                    for (var j = 0; j < placeActivityCounts.typeCounts().length; j += 1) {
                        var activityType = placeActivityCounts.typeCounts[j].type();
                        var count = placeActivityCounts.typeCounts[j].count();
                        dt.addRow([activityType, count, count]);
                    }
                }
            }

            var view = new this.google.visualization.DataView(dt);
            view.setColumns([0, 1, 1, 2]);

            return view;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        getPeopleDataTable(place: string): any {

            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'People');
            dt.addColumn('number', 'Count');
            dt.addColumn({ type: 'string', role: 'annotation' });

            if (place == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.summary).worldPeopleCounts().length; i += 1) {
                    var activityType = (<any>this.summary).worldPeopleCounts()[i].type();
                    var count = (<any>this.summary).worldPeopleCounts()[i].count();
                    dt.addRow([activityType, count, String(count)]);
                }
            } else { /* Add place counts */
                var i = 0;
                while ((i < (<any>this.summary).placePeopleCounts().length) &&
                       ((<any>this.summary).placePeopleCounts()[i].officialName !== place)) {
                    i += 1;
                }

                if (i < (<any>this.summary).placePeopleCounts().length) {
                    var placePeopleCounts = (<any>this.summary).placePeopleCounts()[i];
                    for (var j = 0; j < placePeopleCounts.typeCounts().length; j += 1) {
                        var activityType = placePeopleCounts.typeCounts[j].type();
                        var count = placePeopleCounts.typeCounts[j].count();
                        dt.addRow([activityType, count, String(count)]);
                    }
                }
            }

            return dt;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        getActivityTrendDataTable(place: string): any {

            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Year');
            dt.addColumn('number', 'Count');
            dt.addColumn({ type: 'number', role: 'annotation' });

            if (place == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.summary).worldTrendActivityCounts().length; i += 1) {
                    var activityType = (<any>this.summary).worldTrendActivityCounts()[i].type();
                    var count = (<any>this.summary).worldTrendActivityCounts()[i].count();
                    dt.addRow([activityType, count, count]);
                }
            } else { /* Add place counts */
                var i = 0;
                while ((i < (<any>this.summary).placeTrendActivityCounts().length) &&
                       ((<any>this.summary).placeTrendActivityCounts()[i].officialName !== place)) {
                    i += 1;
                }

                if (i < (<any>this.summary).placeTrendActivityCounts().length) {
                    var placeTrendActivityCounts = (<any>this.summary).placeTrendActivityCounts()[i];
                    for (var j = 0; j < placeTrendActivityCounts.typeCounts().length; j += 1) {
                        var activityType = placeTrendActivityCounts.typeCounts[j].type();
                        var count = placeTrendActivityCounts.typeCounts[j].count();
                        dt.addRow([activityType, count, count]);
                    }
                }
            }

            var view = new this.google.visualization.DataView(dt);
            view.setColumns([0, 1, 1, 2]);

            return view;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        getPeopleTrendDataTable(place: string): any {

            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Year');
            dt.addColumn('number', 'Count');
            dt.addColumn({ type: 'string', role: 'annotation' });

            if (place == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.summary).worldTrendPeopleCounts().length; i += 1) {
                    var activityType = (<any>this.summary).worldTrendPeopleCounts()[i].type();
                    var count = (<any>this.summary).worldTrendPeopleCounts()[i].count();
                    dt.addRow([activityType, count, String(count)]);
                }
            } else { /* Add place counts */
                var i = 0;
                while ((i < (<any>this.summary).placeTrendPeopleCounts().length) &&
                       ((<any>this.summary).placeTrendPeopleCounts()[i].officialName !== place)) {
                    i += 1;
                }

                if (i < (<any>this.summary).placeTrendPeopleCounts().length) {
                    var placeTrendPeopleCounts = (<any>this.summary).placePeopleCounts()[i];
                    for (var j = 0; j < placeTrendPeopleCounts.typeCounts().length; j += 1) {
                        var activityType = placeTrendPeopleCounts.typeCounts[j].type();
                        var count = placeTrendPeopleCounts.typeCounts[j].count();
                        dt.addRow([activityType, count, String(count)]);
                    }
                }
            }

            return dt;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var me = this;
            var deferred: JQueryDeferred<void> = $.Deferred();

            this.loadSpinner.start();

            var typesPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                          .done((data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                              typesPact.resolve(data);
                          })
                          .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                              typesPact.reject(jqXHR, textStatus, errorThrown);
                          });
        
            var summaryPact = $.Deferred();
            $.ajax({
                type: "GET",
                url: App.Routes.WebApi.FacultyStaff.getSummary(),
                success: function (data: any, textStatus: string, jqXhr: JQueryXHR): void
                    { summaryPact.resolve(data); },
                error: function (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void
                    { summaryPact.reject(jqXhr, textStatus, errorThrown); },
            });

            // only process after all requests have been resolved
            $.when(typesPact, summaryPact)
                            .done(( types: Service.ApiModels.IEmployeeActivityType[],
                                    summary: any): void => {

                                this.activityTypes = ko.mapping.fromJS(types);

                                /* Check the activity types checkboxes if the activity type exists in values. */
                                for (var i = 0; i < this.activityTypes().length; i += 1) {
                                    this.activityTypes()[i].checked = ko.computed(this.defHasActivityTypeCallback(i));
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

                                this.summary = ko.mapping.fromJS(summary);
                                deferred.resolve();
                            })
                            .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                                deferred.reject(xhr, textStatus, errorThrown);
                            });

            return deferred;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        checkInstitutionForNull() {
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
        }


        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        updateLocations(items: any[]): void {
            if (this.locations != null) {
                this.locations.removeAll();
                for (var i = 0; i < items.length; i += 1) {
                    var location = ko.mapping.fromJS({ id: 0, placeId: items[i].id, version: "" });
                    this.locations.push(location);
                }
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        selectMap(type: string): void {

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

                if (this.searchType() === 'activities') {
                    this.heatmap.draw(this.heatmapActivityData, this.heatmapOptions);

                    var dataTable = this.getActivityDataTable(this.selectedPlace());
                    this.barchart.draw(dataTable, this.barchartActivityOptions);

                    dataTable = this.getActivityTrendDataTable(this.selectedPlace());
                    this.linechart.draw(dataTable, this.linechartActivityOptions);
                } else {
                    this.heatmap.draw(this.heatmapPeopleData, this.heatmapOptions);

                    var dataTable = this.getPeopleDataTable(this.selectedPlace());
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
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        selectSearchType(type: string): void {
            if (type === 'activities') {
                this.setActivitiesSearch();
            }
            else {
                this.setPeopleSearch();
            }

            if (this.heatmap != null) {
                this.selectMap("heatmap");
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setActivitiesSearch(): void {
            $('#activitiesButton').css("font-weight", "bold");
            $('#peopleButton').css("font-weight", "normal");
            this.searchType('activities');
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setPeopleSearch(): void {
            $('#activitiesButton').css("font-weight", "normal");
            $('#peopleButton').css("font-weight", "bold");
            this.searchType('people');
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        addActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex == -1) {
                var newActivityType: KnockoutObservable<any> = ko.mapping.fromJS({ id: 0, typeId: activityTypeId, version: "" });
                this.selectedActivityIds.push(newActivityType);
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        removeActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex != -1) {
                var activityType = this.selectedActivityIds()[existingIndex];
                this.selectedActivityIds.remove(activityType);
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        getTypeName(id: number): string {
            var name: string = "";
            var index: number = this.getActivityTypeIndexById(id);
            if (index != -1) { name = this.activityTypes[index].type; }
            return name;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        getActivityTypeIndexById(activityTypeId: number): number {
            var index: number = -1;

            if ((this.selectedActivityIds != null) && (this.selectedActivityIds().length > 0)) {
                var i = 0;
                while ((i < this.selectedActivityIds().length) &&
                                     (activityTypeId != this.selectedActivityIds()[i].typeId())) { i += 1 }

                if (i < this.selectedActivityIds().length) {
                    index = i;
                }
            }

            return index;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        hasActivityType(activityTypeId: number): boolean {
            return this.getActivityTypeIndexById(activityTypeId) != -1;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        defHasActivityTypeCallback(activityTypeIndex: number): KnockoutComputedDefine<boolean> {
            var def: KnockoutComputedDefine<boolean> = {
                read: (): boolean => {
                    return this.hasActivityType(this.activityTypes()[activityTypeIndex].id());
                },
                write: (checked: boolean) => {
                    if (checked) {
                        this.addActivityType(this.activityTypes()[activityTypeIndex].id());
                    } else {
                        this.removeActivityType(this.activityTypes()[activityTypeIndex].id());
                    }
                },
                owner: this
            };

            return def;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        heatmapSelectHandler():void {
            var selection = this.heatmap.getSelection();
            if (this.searchType() === 'activities') {
                var str = this.heatmapActivityData.getFormattedValue(selection[0].row, 0);
            } else {
                var str = this.heatmapPeopleData.getFormattedValue(selection[0].row, 0);
            }
            this.selectedPlace(str);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        globalViewClickHandler(item: any, event: any): void {
            this.selectedPlace(null);
            this.selectMap('heatmap');
        }

    }
}
