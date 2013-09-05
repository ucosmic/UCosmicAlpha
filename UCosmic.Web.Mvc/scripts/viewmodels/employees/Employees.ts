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

module ViewModels.Employees {

    export class FacultyAndStaffSelect {
        institutions: KnockoutObservableArray<any>;
        loadSpinner: App.Spinner = new App.Spinner(new App.SpinnerOptions(200));

        load(): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();
            //this.loadSpinner.start();
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
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                    this.institutions = ko.mapping.fromJS(data);
                    deferred.resolve();
                },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(errorThrown);
                },
                complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                    //this.loadSpinner.stop();
                }
            });

            return deferred;
        }

        selectInstitutionUrl(institutionId: number): string {
            return App.Routes.Mvc.FacultyStaff.Institution.select(institutionId);
        }
    }

    export class FacultyAndStaff {

        google: any;
        sammy: Sammy.Application;

        /* Initialization errors. */
        inititializationErrors: string = "";

        /* True if any field changes. */
        ///dirtyFlag: KnockoutObservable<boolean> = ko.observable(false);

        mapType: KnockoutObservable<string>;
        searchType: KnockoutObservable<string>;
        selectedPlace: KnockoutObservable<string>;
        
        /* Element id of institution autocomplete */
        establishmentDropListId: string;
        establishmentId: KnockoutObservable<any>;
        establishmentOfficialName: KnockoutObservable<string>;
        establishmentCountryOfficialName: KnockoutObservable<string>;

        institutionHasCampuses: KnockoutObservable<boolean>;
        institutionDropListData: any[];

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray<any>;
        selectedActivityIds: KnockoutObservableArray<any>;

        /* List of place ids and official names. */
        places: any;
        
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
        isExpertVisible: KnockoutObservable<boolean>;
        isTableVisible: KnockoutObservable<boolean>;

        heatmap: any;
        heatmapOptions: any;
        isGlobalView: KnockoutObservable<boolean>;

        barchart: any;
        barchartActivityOptions: any;
        barchartPeopleOptions: any;

        linechart: any;
        linechartActivityOptions: any;
        linechartPeopleOptions: any;

        pointmap: google.maps.Map;
        pointmapOptions: any;
        pointmapData: any;

        //resultsTable: any;
        //resultsTableOptions: any;
        //resultsTableData: any;

        /* Data caches */
        globalActivityCountData: any;
        placeActivityCountData: any;
        globalPeopleCountData: any;
        placePeopleCountData: any;
        globalActivityTrendData: any;
        placeActivityTrendData: any;
        globalPeopleTrendData: any;
        placePeopleTrendData: any;
        heatmapActivityDataTable: any;
        heatmapPeopleDataTable: any;

        totalCount: KnockoutObservable<number>;
        totalPlaceCount: KnockoutObservable<number>;

        degreeCount: KnockoutObservable<number>; 

        /* If you add or remove from this list, also look at _getHeatmapActivityDataTable()
            and _getHeatmapPeopleDataTable() to update the custom place tooltips text. */
        geochartCustomPlaces: any[] = [
            {
                name: 'Antarctica', id: 'antarctica', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Southern Ocean', id: 'southernOcean', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Indian Ocean', id: 'indianOcean', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Pacific Ocean', id: 'pacificOcean', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Atlantic Ocean', id: 'atlanticOcean', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Gulf of Mexico', id: 'gulfOfMexico', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Caribbean', id: 'caribbean', activityCount: 0, peopleCount: 0
            },
            {
                name: 'Arctic Ocean', id: 'arcticOcean', activityCount: 0, peopleCount: 0
            },
        ];


        loadSpinner: App.Spinner;
        
        _initialize(institutionInfo: any): void {
            this.sammy = Sammy();
            this.initialLocations = [];        // Bug - To overcome bug in Multiselect.
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
            this.selectedPlace = ko.observable(null); // null for global view
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
        }

        constructor(institutionInfo: any) {
            this._initialize(institutionInfo);
        }

        setupWidgets(locationSelectorId: string,
            fromDatePickerId: string,
            toDatePickerId: string,
            establishmentDropListId: string,
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
                change: function(e) {
                    var item = this.dataItem(e.sender.selectedIndex);
                    me.clearCachedData(); 
                    me.establishmentId(item.id);
                    me.establishmentOfficialName(item.officialName);
                    me.selectMap(me.mapType());
                }
            });

            $("#" + departmentDropListId ).kendoDropDownList({
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

        setupSubscriptions(): void {
            //this.from.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.to.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.institutions.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            //this.position.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.selectedPlace.subscribe((newValue: any): void => { this.selectMap('heatmap'); });
        }

        setupRouting(): void {
            this.sammy.get('#/summary', ():void => { this.selectMap('heatmap'); });
            this.sammy.get('#/search', (): void => { this.selectMap('pointmap'); });
            this.sammy.get('#/expert', (): void => { this.selectMap('expert'); });
            this.sammy.get('#/results', (): void => { this.selectMap('resultstable'); });

            this.sammy.run('#/summary');
        }

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

            this.heatmapOptions = {
                //is3D: true,
                width: 680,
                height: 500,
                //magnifyingGlass: { enable: true, zoomFactor: 7.5 },
                region: 'world', //'150',    // 002 Africa, 142 Asia
                //backgroundColor: 'lightBlue',
                keepAspectRatio: false,
                colorAxis: { colors: ['#FFFFFF', 'green'] },
                backgroundColor: { fill: 'transparent' },
                datalessRegionColor: 'FFFFFF'
                //tooltip:{trigger: 'none'}
                //displayMode: 'markers'
            };

            this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
            this.google.visualization.events.addListener(this.heatmap, 'select', function () { me.heatmapSelectHandler(); });


            /* ----- Setup ColumnChart ----- */

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
        }

        getHeatmapActivityDataTable(): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (this.globalActivityCountData == null) {
                //this.loadSpinner.start();
                this.getActivityDataTable(null)
                    .done((): void => {
                        deferred.resolve(this._getHeatmapActivityDataTable());
                        //this.loadSpinner.stop();
                    });
            }
            else {
                deferred.resolve(this._getHeatmapActivityDataTable());
            }

            return deferred;
        }

        _getHeatmapActivityDataTable(): any {
            if (this.heatmapActivityDataTable == null) {
                var dataTable = new this.google.visualization.DataTable();

                var colNames = new Array();
                dataTable.addColumn('string', 'Country');
                dataTable.addColumn('number', 'Total Activities');

                var placeCounts = (<any>this.globalActivityCountData).placeCounts;
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

                        if ((officialName === "North Atlantic Ocean") ||
                            (officialName === "South Atlantic Ocean")) {
                                j = this.getCustomPlaceIndexByName("Atlantic Ocean");
                        }
                        else if ((officialName === "North Pacific Ocean") ||
                            (officialName === "Pacific Ocean") ||
                            (officialName === "South Pacific Ocean")) {
                                j = this.getCustomPlaceIndexByName("Pacific Ocean");
                        }
                        else if (officialName === "Arctic Ocean") {
                            j = this.getCustomPlaceIndexByName("Arctic Ocean");
                        }
                        else if (officialName === "Gulf of Mexico") {
                            j = this.getCustomPlaceIndexByName("Gulf of Mexico");
                        }
                        else if (officialName === "Caribbean Ocean") {
                            j = this.getCustomPlaceIndexByName("Caribbean");
                        }
                        else if (officialName === "Indian Ocean") {
                            j = this.getCustomPlaceIndexByName("Indian Ocean");
                        }
                        else if (officialName === "Southern Ocean") {
                            j = this.getCustomPlaceIndexByName("Southern Ocean");
                        }
                        else if (officialName === "Antarctica") {
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
        }

        getHeatmapPeopleDataTable(): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (this.globalPeopleCountData == null) {
                //this.loadSpinner.start();
                this.getPeopleDataTable(null)
                    .done((): void => {
                        deferred.resolve(this._getHeatmapPeopleDataTable());
                        //this.loadSpinner.stop();
                    });
            }
            else {
                deferred.resolve(this._getHeatmapPeopleDataTable());
            }

            return deferred;
        }

        _getHeatmapPeopleDataTable(): any {

            if (this.heatmapPeopleDataTable == null) {
                var dataTable = new this.google.visualization.DataTable();

                var colNames = new Array();
                dataTable.addColumn('string', 'Country');
                dataTable.addColumn('number', 'Total People');

                var placeCounts = (<any>this.globalPeopleCountData).placeCounts;
                if ((placeCounts != null) && (placeCounts.length > 0)) {

                    for (var i = 0; i < this.geochartCustomPlaces.length; i += 1) {
                        this.geochartCustomPlaces[i].peopleCount = 0;
                    }

                    for (var i = 0; i < placeCounts.length; i += 1) {
                        var rowData = new Array();
                        rowData.push(placeCounts[i].officialName);
                        rowData.push(placeCounts[i].count);
                        dataTable.addRow(rowData)

                        var officialName = placeCounts[i].officialName;
                        var count = placeCounts[i].count;
                        var j = -1;

                        if ((officialName === "North Atlantic Ocean") ||
                            (officialName === "South Atlantic Ocean")) {
                            j = this.getCustomPlaceIndexByName("Atlantic Ocean");
                        }
                        else if ((officialName === "North Pacific Ocean") ||
                            (officialName === "Pacific Ocean") ||
                            (officialName === "South Pacific Ocean")) {
                            j = this.getCustomPlaceIndexByName("Pacific Ocean");
                        }
                        else if (officialName === "Arctic Ocean") {
                            j = this.getCustomPlaceIndexByName("Arctic Ocean");
                        }
                        else if (officialName === "Gulf of Mexico") {
                            j = this.getCustomPlaceIndexByName("Gulf of Mexico");
                        }
                        else if (officialName === "Caribbean Ocean") {
                            j = this.getCustomPlaceIndexByName("Caribbean");
                        }
                        else if (officialName === "Indian Ocean") {
                            j = this.getCustomPlaceIndexByName("Indian Ocean");
                        }
                        else if (officialName === "Southern Ocean") {
                            j = this.getCustomPlaceIndexByName("Southern Ocean");
                        }
                        else if (officialName === "Antarctica") {
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
        }

       /*
        *
        */
        getActivityDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                if (this.globalActivityCountData == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            this.globalActivityCountData = data;
                            deferred.resolve(this._getActivityDataTable(null));
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
                else {
                    deferred.resolve(this._getActivityDataTable(null));
                }
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                    if ((this.placeActivityCountData == null) ||
                        ((<any>this.placeActivityCountData).placeId != placeId)) {
                        //this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                            success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                                this.placeActivityCountData = data;
                                deferred.resolve(this._getActivityDataTable(placeOfficialName));
                            },
                            error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                                deferred.reject(errorThrown);
                            },
                            complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                               // this.loadSpinner.stop();
                            }
                        });
                    }
                    else {
                        deferred.resolve(this._getActivityDataTable(placeOfficialName));
                    }
                }
                else {
                    deferred.reject("Unknown PlaceId");
                }
            }

            return deferred;
        }

        _getActivityDataTable(placeOfficialName: string): any {
            var view = null
            var dt = null;

            if (placeOfficialName == null) {
                dt = new this.google.visualization.DataTable();

                dt.addColumn('string', 'Activity');
                dt.addColumn('number', 'Count');
                dt.addColumn({ type: 'number', role: 'annotation' });

                for (var i = 0; i < (<any>this.globalActivityCountData).typeCounts.length; i += 1) {
                    var activityType = (<any>this.globalActivityCountData).typeCounts[i].type;
                    var count = (<any>this.globalActivityCountData).typeCounts[i].count;
                    dt.addRow([activityType, count, count]);
                }
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {

                    dt = new this.google.visualization.DataTable();

                    dt.addColumn('string', 'Activity');
                    dt.addColumn('number', 'Count');
                    dt.addColumn({ type: 'number', role: 'annotation' });

                    for (var i = 0; i < (<any>this.placeActivityCountData).typeCounts.length; i += 1) {
                        var activityType = (<any>this.placeActivityCountData).typeCounts[i].type;
                        var count = (<any>this.placeActivityCountData).typeCounts[i].count;
                        dt.addRow([activityType, count, count]);
                    }           
                }
            }

            view = new this.google.visualization.DataView(dt);
            view.setColumns([0, 1, 1, 2]);

            return view;
        }

        /*
        *
        */
        getPeopleDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                if (this.globalPeopleCountData == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            this.globalPeopleCountData = data;
                            deferred.resolve(this._getPeopleDataTable(null));
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
                else {
                    deferred.resolve(this._getPeopleDataTable(null));
                }
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                    if ((this.placePeopleCountData == null) ||
                        ((<any>this.placePeopleCountData).placeId != placeId)) {
                            //this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getPeopleCount(),
                            success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                                this.placePeopleCountData = data;
                                deferred.resolve(this._getPeopleDataTable(placeOfficialName));
                            },
                            error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                                deferred.reject(errorThrown);
                            },
                            complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                                //this.loadSpinner.stop();
                            }
                        });
                    }
                    else {
                        deferred.resolve(this._getPeopleDataTable(placeOfficialName));
                    }
                }
                else {
                    deferred.reject("Unknown placeId.");
                }
            }

            return deferred;
        }

        _getPeopleDataTable(placeOfficialName: string): any {   
            var view = null;
            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Activity');
            dt.addColumn('number', 'Count');
            dt.addColumn({ type: 'number', role: 'annotation' });

            if (placeOfficialName == null) { /* Add global counts */
                for (var i = 0; i < (<any>this.globalPeopleCountData).typeCounts.length; i += 1) {
                    var activityType = (<any>this.globalPeopleCountData).typeCounts[i].type;
                    var count = (<any>this.globalPeopleCountData).typeCounts[i].count;
                    dt.addRow([activityType, count, count]);
                }
            } else { /* Add place counts */
                for (var i = 0; i < (<any>this.placePeopleCountData).typeCounts.length; i += 1) {
                    var activityType = (<any>this.placePeopleCountData).typeCounts[i].type;
                    var count = (<any>this.placePeopleCountData).typeCounts[i].count;
                    dt.addRow([activityType, count, count]);
                }
            }

            view = new this.google.visualization.DataView(dt);
            view.setColumns([0, 1, 1, 2]);

            return view;
        }

       /*
        *
        */
        getActivityTrendDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                if (this.globalActivityTrendData == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getActivityTrend(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            this.globalActivityTrendData = data;
                            deferred.resolve(this._getActivityTrendDataTable(null));
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
                else {
                    deferred.resolve(this._getActivityTrendDataTable(null));
                }
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                    if ((this.placeActivityTrendData == null) ||
                        ((<any>this.placeActivityTrendData).placeId != placeId)) {
                            //this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getActivityTrend(),
                            success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                                this.placeActivityTrendData = data;
                                deferred.resolve(this._getActivityTrendDataTable(placeOfficialName));
                            },
                            error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                                deferred.reject(errorThrown);
                            },
                            complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                                //this.loadSpinner.stop();
                            }
                        });
                    }
                    else {
                        deferred.resolve(this._getActivityTrendDataTable(placeOfficialName));
                    }
                }
                else {
                    deferred.reject();
                }
            }

            return deferred;
        }

        _getActivityTrendDataTable(placeOfficialName: string): any {
            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Year');
            dt.addColumn('number', 'Count');

            if (placeOfficialName == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.globalActivityTrendData).trendCounts.length; i += 1) {
                    var year = (<any>this.globalActivityTrendData).trendCounts[i].year.toString();
                    var count = (<any>this.globalActivityTrendData).trendCounts[i].count;
                    dt.addRow([year, count]);
                }
            } else { /* Add place counts */
                for (var i = 0; i < (<any>this.placeActivityTrendData).trendCounts.length; i += 1) {
                    var year = (<any>this.placeActivityTrendData).trendCounts[i].year.toString();
                    var count = (<any>this.placeActivityTrendData).trendCounts[i].count;
                    dt.addRow([year, count]);
                }
            }

            return dt;
        }

        getPeopleTrendDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                if (this.globalPeopleTrendData == null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getPeopleTrend(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            this.globalPeopleTrendData = data;
                            deferred.resolve(this._getPeopleTrendDataTable(null));
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                    if ((this.placePeopleTrendData == null) ||
                        ((<any>this.placePeopleTrendData).placeId != placeId)) {
                            //this.loadSpinner.start();
                        $.ajax({
                            type: "GET",
                            async: true,
                            data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                            dataType: 'json',
                            url: App.Routes.WebApi.FacultyStaff.getPeopleTrend(),
                            success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                                this.placePeopleTrendData = data;
                                deferred.resolve(this._getPeopleTrendDataTable(placeOfficialName));
                            },
                            error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                                deferred.reject(errorThrown);
                            },
                            complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                                //this.loadSpinner.stop();
                            }
                        });
                    }
                }
                else {
                    deferred.reject("Unkown placeId");
                }
            }

            return deferred;
        }

        _getPeopleTrendDataTable(placeOfficialName: string): any {
            var dt = new this.google.visualization.DataTable();

            dt.addColumn('string', 'Year');
            dt.addColumn('number', 'Count');

            if (placeOfficialName == null) { /* Add world counts */
                for (var i = 0; i < (<any>this.globalPeopleTrendData).trendCounts.length; i += 1) {
                    var year = (<any>this.globalPeopleTrendData).trendCounts[i].year.toString();
                    var count = (<any>this.globalPeopleTrendData).trendCounts[i].count;
                    dt.addRow([year, count]);
                }
            } else { /* Add place counts */
                for (var i = 0; i < (<any>this.placePeopleTrendData).trendCounts.length; i += 1) {
                    var year = (<any>this.placePeopleTrendData).trendCounts[i].year.toString();
                    var count = (<any>this.placePeopleTrendData).trendCounts[i].count;
                    dt.addRow([year, count]);
                }
            }

            return dt;
        }

        /*
         *
         */
        getDegreeCount(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                //this.loadSpinner.start();
                $.ajax({
                    type: "GET",
                    async: true,
                    data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                    dataType: 'json',
                    url: App.Routes.WebApi.FacultyStaff.getDegreeCount(),
                    success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                        deferred.resolve(data.count);
                    },
                    error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(errorThrown);
                    },
                    complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                        //this.loadSpinner.stop();
                    }
                });
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                   // this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getDegreeCount(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            deferred.resolve(data.count);
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
                else {
                    deferred.reject("Unknown PlaceId");
                }
            }

            return deferred;
        }

        /*
         *
         */
        getDegreePeopleCount(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                //this.loadSpinner.start();
                $.ajax({
                    type: "GET",
                    async: true,
                    data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                    dataType: 'json',
                    url: App.Routes.WebApi.FacultyStaff.getDegreePeopleCount(),
                    success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                        deferred.resolve(data.count);
                    },
                    error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(errorThrown);
                    },
                    complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                        //this.loadSpinner.stop();
                    }
                });
            }
            else {
                var placeId = this.getPlaceId(placeOfficialName);
                if (placeId != null) {
                    //this.loadSpinner.start();
                    $.ajax({
                        type: "GET",
                        async: true,
                        data: { 'establishmentId': this.establishmentId(), 'placeId': placeId },
                        dataType: 'json',
                        url: App.Routes.WebApi.FacultyStaff.getDegreePeopleCount(),
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                            deferred.resolve(data.count);
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            deferred.reject(errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            //this.loadSpinner.stop();
                        }
                    });
                }
                else {
                    deferred.reject("Unknown PlaceId");
                }
            }

            return deferred;
        }

        makeActivityTooltip(name: string, count: number): string {
            return "<b>" + name + "</b><br/>Total Activities: " + count.toString();
        }

        makePeopleTooltip(name: string, count: number): string {
            return "<b>" + name + "</b><br/>Total People: " + count.toString();
        }

        updateCustomGeochartPlaceTooltips(selector: string): any {
            var id: string = "";
            var name:string = "";
            var count:number = 0;
            
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
                    })
                }
                else
                {
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
                    })
                }
            }
        }

        load(): JQueryPromise<any> {
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
        
            var placesPact = $.Deferred();
            $.ajax({
                type: "GET",
                data: { isCountry: true },
                dataType: 'json',
                url: App.Routes.WebApi.Places.get(),
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void =>
                { placesPact.resolve(data); },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void =>
                { placesPact.reject(jqXhr, textStatus, errorThrown); },
            });

            var watersPact = $.Deferred();
            $.ajax({
                type: "GET",
                data: { isWater: true },
                dataType: 'json',
                url: App.Routes.WebApi.Places.get(),
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void =>
                { watersPact.resolve(data); },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void =>
                { watersPact.reject(jqXhr, textStatus, errorThrown); },
            });

            // only process after all requests have been resolved
            $.when(typesPact, placesPact, watersPact)
                .done((types: any, places: any, waters: any): void => {

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

                    this.places = places.concat(waters);

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
                })
                .always((): void => {
                    //this.loadSpinner.stop();
                });

            return deferred;
        }

        checkInstitutionForNull() {
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
        }

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
        * 
        */
        // --------------------------------------------------------------------------------
        selectMap(type: string): void {

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
                this.loadSpinner.start();

                if (this.searchType() === 'activities') {
                    this.getActivityDataTable(this.selectedPlace())
                        .done((dataTable: any): void => {
                            this.barchart.draw(dataTable, this.barchartActivityOptions);
                            if (this.selectedPlace() != null) {
                                this.totalCount(this.placeActivityCountData.count);
                                this.totalPlaceCount(this.placeActivityCountData.countOfPlaces);
                            }

                            this.getHeatmapActivityDataTable()
                                .done((dataTable: any): void => {
                                    this.heatmap.draw(dataTable, this.heatmapOptions);
                                    if (this.selectedPlace() == null) {
                                        this.totalCount(this.globalActivityCountData.count);
                                        this.totalPlaceCount(this.globalActivityCountData.countOfPlaces);
                                    }
                                    this.updateCustomGeochartPlaceTooltips(this.searchType());
                                });

                            this.loadSpinner.stop();
                        });

                    this.getActivityTrendDataTable(this.selectedPlace())
                        .done((dataTable: any): void => {
                            this.linechart.draw(dataTable, this.linechartActivityOptions);
                        });

                    this.getDegreeCount(this.selectedPlace())
                        .done((count: any): void => {
                            this.degreeCount(count);
                        });                  
                } else {
                    this.getPeopleDataTable(this.selectedPlace())
                        .done((dataTable: any): void => {
                            this.barchart.draw(dataTable, this.barchartPeopleOptions);
                            if (this.selectedPlace() != null) {
                                this.totalCount(this.placePeopleCountData.count);
                                this.totalPlaceCount(this.placePeopleCountData.countOfPlaces);
                            }
 
                            this.getHeatmapPeopleDataTable()
                                .done((dataTable: any): void => {
                                    this.heatmap.draw(dataTable, this.heatmapOptions);
                                    if (this.selectedPlace() == null) {
                                        this.totalCount(this.globalPeopleCountData.count);
                                        this.totalPlaceCount(this.globalPeopleCountData.countOfPlaces);
                                    }
                                    this.updateCustomGeochartPlaceTooltips(this.searchType());
                                });
                            
                            this.loadSpinner.stop();                                                                     
                        });

                    this.getPeopleTrendDataTable(this.selectedPlace())
                        .done((dataTable: any): void => {
                            this.linechart.draw(dataTable, this.linechartPeopleOptions);
                        });

                    this.getDegreePeopleCount(this.selectedPlace())
                        .done((count: any): void => {
                            this.degreeCount(count);
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
        }

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

        setActivitiesSearch(): void {
            $('#activitiesButton').css("font-weight", "bold");
            $('#peopleButton').css("font-weight", "normal");
            this.searchType('activities');
        }

        setPeopleSearch(): void {
            $('#activitiesButton').css("font-weight", "normal");
            $('#peopleButton').css("font-weight", "bold");
            this.searchType('people');
        }

        addActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex == -1) {
                var newActivityType: KnockoutObservable<any> = ko.mapping.fromJS({ id: 0, typeId: activityTypeId, version: "" });
                this.selectedActivityIds.push(newActivityType);
            }
        }

        removeActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex != -1) {
                var activityType = this.selectedActivityIds()[existingIndex];
                this.selectedActivityIds.remove(activityType);
            }
        }

        getTypeName(id: number): string {
            var name: string = "";
            var index: number = this.getActivityTypeIndexById(id);
            if (index != -1) { name = this.activityTypes[index].type; }
            return name;
        }

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

        hasActivityType(activityTypeId: number): boolean {
            return this.getActivityTypeIndexById(activityTypeId) != -1;
        }

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

        heatmapSelectHandler(): void {
            var selection = this.heatmap.getSelection();
            if ((selection != null) && (selection.length > 0)) {
                var str: string = '';
                if (this.searchType() === 'activities') {
                    str = this.heatmapActivityDataTable.getFormattedValue(selection[0].row, 0);
                } else {
                    str = this.heatmapPeopleDataTable.getFormattedValue(selection[0].row, 0);
                }
                this.selectedPlace(str);
            }
        }

        expertClickHandler(item: any, event: any): void {
            this.selectMap('expert');
        }

        globalViewClickHandler(item: any, event: any): void {
            this.selectedPlace(null);
            this.selectMap('heatmap');
        }

        getPlaceId(officialName: string): number {
            var i = 0;
            while ((i < this.places.length) &&
                (officialName !== this.places[i].officialName)) {
                    i += 1;
            }
            return (i < this.places.length) ? this.places[i].id : null;
        }

        getCustomPlaceIndexByName(officialName: string): number {
            var i = 0;
            while ((i < this.geochartCustomPlaces.length) &&
                (officialName !== this.geochartCustomPlaces[i].name)) {
                i += 1;
            }
            return (i < this.geochartCustomPlaces.length) ? i : -1;
        }
        
        clearCachedData(): void {
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
        }

        customPlaceClick(event: any, item: any, officialName: any): void {
            this.selectedPlace(officialName);
        }
    }
}
