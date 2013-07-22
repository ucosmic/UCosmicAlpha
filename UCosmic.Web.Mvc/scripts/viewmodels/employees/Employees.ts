/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../oss/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../kendo/kendo.all.d.ts" />
/// <reference path="../activities/ServiceApiModel.d.ts" />



module ViewModels.Employees {
    // ================================================================================
    /* 
    */
    // ================================================================================
    export class FacultyAndStaff {
        /* Initialization errors. */
        inititializationErrors: string = "";

        /* True if any field changes. */
        ///dirtyFlag: KnockoutObservableBool = ko.observable(false);

        /* Element id of institution autocomplete */
        institutionSelectorId: string;
        institutionId: KnockoutObservableAny;
        institutionOfficialName: KnockoutObservableString;
        institutionCountryOfficialName: KnockoutObservableString;

        defaultEstablishmentHasCampuses: KnockoutObservableBool;

        tenantInstitutionId: KnockoutObservableNumber;

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray;

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

        years: number[];

        isHeatmapVisible: KnockoutObservableBool;
        isPointmapVisible: KnockoutObservableBool;
        isTableVisible: KnockoutObservableBool;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize(model: any): void {
            this.initialLocations = new any[];        // Bug - To overcome bug in Multiselect.
            this.selectedLocationValues = new any[];
            this.fromDate = ko.observable();
            this.toDate = ko.observable();
            this.institutionId = ko.observable(null);
            this.institutionOfficialName = ko.observable(null);
            this.institutionCountryOfficialName = ko.observable(null);
            this.defaultEstablishmentHasCampuses = ko.observable(true);
            this.activityTypes = ko.observableArray();
            this.isHeatmapVisible = ko.observable(false);
            this.isPointmapVisible = ko.observable(true);
            this.isTableVisible = ko.observable(false);

            this.tenantInstitutionId = ko.observable(model.institutionId);

            var fromToYearRange: number = 80;
            var thisYear: number = Number(moment().format('YYYY'));
            this.years = new Array();
            for (var i: number = 0; i < fromToYearRange; i += 1) {
                this.years[i] = thisYear - i;
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor(model: any) {
            this._initialize(model);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------   
        setupWidgets(locationSelectorId: string,
                fromDatePickerId: string,
                toDatePickerId: string,
                institutionSelectorId: string,
                campuseDropListId: string,
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

            if (!this.defaultEstablishmentHasCampuses()) {
                collegeDropListDataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: App.Routes.WebApi.Establishments.getChildren(this.tenantInstitutionId(), true)
                        }
                    }
                });
            }

            $("#" + collegeDropListId).kendoDropDownList({
                dataTextField: "officialName",
                dataValueField: "id",
                dataSource: collegeDropListDataSource,
                change: function (e) {
                    var selectedIndex = e.sender.selectedIndex;
                    if (selectedIndex != -1) {
                        var item = this.dataItem(selectedIndex);
                        if (item != null) {
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
                        if (item != null) {
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

            if (this.defaultEstablishmentHasCampuses()) {
                $("#" + campuseDropListId).kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.Establishments.getChildren(this.tenantInstitutionId(), false)
                            }
                        }
                    }),
                    change: function (e) {
                        var selectedIndex = e.sender.selectedIndex;
                        if ((selectedIndex != null) && (selectedIndex != -1)) {
                            var item = this.dataItem(selectedIndex);
                            if (item != null) {
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
                            if (item != null) {
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
            this.locations.removeAll();
            for (var i = 0; i < items.length; i += 1) {
                var location = ko.mapping.fromJS({ id: 0, placeId: items[i].id, version: "" });
                this.locations.push(location);
            }
            //this.dirtyFlag(true);
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

            if (type === "heatmap") {
                $('#heatmapText').css("font-weight", "bold");
                this.isHeatmapVisible(true);
            } else if (type === "pointmap") {
                $('#pointmapText').css("font-weight", "bold");
                this.isPointmapVisible(true);
            } else if (type === "resultstable") {
                $('#resultstableText').css("font-weight", "bold");
                this.isTableVisible(true);
            }
        }
    }
}
