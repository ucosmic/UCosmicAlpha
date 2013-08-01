/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendo.all.d.ts" />
/// <reference path="../../oss/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../kendo/kendo.all.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
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
        ///dirtyFlag: KnockoutObservableBool = ko.observable(false);

        searchType: KnockoutObservableString;

        /* Element id of institution autocomplete */
        institutionSelectorId: string;
        institutionId: KnockoutObservableAny;
        institutionOfficialName: KnockoutObservableString;
        institutionCountryOfficialName: KnockoutObservableString;

        institutionHasCampuses: KnockoutObservableBool;

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray;
        selectedActivityIds: KnockoutObservableArray;

        /* Locations for multiselect. */
        locationSelectorId: string;
        initialLocations: any[];        // Bug - To overcome bug in Multiselect.
        selectedLocationValues: any[];

        fromDate: KnockoutObservableDate;
        toDate: KnockoutObservableDate;
        institutions: KnockoutObservableString;
        locations: KnockoutObservableArray;

        errors: KnockoutValidationErrors;
        isValid: () => bool;
        isAnyMessageShown: () => bool;

        isHeatmapVisible: KnockoutObservableBool;
        isPointmapVisible: KnockoutObservableBool;
        isTableVisible: KnockoutObservableBool;

        heatmap: any;
        heatmapOptions: any;
        heatmapData: any;

        pointmap: google.maps.Map;
        pointmapOptions: any;
        pointmapData: any;
        
        //resultsTable: any;
        //resultsTableOptions: any;
        //resultsTableData: any;

        //piechart: any;
        //piechartOptions: any;
        //piechartData: any;

        selectedCountry: KnockoutObservableString;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize(institutionInfo: any): void {
            this.sammy = Sammy();
            this.initialLocations = new any[];        // Bug - To overcome bug in Multiselect.
            this.selectedLocationValues = new any[];
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
            this.selectedCountry = ko.observable();

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
                                url: App.Routes.WebApi.Establishments.getUniversities(),
                                dataType: 'json',
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
                            url: App.Routes.WebApi.Establishments.getChildren(this.institutionId(), true)
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
                                        url: App.Routes.WebApi.Establishments.getChildren(item.id, true)
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

            if (this.institutionHasCampuses()) {
                $("#" + campusDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    optionLabel: { officialName: "ALL", id: 0 },
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.Establishments.getChildren(this.institutionId(), true)
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
                                            url: App.Routes.WebApi.Establishments.getChildren(item.id, true)
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
                                                url: App.Routes.WebApi.Establishments.getChildren(campusId, true)
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
            //    validator: (val: any, otherVal: any): bool => {
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
            this.sammy.get('#/engagements', ():void => { this.selectMap('heatmap'); });
            this.sammy.get('#/map', (): void => { this.selectMap('pointmap'); });
            this.sammy.get('#/results', (): void => { this.selectMap('resultstable'); });
            this.sammy.run('#/engagements');
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

            /* ----- Setup Heatmap (chart) ----- */

            var countryData = new Array();
            countryData.push(['Country', 'Activities']);

            $.ajax({
                type: "GET",
                async: false,
                url: App.Routes.WebApi.Activities.CountryCounts.post(),
                success: function (data, textStatus, jqXHR) {
                    for (var i = 0; i < data.length; i += 1) {
                        countryData.push([data[i].officialName, data[i].count]);
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    //debugger;
                },
                dataType: 'json'
            });

            $.ajax({
                type: "POST",
                async: false,
                url: App.Routes.WebApi.Activities.CountryCounts.post(),
                data: ko.toJSON(this.selectedActivityIds()),
                success: function (data, textStatus, jqXHR) {
                    for (var i = 0; i < data.length; i += 1) {
                        countryData.push([data[i].officialName, data[i].count]);
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    //debugger;
                },
                dataType: 'json'
            });

            this.heatmapData = this.google.visualization.arrayToDataTable(countryData);

            this.heatmapOptions = {
                //is3D: true,
                width: 680,
                height: 500,
                //magnifyingGlass: { enable: true, zoomFactor: 7.5 },
                region: 'world', //'150',    // 002 Africa, 142 Asia
                backgroundColor: 'lightBlue',
                keepAspectRatio: false,
                colorAxis: { colors: ['#FFFFFF', 'green'] }
                //displayMode: 'markers'
            };

            this.heatmap = new this.google.visualization.GeoChart($('#heatmap')[0]);
            this.google.visualization.events.addListener(this.heatmap, 'select', function () { me.heatmapSelectHandler(); });


            /* ----- Setup Piechart ----- */

            //this.piechartData = this.google.visualization.DataTable();
            //this.piechartData.addColumn('string', 'Engagement');
            //this.piechartData.addColumn('number', 'Count');
            //this.piechartData.addRows([[<any>'Research or Creative Endeavor', <any>11],
            //    [<any>'Teaching or Mentoring', <any>2],
            //    [<any>'Award or Honor', <any>2],
            //    [<any>'Conference Presentation or Proceeding', <any>2],
            //    [<any>'Professional Development, Service or Consulting ', <any>7]]);


            //this.piechartData = this.google.visualization.arrayToDataTable([
            //    [<any>'Research or Creative Endeavor', <any>11],
            //    [<any>'Teaching or Mentoring', <any>2],
            //    [<any>'Award or Honor', <any>2],
            //    [<any>'Conference Presentation or Proceeding', <any>2],
            //    [<any>'Professional Development, Service or Consulting ', <any>7]]);

            //this.piechartOptions = {
            //    title: 'Engagements'
            //};


            //this.piechart = new this.google.visualization.PieChart($('#typeChart')[0]);
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var me = this;
            var deferred: JQueryDeferred = $.Deferred();

            var typesPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                          .done((data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                              typesPact.resolve(data);
                          })
                          .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                              typesPact.reject(jqXHR, textStatus, errorThrown);
                          });
            
            
            //var dataPact = $.Deferred();

            //$.ajax({
            //    type: "GET",
            //    url: App.Routes.WebApi.InternationalAffiliations.get(this.id()),
            //    success: function (data: any, textStatus: string, jqXhr: JQueryXHR): void
            //    { dataPact.resolve(data); },
            //    error: function (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void
            //    { dataPact.reject(jqXhr, textStatus, errorThrown); },
            //});

            // only process after all requests have been resolved
            $.when(typesPact)
                            .done((types: Service.ApiModels.IEmployeeActivityType[], ): void => {

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
        updateLocations(items: Array): void {
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
                this.heatmap.draw(this.heatmapData, this.heatmapOptions);
                //this.piechart.draw(this.piechartData, this.piechartOptions);
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
                var newActivityType: KnockoutObservableAny = ko.mapping.fromJS({ id: 0, typeId: activityTypeId, version: "" });
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
        hasActivityType(activityTypeId: number): bool {
            return this.getActivityTypeIndexById(activityTypeId) != -1;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        defHasActivityTypeCallback(activityTypeIndex: number): KnockoutComputedDefine {
            var def: KnockoutComputedDefine = {
                read: (): bool => {
                    return this.hasActivityType(this.activityTypes()[activityTypeIndex].id());
                },
                write: function (checked) => {
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
        heatmapSelectHandler() {
            var selection = this.heatmap.getSelection();
            var str = this.heatmapData.getFormattedValue(selection[0].row, 0);
            this.selectedCountry(str);
        }

    }
}
