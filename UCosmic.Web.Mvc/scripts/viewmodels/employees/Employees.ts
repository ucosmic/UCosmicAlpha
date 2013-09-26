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

    declare class MarkerWithLabelOptions extends MarkerWithLabel {
        constructor();
        crossImage: string;
        handCursor: string;
        labelAnchor: any;
        labelClass: string;
        labelContent: any;
        labelInBackground: boolean;
        labelStyle: any;
        labelVisible: boolean;
        optimized: boolean;
        raiseOnDrag: boolean;
        position: any;

    }

    declare class MarkerWithLabel extends google.maps.Marker {
        constructor(opts?: any);
        crossImage: string;
        handCursor: string;
        labelAnchor: any;
        labelClass: string;
        labelContent: any;
        labelInBackground: boolean;
        labelStyle: any;
        labelVisible: boolean;
        optimized: boolean;
        raiseOnDrag: boolean;
    }

    export class FacultyAndStaffSelect {
        institutions: KnockoutObservableArray<any>;

        load(): JQueryPromise<any> {
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

        /* True if any field changes. */
        ///dirtyFlag: KnockoutObservable<boolean> = ko.observable(false);

        lenses: KnockoutObservableArray<any>;
        lens: KnockoutObservable<string>;

        mapType: KnockoutObservable<string>;
        searchType: KnockoutObservable<string>;
        selectedPlace: KnockoutObservable<string>;  // observable to control what stats are shown - world/place
        mapRegion: KnockoutObservable<string>;      // observable to control the custom place layers

        /* Element ids */
        establishmentDropListId: string;
        campusDropListId: string;
        collegeDropListId: string;
        departmentDropListId: string;

        /* Element id of institution autocomplete */
        establishmentId: KnockoutObservable<any>;
        establishmentOfficialName: KnockoutObservable<string>;
        establishmentCountryOfficialName: KnockoutObservable<string>;


        institutionHasCampuses: KnockoutObservable<boolean>;
        institutionDropListData: any[];

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray<any>;
        //selectedActivityIds: KnockoutObservableArray<any>;

        /* List of place ids and official names. */
        places: any;

        /* Locations for multiselect. */
        locationSelectorId: string;
        initialLocations: any[];        // Bug - To overcome bug in Multiselect.
        selectedLocationValues: any[];

        fromDate: KnockoutObservable<Date>;
        toDate: KnockoutObservable<Date>;
        includeUndated: KnockoutObservable<boolean>;
        institutions: KnockoutObservable<string>;
        locations: KnockoutObservableArray<any>;

        degrees: KnockoutObservable<string>;
        tags: KnockoutObservable<string>;

        errors: KnockoutValidationErrors;
        isValid: () => boolean;
        isAnyMessageShown: () => boolean;

        isHeatmapVisible: KnockoutObservable<boolean>;
        isPointmapVisible: KnockoutObservable<boolean>;
        isExpertVisible: KnockoutObservable<boolean>;
        //isTableVisible: KnockoutObservable<boolean>;

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
        activityResults: any;
        peopleResults: any;
        pointmapActivityMarkers: any;
        pointmapPeopleMarkers: any;

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
            this.includeUndated = ko.observable(true);
            this.establishmentId = ko.observable(null);
            this.establishmentOfficialName = ko.observable(null);
            this.establishmentCountryOfficialName = ko.observable(null);
            this.institutionHasCampuses = ko.observable(false);
            this.institutionDropListData = [];
            this.locations = ko.observableArray();
            this.activityTypes = ko.observableArray();
            //this.selectedActivityIds = ko.observableArray();
            this.isHeatmapVisible = ko.observable(true);
            this.isPointmapVisible = ko.observable(false);
            this.isExpertVisible = ko.observable(false);
            //this.isTableVisible = ko.observable(false);
            this.mapType = ko.observable('heatmap');
            this.searchType = ko.observable('activities');
            this.selectedPlace = ko.observable(null); // null for global view
            this.mapRegion = ko.observable('world');
            this.isGlobalView = ko.observable(true);

            this.degrees = ko.observable();
            this.tags = ko.observable();
            
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
            this.activityResults = ko.mapping.fromJS({
                placeResults: [{
                    officialName: '',
                    results: []
                }]
            });
            this.peopleResults = ko.mapping.fromJS({
                placeResults: [{
                    officialName: '',
                    results: []
                }]
            });
            this.pointmapActivityMarkers = null;
            this.pointmapPeopleMarkers = null;

            this.totalCount = ko.observable(0);
            this.totalPlaceCount = ko.observable(0);

            this.degreeCount = ko.observable(0);

            this.selectSearchType('activities');

            this.lenses = ko.observableArray([
                { text: 'Map', value: 'map' },
                { text: 'Table', value: 'table' }
            ]);
            this.lens = ko.observable('map');


            if (institutionInfo != null) {

                if (institutionInfo.InstitutionId != null) {
                    this.establishmentId(Number(institutionInfo.InstitutionId));

                    this.institutionDropListData.push({
                        "officialName": institutionInfo.InstitutionOfficialName,
                        "id": institutionInfo.InstitutionId
                    });
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
            this.campusDropListId = campusDropListId;
            this.collegeDropListId = collegeDropListId;
            this.departmentDropListId = departmentDropListId;

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

                    me.drawPointmap(true);
                }
            });

            $("#" + departmentDropListId).kendoDropDownList({
                dataTextField: "officialName",
                dataValueField: "id",
                optionLabel: { officialName: "[All Departments]", id: 0 },
                change: function (e) {
                    me.drawPointmap(true);
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
                optionLabel: { officialName: "[All Colleges]", id: 0 },
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

                        if (selectedIndex == 0) {
                            $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(new kendo.data.DataSource());
                        }

                        me.drawPointmap(true);
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
                    optionLabel: { officialName: "[All Institutions]", id: 0 },
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

                            if (selectedIndex == 0) {
                                $("#" + departmentDropListId).data("kendoDropDownList").setDataSource(new kendo.data.DataSource());
                                $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(new kendo.data.DataSource()); 

                                $("#" + collegeDropListId).data("kendoDropDownList").text("");                  
                            }

                            me.drawPointmap(true);
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
                            }
                            else {
                                $("#" + collegeDropListId).data("kendoDropDownList").setDataSource(new kendo.data.DataSource());
                            }
                        }
                    }
                });
            }

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
            this.selectedPlace.subscribe((newValue: any): void => { this.selectMap('heatmap'); });
            this.mapRegion.subscribe((newValue: any): void => { this.heatmapOptions["region"] = newValue; });

            this.searchType.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    //this.activitySearch();
                }
            });

            for (var i = 0; i < this.activityTypes().length; i += 1) {
                this.activityTypes()[i].checked.subscribe((newValue: any): void => {
                    if (this.mapType() === 'pointmap') {
                        this.drawPointmap(true);
                    }
                });
            }

            this.degrees.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    this.drawPointmap(true);
                }
            });

            this.tags.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    this.drawPointmap(true);
                }
            });

            this.fromDate.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    this.drawPointmap(true);
                }
            });

            this.toDate.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    this.drawPointmap(true);
                }
            });

            this.includeUndated.subscribe((newValue: any): void => {
                if (this.mapType() === 'pointmap') {
                    this.drawPointmap(true);
                }
            });
        }
        
        setupRouting(): void {
            this.sammy.get('#/summary', (): void => {
                this.selectMap('heatmap');
                $('#pageTitle').text("Professional Engagement Summary");
            });

            this.sammy.get('#/search', (): void => {
                this.selectMap('pointmap');
                $('#pageTitle').text("Advanced Search");
            });

            this.sammy.get('#/expert', (): void => {
                this.selectMap('expert');
                $('#pageTitle').text("Find an Expert");
            });

            this.sammy.run('#/summary');
        }

        setupMaps(): void {

            this.google.maps.visualRefresh = true;

            /* ----- Setup Pointmap ----- */
            this.pointmapOptions = {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: new google.maps.LatLng(0, 0), // americas on left, australia on right
                zoom: 1, // zoom out
                draggable: true, // allow map panning
                scrollwheel: false // prevent mouse wheel zooming
            };

            /* ----- Setup Heatmap ----- */
            this.heatmapOptions = {
                //is3D: true,
                width: 680,
                height: 500,
                //magnifyingGlass: { enable: true, zoomFactor: 7.5 },
                region: 'world', //'150',    // 002 Africa, 142 Asia
                //backgroundColor: 'lightBlue',
                keepAspectRatio: false,
                colorAxis: { colors: ['#FFFFFF', 'darkgreen'] },
                backgroundColor: { fill: 'transparent' },
                datalessRegionColor: 'FFFFFF'
                //tooltip:{trigger: 'none'}
                //displayMode: 'markers'
            };

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
                        top: 16,
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
                    top: 16,
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
                legend: { position: 'none' },
                vAxis: { minValue: 0 }
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
                legend: { position: 'none' },
                vAxis: { minValue: 0 }
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
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
            }
            else {
                deferred.resolve(this._getHeatmapActivityDataTable());
            }

            return deferred;
        }

        private _getHeatmapActivityDataTable(): any {
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

        private _getHeatmapPeopleDataTable(): any {

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
        getGlobalActivityCounts(): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (this.globalActivityCountData == null) {
                $.ajax({
                    type: "GET",
                    async: true,
                    data: { 'establishmentId': this.establishmentId(), 'placeId': null },
                    dataType: 'json',
                    url: App.Routes.WebApi.FacultyStaff.getActivityCount(),
                    success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                        this.globalActivityCountData = data;
                        deferred.resolve(this.globalActivityCountData);
                    },
                    error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(errorThrown);
                    },
                    complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                    }
                });
            }
            else {
                deferred.resolve(this.globalActivityCountData);
            }

            return deferred;
        }

        /*
         *
         */
        getActivityDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                this.getGlobalActivityCounts()
                    .done((counts: any): void => {
                        deferred.resolve(this._getActivityDataTable(null));
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
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

        getGlobalPeopleCounts(): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();
            if (this.globalPeopleCountData == null) {
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
                    }
                });
            }
            else {
                deferred.resolve(this._getPeopleDataTable(null));
            }
            return deferred;
        }

        /*
        *
        */
        getPeopleDataTable(placeOfficialName: string): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (placeOfficialName == null) {
                this.getGlobalPeopleCounts()
                    .done((counts: any): void => {
                        deferred.resolve(this._getPeopleDataTable(null));
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
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
                else {
                    deferred.resolve(this._getPeopleTrendDataTable(null));
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
                    else {
                        deferred.resolve(this._getPeopleTrendDataTable(placeOfficialName));
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


        /*
         *
         */
        getPointmapActivityMarkers(refresh: boolean): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();
            if (refresh) {
                this.hidePointmapActivityMarkers();
                this.pointmapActivityMarkers = null;
            }
            if (this.pointmapActivityMarkers == null) {
                this.activitySearch()
                    .done((results: any): void => {
                        deferred.resolve(this._getPointmapActivityMarkers(results));
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
            }
            else {
                deferred.resolve(this.pointmapActivityMarkers);
            }
            return deferred;
        }

        private _getPointmapActivityMarkers(activityResults: any): any {
            var markers = new Array();
            var placeResults = activityResults.placeResults;
            if ((placeResults != null) && (placeResults.length > 0)) {
                for (var i = 0; i < placeResults.length; i += 1) {
                    if (placeResults[i].results.length > 0) {
                        var iconURL = "/api/graphics/circle" +
                            "?side=18&opacity=" +
                            "&strokeColor=" + $("#mapMarkerColor").css("background-color") +
                            "&fillColor=" + $("#mapMarkerColor").css("background-color") +
                            "&textColor=" + $("#mapMarkerColor").css("color") +
                            "&text=" + placeResults[i].results.length.toString();
                        //var marker = new MarkerWithLabel({
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(placeResults[i].lat, placeResults[i].lng),
                            map: null,
                            title: placeResults[i].officialName,
                            icon: iconURL
                            //icon: {
                            //    path: google.maps.SymbolPath.CIRCLE,
                            //    fillOpacity: 1.0,
                            //    fillColor: 'green',
                            //    strokeOpacity: 1.0,
                            //    strokeColor: 'green',
                            //    strokeWeight: 1.0,
                            //    scale: 9 //pixels
                            //},
                            //icon: "/api/graphics/circle?side=18&opacity=&color=" + $("#mapMarkerColor").css("background-color"),
                            //labelContent: placeResults[i].results.length.toString(),
                            //labelAnchor: new google.maps.Point(5, 5),
                            //labelAnchor: new google.maps.Point(18, 12),
                            //labelClass: "googleMarkerLabel",
                            //labelInBackground: false
                        });

                        markers.push(marker);
                    }
                }
            }
            this.pointmapActivityMarkers = markers;

            return this.pointmapActivityMarkers;
        }

        showPointmapActivityMarkers(): void {
            if (this.pointmapActivityMarkers != null) {
                for (var i = 0; i < this.pointmapActivityMarkers.length; i += 1) {
                    this.pointmapActivityMarkers[i].setMap(this.pointmap);
                }
            }
        }

        hidePointmapActivityMarkers(): void {
            if (this.pointmapActivityMarkers != null) {
                for (var i = 0; i < this.pointmapActivityMarkers.length; i += 1) {
                    this.pointmapActivityMarkers[i].setMap(null);
                }
            }
        }

        /*
         *
         */
        getPointmapPeopleMarkers(refresh: boolean): JQueryPromise<any> {
            var deferred: JQueryDeferred<void> = $.Deferred();
            if (refresh) {
                this.hidePointmapPeopleMarkers();
                this.pointmapPeopleMarkers = null;
            }
            if (this.pointmapPeopleMarkers == null) {
                this.getGlobalPeopleCounts()
                    .done((counts: any): void => {
                        deferred.resolve(this._getPointmapPeopleMarkers());
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
            }
            else {
                deferred.resolve(this._getPointmapPeopleMarkers());
            }
            return deferred;
        }

        private _getPointmapPeopleMarkers(): any {
            if (this.pointmapPeopleMarkers == null) {
                var markers = new Array();
                var placeCounts = (<any>this.globalPeopleCountData).placeCounts;
                if ((placeCounts != null) && (placeCounts.length > 0)) {
                    for (var i = 0; i < placeCounts.length; i += 1) {
                        if (placeCounts[i].count > 0) {
                            var iconURL = "/api/graphics/circle" +
                                "?side=18&opacity=" +
                                "&strokeColor=" + $("#mapMarkerColor").css("background-color") +
                                "&fillColor=" + $("#mapMarkerColor").css("background-color") +
                                "&textColor=" + $("#mapMarkerColor").css("color") +
                                "&text=" + placeCounts[i].results.length.toString();
                            //var marker = new MarkerWithLabel({
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(placeCounts[i].lat, placeCounts[i].lng),
                                map: null,
                                title: placeCounts[i].officialName,
                                icon: iconURL
                                //icon: {
                                //    path: google.maps.SymbolPath.CIRCLE,
                                //    fillOpacity: 0.75,
                                //    fillColor: 'ff0000',
                                //    strokeOpacity: 1.0,
                                //    strokeColor: 'fff000',
                                //    strokeWeight: 1.0,
                                //    scale: 9 //pixels
                                //},
                                //icon: "/api/graphics/circle?side=18&opacity=&color=" + $("mapMarkerColor").css("background-color"),
                                //labelContent: placeCounts[i].count.toString(),
                                //labelAnchor: new google.maps.Point(5, 5),
                                //labelAnchor: new google.maps.Point(9, 9),
                                //labelClass: "googleMarkerLabel",
                                //labelInBackground: false
                            });
                            markers.push(marker);
                        }
                    }
                }
                this.pointmapPeopleMarkers = markers;
            }
            return this.pointmapPeopleMarkers;
        }

        showPointmapPeopleMarkers(): void {
            if (this.pointmapPeopleMarkers != null) {
                for (var i = 0; i < this.pointmapPeopleMarkers.length; i += 1) {
                    this.pointmapPeopleMarkers[i].setMap(this.pointmap);
                }
            }
        }

        hidePointmapPeopleMarkers(): void {
            if (this.pointmapPeopleMarkers != null) {
                for (var i = 0; i < this.pointmapPeopleMarkers.length; i += 1) {
                    this.pointmapPeopleMarkers[i].setMap(null);
                }
            }
        }

        makeActivityTooltip(name: string, count: number): string {
            return "<b>" + name + "</b><br/>Total Activities: " + count.toString();
        }

        makePeopleTooltip(name: string, count: number): string {
            return "<b>" + name + "</b><br/>Total People: " + count.toString();
        }

        updateCustomGeochartPlaceTooltips(selector: string): any {
            var id: string = "";
            var name: string = "";
            var count: number = 0;

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
                else {
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
                        //this.activityTypes()[i].checked = ko.computed(this.defHasActivityTypeCallback(i));
                        //this.activityTypes()[i].checked(true);
                        this.activityTypes()[i].checked = ko.observable(true);
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
                this.drawPointmap(true);
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

            //$('#resultstableText').css("font-weight", "normal");
            //this.isTableVisible(false);

            $("#bib-faculty-staff-summary").removeClass("current");
            $("#bib-faculty-staff-search").removeClass("current");
            $("#bib-faculty-staff-expert").removeClass("current");

            if (type === "heatmap") {
                $('#heatmapText').css("font-weight", "bold");
                this.isHeatmapVisible(true);

                if (this.searchType() === 'activities') {
                    $('#activitiesButton').css("font-weight", "bold");
                    $('#peopleButton').css("font-weight", "normal");
                } else {
                    $('#activitiesButton').css("font-weight", "normal");
                    $('#peopleButton').css("font-weight", "bold");
                }

                if (this.heatmap == null) {
                    this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
                    this.google.visualization.events.addListener(this.heatmap, 'select', (): void => { this.heatmapSelectHandler(); });
                }

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

                if (this.pointmap == null) {
                    var pointmapElement = $('#pointmap')[0];
                    this.pointmap = new this.google.maps.Map(pointmapElement, this.pointmapOptions);
                }

                this.drawPointmap(false);

                $("#bib-faculty-staff-search").addClass("current");
            //} else if (type === "resultstable") {
            //    $('#resultstableText').css("font-weight", "bold");
            //    this.isTableVisible(true);
            //    $("#bib-faculty-staff-search").addClass("current");
            } else if (type === "expert") {
                $('#expertText').css("font-weight", "bold");
                this.isExpertVisible(true);
                $('#expert').css("display", "inline-block");
                $("#bib-faculty-staff-expert").addClass("current");
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

        heatmapSelectHandler(): void {
            var selection = this.heatmap.getSelection();

            if ((selection != null) && (selection.length > 0)) {
                var officialName: string = '';
                var countryCode: string = null;

                if (this.searchType() === 'activities') {
                    officialName = this.heatmapActivityDataTable.getFormattedValue(selection[0].row, 0);

                    var i: number = 0;
                    while ((i < this.globalActivityCountData.placeCounts.length) && (countryCode == null)) {
                        if (this.globalActivityCountData.placeCounts[i].officialName === officialName) {
                            countryCode = this.globalActivityCountData.placeCounts[i].countryCode;
                        }

                        i += 1;
                    }
                } else {
                    officialName = this.heatmapPeopleDataTable.getFormattedValue(selection[0].row, 0);

                    var i: number = 0;
                    while ((i < this.globalPeopleCountData.placeCounts.length) && (countryCode == null)) {
                        if (this.globalPeopleCountData.placeCounts[i].officialName === officialName) {
                            countryCode = this.globalPeopleCountData.placeCounts[i].countryCode;
                        }

                        i += 1;
                    }
                }

                this.selectedPlace(officialName);
                this.mapRegion((countryCode != null) ? countryCode : 'world')
            }
        }

        expertClickHandler(item: any, event: any): void {
            this.selectMap('expert');
        }

        globalViewClickHandler(item: any, event: any): void {
            this.selectedPlace(null);
            this.mapRegion('world');
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

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        activitySearch(): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();

            var locationIds = new Array();
            for (var i = 0; i < this.locations().length; i += 1) {
                locationIds.push(this.locations()[i].placeId());
            }

            var activityTypeIds = new Array();
            for (var i = 0; i < this.activityTypes().length; i += 1) {
                if (this.activityTypes()[i].checked()) {
                    activityTypeIds.push(this.activityTypes()[i].id());
                }
            }

            var degrees: string[] = null;
            if ((this.degrees() != null)
                && (this.degrees().length > 0)) {
                degrees = this.degrees().split(',');
            }

            var tags: string[] = null;
            if ((this.tags() != null)
                && (this.tags().length > 0)) {
                tags = this.tags().split(',');
            }

            var fromDate = null;
            if (this.fromDate() != null) {
                fromDate = this.fromDate().toString();
            }
            
            var toDate = null;
            if (this.toDate() != null) {
                toDate = this.toDate().toString();
            }

            var dataItem = $("#" + this.campusDropListId).data("kendoDropDownList").dataItem();
            var campusId = ((dataItem != null) && (dataItem.id != 0)) ? dataItem.id : null;
            dataItem = $("#" + this.collegeDropListId).data("kendoDropDownList").dataItem();
            var collegeId = ((dataItem != null) && (dataItem.id != 0)) ? dataItem.id : null;
            dataItem = $("#" + this.departmentDropListId).data("kendoDropDownList").dataItem();
            var departmentId = ((dataItem != null) && (dataItem.id != 0)) ? dataItem.id : null;

            var filterOptions = {
                establishmentId: this.establishmentId(),    //public int EstablishmentId
                filterType: this.searchType(),              //public string FilterType
                locationIds: locationIds,                   //public int[]LocationIds
                activityTypes: activityTypeIds,             //public int[]ActivityTypes
                degrees: degrees,                           //public string Degrees ( people only )
                tags: tags,                                 //public string[] Tags
                fromDate: fromDate,                         //public DateTime? FromDate
                toDate: toDate,                             //public DateTime? ToDate
                noUndated: !this.includeUndated(),         //public bool noUndated
                campusId: campusId,                         //public int? CampusId
                collegeId: collegeId,                       //public int? CollegeId
                departmentId: departmentId                  //public int? DepartmentId
            };

            $.ajax({
                type: "POST",
                data: ko.toJSON(filterOptions),
                contentType: 'application/json',
                dataType: 'json',
                url: App.Routes.WebApi.FacultyStaff.postSearch(),
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void =>
                {
                    ko.mapping.fromJS(data, {}, this.activityResults);
                    deferred.resolve(data);
                },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    deferred.reject(errorThrown);
                }
            });

            return deferred;
        }

        selectLens(lens: string): void {
            if (lens === 'map') {
                this.lens('map');
            } else {
                this.lens('table');
            }
        }

        getActivityTypeIconName(typeId: number): string {
            var i: number = 0;
            while ((i < this.activityTypes().length) && (this.activityTypes()[i].id() != typeId)) {
                i += 1;
            }
            return (i < this.activityTypes().length) ? this.activityTypes()[i].iconName() : null;
        }

        getActivityTypeToolTip(typeId: number): string {
            var i: number = 0;
            while ((i < this.activityTypes().length) && (this.activityTypes()[i].id() != typeId)) {
                i += 1;
            }
            return (i < this.activityTypes().length) ? this.activityTypes()[i].type() : null;
        }

        drawPointmap(updateMarkers: boolean): void {
            this.loadSpinner.start();
            if (this.searchType() === 'activities') {
                this.getPointmapActivityMarkers(updateMarkers)
                    .done((): void => {
                        this.hidePointmapPeopleMarkers();
                        this.showPointmapActivityMarkers();
                    })
                    .always((): void => {
                        this.loadSpinner.stop();
                    });
            } else {
                this.getPointmapPeopleMarkers(updateMarkers)
                    .done((): void => {
                        this.hidePointmapActivityMarkers();
                        this.showPointmapPeopleMarkers();
                    })
                    .always((): void => {
                        this.loadSpinner.stop();
                    });
            }
        }
        
    }
}
