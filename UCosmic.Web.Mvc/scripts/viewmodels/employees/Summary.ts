module Employees.ViewModels {

    export interface SummarySettings {
        tenantId: number;
        tenantDomain: string;
        element: Element;
        geoChart: SummaryGeoChartSettings;
        activityTypesChart: SummaryActivityTypeChartSettings;
        activityYearsChart: SummaryActivityYearChartSettings;
    }

    export interface SummaryGeoChartSettings {
        boxElementId: string;
        googleElementId: string;
        keepAspectRatio?: boolean;
    }

    export interface SummaryActivityTypeChartSettings {
        boxElementId: string;
        googleElementId: string;
    }

    export interface SummaryActivityYearChartSettings {
        boxElementId: string;
        googleElementId: string;
    }

    export interface SummaryGeoChartPlaceOverlay {
        placeId: number;
        title: string;
        className: string;
        total: KnockoutObservable<number>;
        imageSwapper: App.ImageSwapper;
    }

    export class SummaryRouteState {
        pivot: DataGraphPivot; // enum during build, int at runtime
        placeId: number;
        establishmentId: number;

        static areEqual(first: SummaryRouteState, second: SummaryRouteState): boolean {
            if (!first && !second) return true;
            if (!first && second) return false;
            if (first && !second) return false;
            var areEqual = true;
            if (first.pivot != second.pivot) areEqual = false;
            if (first.placeId != second.placeId) areEqual = false;
            if (first.establishmentId != second.establishmentId) areEqual = false;
            return areEqual;
        }

        static isEmpty(state: SummaryRouteState): boolean {
            if (!state) return true;
            return !state.pivot && !state.placeId && !state.establishmentId;
        }

        static isIncomplete(state: SummaryRouteState): boolean {
            if (!state) return true;
            return !state.pivot || !state.placeId || !state.establishmentId;
        }
    }

    export enum DataGraphPivot {
        unknown = 0,
        activities = 1,
        people = 2,
        degress = 3,
    }

    export class Summary {
        //#region Static Google Visualization Library Loading

        private static _googleVisualizationLoadedPromise = $.Deferred();

        static loadGoogleVisualization(): JQueryPromise<void> {
            // this is necessary to load all of the google visualization API's used by this
            // viewmodel. additionally, https://www.google.com/jsapi script must be present
            google.load('visualization', '1', { 'packages': ['corechart', 'geochart'] });

            google.setOnLoadCallback((): void => { // when the packages are loaded
                Summary._googleVisualizationLoadedPromise.resolve();
            });
            return Summary._googleVisualizationLoadedPromise;
        }

        //#endregion
        //#region Construction & Binding

        constructor(public settings: SummarySettings) {
            // parse the place overlays
            this._parsePlaceOverlays();

            // bind history.js to statechange events
            HistoryJS.Adapter.bind(window, 'statechange', (): void => { this._onRouteChanged(); });

            // initialize charts
            this._initGeoChart();
            this._initActivityTypeChart();
            this._initActivityYearChart();
        }

        private _bindingsApplied: JQueryDeferred<void> = $.Deferred();
        bindingsApplied: JQueryPromise<void> = this._bindingsApplied;
        areBindingsApplied = ko.observable<boolean>(false);

        applyBindings(): void {
            // did we get an element or an element id?
            var element = this.settings.element;
            if (element) {
                ko.applyBindings(this, element);
            }
            this.areBindingsApplied(true);
            this._bindingsApplied.resolve();
        }

        //#endregion
        //#region UI Observables
        //#region Pivot

        private static _pivotDefault = DataGraphPivot.activities;
        private static _pivotKey = 'EmployeeSummaryPivot';
        pivot = ko.observable<DataGraphPivot>(
            parseInt(sessionStorage.getItem(Summary._pivotKey)) || Summary._pivotDefault);

        private _pivotChanged = ko.computed((): void => { this._onPivotChanged(); });
        private _onPivotChanged(): void {
            // compare value with what is stored in the session
            var value = <number>this.pivot();
            var old = parseInt(sessionStorage.getItem(Summary._pivotKey)) || 0;

            // don't do anything unless the value has changed
            if (value !== old) {
                // save the new value to session storage
                sessionStorage.setItem(Summary._pivotKey, value.toString());
            }
        }

        pivotPeople(): void {
            this.pivot(DataGraphPivot.people);
        }

        pivotActivities(): void {
            this.pivot(DataGraphPivot.activities);
        }

        isPivot(pivot: DataGraphPivot): boolean {
            return this.pivot() == pivot;
        }

        isPivotPeople = ko.computed((): boolean => {
            return this.pivot() == DataGraphPivot.people;
        });

        isPivotActivities = ko.computed((): boolean => {
            return this.pivot() == DataGraphPivot.activities;
        });

        //#endregion
        //#region PlaceId

        private static _placeIdDefault = 1;
        private static _placeIdKey = 'EmployeeSummaryPlaceId';
        placeId = ko.observable<number>(
            parseInt(sessionStorage.getItem(Summary._placeIdKey)) || Summary._placeIdDefault);

        private _placeIdChanged = ko.computed((): void => { this._onPlaceIdChanged(); });
        private _onPlaceIdChanged(): void {
            // compare value with what is stored in the session
            var value = <number>this.placeId();
            var old = parseInt(sessionStorage.getItem(Summary._placeIdKey)) || undefined;

            // don't do anything unless the value has changed
            if (value !== old) {
                // save the new value to session storage
                sessionStorage.setItem(Summary._placeIdKey, value.toString());
            }
        }

        hasPlaceId = ko.computed((): boolean => {
            var placeId = this.placeId();
            return (placeId && placeId > 1);
        });
        hasNoPlaceId = ko.computed((): boolean => {
            return !this.hasPlaceId();
        });

        //#endregion
        //#region Tenancy

        private static _establishmentIdKey = 'EmployeeSummaryEstablishmentId';
        establishmentId = ko.observable<number>(
            parseInt(sessionStorage.getItem(Summary._establishmentIdKey)) || this.settings.tenantId);

        private _establishmentIdChanged = ko.computed((): void => { this._onEstablishmentIdChanged(); });
        private _onEstablishmentIdChanged(): void {
            // compare value with what is stored in the session
            var value = <number>this.establishmentId();
            var old = parseInt(sessionStorage.getItem(Summary._establishmentIdKey)) || undefined;

            // don't do anything unless the value has changed
            if (value !== old) {
                // save the new value to session storage
                sessionStorage.setItem(Summary._establishmentIdKey, value.toString());
            }
        }

        hasEstablishmentId = ko.computed((): boolean => {
            var establishmentId = this.establishmentId();
            return (establishmentId && establishmentId > 0);
        });
        hasNoEstablishmentId = ko.computed((): boolean => {
            return !this.hasEstablishmentId();
        });

        //#endregion
        //#endregion
        //#region Routing

        private _getUrlState(): SummaryRouteState {
            var params = location.search.indexOf('?') == 0
                ? location.search.substr(1) : location.search;
            if (!Summary._isD3Defined()) {
                params = location.hash.indexOf('#?') == 0 ? location.hash.substr(2) : '';
            }
            var state: SummaryRouteState = App.deparam(params, true);
            return state;
        }

        routeState = ko.computed((): SummaryRouteState => {
            return {
                pivot: this.pivot(),
                placeId: this.placeId(),
                establishmentId: this.establishmentId(),
            };
        });

        private _routeStateChanged = ko.computed((): void => {
            this._onRouteStateChanged();
        }).extend({ throttle: 1 });

        private _onRouteStateChanged(): void {

            var routeState = this.routeState(); // the new state we want in the URL
            var urlState = this._getUrlState(); // actual state based on current URL

            // we need to make sure the establishmentId is applicable before applying route state
            var areBindingsApplied = this.areBindingsApplied();
            if (!areBindingsApplied) return;
            this.tenancyData.ready()
                .done((establishments: Establishments.ApiModels.ScalarEstablishment[]): void => {

                    routeState = this.routeState(); // the new state we want in the URL
                    urlState = this._getUrlState(); // actual state based on current URL

                    // this runs whenever an observable component of routeState changes
                    // and will run at least once when the page loads, since it is a computed
                    // there are 4 main scenarios we want to handle here:
                    // 1.) when the route state matches the url state, update the historyjs state
                    // 2.) when we have incomplete url state, replace current url based on route state
                    // 3.) when historyjs state is empty and url state is complete, we have a url
                    //     that should override the current route state values
                    // 4.) all other cases mean user interaction, and should push a new url
                    ///var areBindingsApplied = this.areBindingsApplied();

                    // when the url state is missing something (or everything), replace it with route data
                    if (SummaryRouteState.isIncomplete(urlState) || SummaryRouteState.areEqual(routeState, urlState)) {
                        HistoryJS.replaceState(routeState, '', '?' + $.param(routeState));
                    }

                    // by now url state is not equal but is not incomplete either
                    // since we have it, update the route values with the url values
                    else {
                        HistoryJS.pushState(routeState, '', '?' + $.param(routeState));
                    }
                });
        }

        private _onRouteChanged(): void {
            // this runs whenever historyjs detects a statechange event
            var urlState = this._getUrlState(); // actual state based on current URL
            this._updateState(urlState);
            this._applyState();
        }

        private _updateState(state: SummaryRouteState): void {
            this.pivot(state.pivot);
            this.placeId(state.placeId);
            this.selectedTenant(state.establishmentId);
            this.establishmentId(state.establishmentId);
        }

        private _applyState(): void {
            this.activityCountsData.ready();
            this._drawGeoChart();
            this._drawActivityTypeChart();
            this._drawActivityYearChart();
        }

        //#endregion
        //#region Pivot Data
        //#region Places

        hasPlaceData = ko.observable<boolean>(false);

        placeData: App.DataCacher<ApiModels.EmployeesPlaceApiModel[]> = new App.DataCacher(
            (): JQueryPromise<ApiModels.EmployeesPlaceApiModel[]> => {
                return this._loadPlaceData();
            });

        private _loadPlaceData(): JQueryPromise<ApiModels.EmployeesPlaceApiModel[]> {
            // calling .ready() on placeData invokes this
            var promise: JQueryDeferred<ApiModels.EmployeesPlaceApiModel[]> = $.Deferred();
            var request: ApiModels.EmployeesPlacesInputModel = {
                countries: true,
                placeIds: this._getOverlayPlaceIds(),
                placeAgnostic: true,
            };
            this.geoChartSpinner.start();
            var establishmentId = this.selectedTenant() ? this.selectedTenant() : this.establishmentId();
            Servers.GetEmployeesPlaces(establishmentId, request)
                .done((places: ApiModels.EmployeesPlaceApiModel[]): void => {
                    this.hasPlaceData(places && places.length > 0);
                    promise.resolve(places);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load employee location summary data.', true);
                    promise.reject();
                })
                .always((): void => {
                    this.geoChartSpinner.stop();
                });
            return promise;
        }

        private _getPlaceById(placeId: number): ApiModels.EmployeesPlaceApiModel {
            var place: ApiModels.EmployeesPlaceApiModel = Enumerable.From(this.placeData.cached)
                .FirstOrDefault(undefined, function (x: ApiModels.EmployeesPlaceApiModel): boolean {
                    return x.placeId == placeId;
                });

            return place;
        }

        private _getPlaceByName(placeName: string): ApiModels.EmployeesPlaceApiModel {
            var place: ApiModels.EmployeesPlaceApiModel = Enumerable.From(this.placeData.cached)
                .FirstOrDefault(undefined, function (x: ApiModels.EmployeesPlaceApiModel): boolean {
                    return x.placeName == placeName;
                });

            return place;
        }

        //#endregion
        //#region Tenancy

        hasTenancyData = ko.observable<boolean>(false);
        selectedTenant = ko.observable<number>(this.settings.tenantId);

        tenancyData: App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]> = new App.DataCacher(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadTenancyData();
            });

        private _selectedTenantChanged = ko.computed((): void => {
            var areBindingsApplied = this.areBindingsApplied();
            var hasTenancyData = this.hasTenancyData();
            var selectedTenant = this.selectedTenant();
            if (this.selectedTenant()) {
                this.settings.tenantId = this.selectedTenant();
            }
            var establishmentId = this.establishmentId();
            if (!areBindingsApplied || !hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                return;

            $.when(this.placeData.reload(), this.activityCountsData.reload()).done((): void => {
                this.establishmentId(selectedTenant);
            });
        });

        tenantOptions = ko.observableArray<App.ApiModels.SelectOption<number>>();

        private _loadTenancyData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            // calling .ready() on tenancyData invokes this
            var deferred: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            $.when(Establishments.Servers.Single(this.settings.tenantId), Establishments.Servers.GetChildren(this.settings.tenantId))
                .done((parentData: Establishments.ApiModels.ScalarEstablishment, childData: Establishments.ApiModels.ScalarEstablishment[]): void => {
                    childData = childData || [];
                    var tenants = Enumerable.From(childData)
                        .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                            return x.rank;
                        }).ToArray();
                    tenants.unshift(parentData);

                    this.tenantOptions([]);
                    if (childData.length) {
                        var options = Enumerable.From(tenants)
                            .Select(function (x: Establishments.ApiModels.ScalarEstablishment): App.ApiModels.SelectOption<number> {
                                var option: App.ApiModels.SelectOption<number> = {
                                    value: x.id,
                                    text: x.contextName || x.officialName,
                                };
                                return option;
                            }).ToArray();
                        this.tenantOptions(options);
                    }

                    deferred.resolve(tenants);
                    if (childData.length) this.hasTenancyData(true);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    deferred.reject();
                })
            return deferred.promise();
        }

        //#endregion
        //#endregion
        //#region Summaries
        //#region Top Summary
        activityTotals: KoModels.EmployeeActivityCounts = {
            personCount: ko.observable('?'),
            activityCount: ko.observable('?'),
            locationCount: ko.observable('?'),
        };
        activityCountsData: App.DataCacher<ApiModels.EmployeeActivityCounts> = new App.DataCacher(
            (): JQueryPromise<ApiModels.EmployeeActivityCounts> => {
                return this._loadActivityCounts();
            });

        private _loadActivityCounts(): JQueryPromise<ApiModels.EmployeeActivityCounts> {
            var promise: JQueryDeferred<ApiModels.EmployeeActivityCounts> = $.Deferred();
            Servers.GetActivityCounts(this.selectedTenant())
                .done((summary: ApiModels.EmployeeActivityCounts): void => {
                    ko.mapping.fromJS(summary, {}, this.activityTotals);
                    promise.resolve(summary);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load activity total summary data.', true);
                    promise.reject();
                })
            return promise;
        }

        //#endregion
        //#region Selected Place Summary

        selectedPlaceSummary: KoModels.EmployeeActivityCounts = {
            personCount: ko.observable('?'),
            activityCount: ko.observable('?'),
            locationCount: ko.observable('?'),
        };

        private _placeSelected = ko.computed((): void => { this._onPlaceSelected(); });

        private _onPlaceSelected(): void {
            var placeId = this.placeId();
            var areBindingsApplied = this.areBindingsApplied();
            if (placeId != 1 && areBindingsApplied) {
                $.when(this.placeData.ready()).then((): void => {
                    var place: ApiModels.EmployeesPlaceApiModel = this._getPlaceById(placeId);
                    this.selectedPlaceSummary.personCount(place.activityPersonIds.length.toString());
                    this.selectedPlaceSummary.activityCount(place.activityIds.length.toString());
                    this.selectedPlaceSummary.locationCount(place.placeName);
                });
            }
            else if (areBindingsApplied) {
                this.selectedPlaceSummary.personCount('?');
                this.selectedPlaceSummary.activityCount('?');
                this.selectedPlaceSummary.locationCount('?');
            }
        }

        clearPlaceSelection(): void {
            this.placeId(1);
        }

        //#endregion
        //#endregion
        //#region Google GeoChart

        geoChart: App.Google.GeoChart = new App.Google.GeoChart(
            document.getElementById(this.settings.geoChart.googleElementId));
        geoChartSpinner = new App.Spinner({ delay: 400, runImmediately: true, });
        isGeoChartReady = ko.observable<boolean>(false);
        _geoChartGradientLo: string;
        _geoChartGradientHi: string;
        private _geoChartDataTable: google.visualization.DataTable = this._newGeoChartDataTable();

        private _getGeoChartOptions(overrides?: google.visualization.GeoChartOptions): google.visualization.GeoChartOptions {
            if (!this._geoChartGradientLo)
                this._geoChartGradientLo = $('<div class="charts-color-gradient-lo" />')
                    .hide().appendTo('body').css('color') || '#ccc';
            if (!this._geoChartGradientHi)
                this._geoChartGradientHi = $('<div class="charts-color-gradient-hi" />')
                    .hide().appendTo('body').css('color') || '#333';
            var options: google.visualization.GeoChartOptions = {
                // options passed when drawing geochart
                displayMode: 'regions',
                region: 'world',
                keepAspectRatio: this.settings.geoChart.keepAspectRatio ? true : false,
                height: this.settings.geoChart.keepAspectRatio ? 480 : 500,
                colorAxis: {
                    minValue: 1,
                    colors: [this._geoChartGradientLo, this._geoChartGradientHi, ],
                },
                backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
                //backgroundColor: 'transparent',
            };

            if (overrides && overrides.region)
                options.region = overrides.region;
            if (overrides && (overrides.keepAspectRatio || overrides.keepAspectRatio == false))
                options.keepAspectRatio = overrides.keepAspectRatio;

            return options;
        }

        private _newGeoChartDataTable(): google.visualization.DataTable {
            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Place');
            dataTable.addColumn('number', 'Total');
            return dataTable;
        }

        private _initGeoChart(): JQueryPromise<void> {
            // just draw the geochart to make sure something is displayed
            // need to make sure we wait until it's done though before drying to draw again
            var promise = $.Deferred();

            if (!this.isGeoChartReady()) {
                this.geoChart.draw(this._geoChartDataTable, this._getGeoChartOptions())
                    .then((): void => {
                        // svg injection depends on the chart being ready,
                        // and bindings having been applied, and the
                        // overlays being visible
                        if (!this.isGeoChartReady()) {
                            this.isGeoChartReady(true); // call this before overlaying to ensure positions
                            this.bindingsApplied.done((): void=> {
                                this._svgInjectPlaceOverlays();
                                google.visualization.events.addListener(
                                    this.geoChart.geoChart, 'select',
                                    (): void => { this._onGeoChartSelect(); });
                                google.visualization.events.addListener(this.geoChart.geoChart,
                                    'regionClick',
                                    (e: google.visualization.GeoChartRegionClickEvent): void => {
                                        this._onGeoChartRegionClick(e);
                                    }
                                    );
                            });
                        }
                        promise.resolve();
                    });
            }
            else {
                promise.resolve();
            }
            return promise;
        }

        private _drawGeoChart(): void {
            // the data may not yet be loaded, and if not, going to redraw after it is loaded
            var cachedData = this.placeData.cached;
            var needsRedraw = !cachedData;

            // decide which part of the map to select
            var placeId = this.placeId();
            var place = this._getPlaceById(placeId);
            var optionOverrides = this._getGeoChartOptions();
            optionOverrides.region = !placeId || placeId == 1 || !place || !place.countryCode
            ? 'world' : place.countryCode;

            // change aspect ratio based on placeId
            optionOverrides.keepAspectRatio = placeId && placeId > 1 && place && place.countryCode ? false :
            this.settings.geoChart.keepAspectRatio ? true : false;

            // hit the server up for data and redraw
            this._initGeoChart().then((): void => {
                this.placeData.ready().done((places: ApiModels.EmployeesPlaceApiModel[]): void => {
                    if (needsRedraw) {
                        this._drawGeoChart();
                        return;
                    }
                    var isPivotPeople = this.isPivotPeople();
                    this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(isPivotPeople ? 'People' : 'Activities'));
                    this._geoChartDataTable.removeRows(0, this._geoChartDataTable.getNumberOfRows());
                    $.each(places, (i: number, dataPoint: ApiModels.EmployeesPlaceApiModel): void => {
                        // do not count the agnostic place
                        if (!dataPoint.placeId) return;
                        var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                        this._geoChartDataTable.addRow([dataPoint.placeName, total]);
                    });
                    this.geoChart.draw(this._geoChartDataTable, this._getGeoChartOptions(optionOverrides))
                        .then((): void => {
                            setTimeout((): void => { this._svgInjectPlaceOverlays(); }, 0);
                            this._applyPlaceOverlayTotals(places);
                            this._createOverlayTooltips();
                        });
                });
            });
        }

        private _onGeoChartSelect(): void {
            var selection = this.geoChart.geoChart.getSelection(); // expect single item in array with row index
            if (selection && selection.length) { // just to make sure
                var rowIndex = selection[0].row; // get the row index of corresponding data table item selected
                // first column of the data table has the place name (country name)
                var placeName = this._geoChartDataTable.getFormattedValue(rowIndex, 0);
                var place = this._getPlaceByName(placeName);
                if (place) {
                    this.placeId(place.placeId);
                }
            }
        }

        private _onGeoChartRegionClick(e: google.visualization.GeoChartRegionClickEvent): void {
            // this will fire even when the country clicked has total === zero
        }

        //#endregion
        //#region Activity Type Chart

        activityTypeChart: App.Google.ColumnChart = new App.Google.ColumnChart(
            document.getElementById(this.settings.activityTypesChart.googleElementId));
        isActivityTypeChartReady = ko.observable<boolean>(false);

        _chartDataColor: string;
        private _getChartDataColor(): string {
            if (!this._chartDataColor)
                this._chartDataColor = $('<div class="charts-color-dark" />')
                    .hide().appendTo('body').css('color') || '#333';
            return this._chartDataColor;
        }

        private _activityTypeChartDataTable: google.visualization.DataTable = this._newActivityTypeChartDataTable();

        private _getActivityTypeChartOptions(): google.visualization.ColumnChartOptions {
            var options: google.visualization.ColumnChartOptions = {
                animation: {
                    duration: 250,
                },
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
                        color: this._getChartDataColor(),
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

            return options;
        }

        private _newActivityTypeChartDataTable(): google.visualization.DataTable {
            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Activity Type');
            dataTable.addColumn('number', 'Count');
            dataTable.addColumn({ type: 'number', role: 'annotation' });
            return dataTable;
        }

        private _initActivityTypeChart(): JQueryPromise<void> {
            var promise = $.Deferred();

            if (!this.isActivityTypeChartReady()) {
                this.activityTypeChart.draw(this._activityTypeChartDataTable, this._getActivityTypeChartOptions())
                    .then((): void => {
                        if (!this.isActivityTypeChartReady()) {
                            this.isActivityTypeChartReady(true);
                            this.bindingsApplied.done((): void=> {
                            });
                        }
                        promise.resolve();
                    });
            }
            else {
                promise.resolve();
            }
            return promise;
        }

        private _drawActivityTypeChart(): void {
            // the data may not yet be loaded, and if not, going to redraw after it is loaded
            var cachedData = this.placeData.cached;
            var needsRedraw = !cachedData;

            //// decide which part of the map to select
            var placeId = this.placeId();

            // hit the server up for data and redraw
            this._initActivityTypeChart().then((): void => {
                this.placeData.ready().done((places: ApiModels.EmployeesPlaceApiModel[]): void => {
                    if (needsRedraw) {
                        this._drawActivityTypeChart();
                        return;
                    }
                    var isPivotPeople = this.isPivotPeople();
                    this._activityTypeChartDataTable.removeRows(0, this._activityTypeChartDataTable.getNumberOfRows());
                    var activityTypes = this._getActivityTypes();
                    this.activityTypes(activityTypes);
                    $.each(activityTypes, (i: number, dataPoint: ApiModels.EmployeeActivityTypeCount): void => {
                        var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                        this._activityTypeChartDataTable.addRow([dataPoint.text, total, total]);
                    });
                    var dataView = new google.visualization.DataView(this._activityTypeChartDataTable);
                    dataView.setColumns([0, 1, 1, 2]);
                    this.activityTypeChart.draw(dataView, this._getActivityTypeChartOptions())
                        .then((): void => {
                        });
                });
            });
        }

        activityTypes = ko.observableArray<ApiModels.EmployeeActivityTypeCount>();
        private _getActivityTypes(): ApiModels.EmployeeActivityTypeCount[] {
            var placeId = this.placeId();
            if (placeId == 1) placeId = null;
            var places = this.placeData.cached;
            var activityTypes: ApiModels.EmployeeActivityTypeCount[] = Enumerable.From(places)
                .Where(function (x: ApiModels.EmployeesPlaceApiModel): boolean {
                    if (placeId == null) return !x.placeId;
                    return x.placeId == placeId;
                })
                .SelectMany(function (x: ApiModels.EmployeesPlaceApiModel): ApiModels.EmployeeActivityTypeCount[] {
                    return x.activityTypes;
                })
                .Distinct(function (x: ApiModels.EmployeeActivityTypeCount): number {
                    return x.activityTypeId;
                })
                .OrderBy(function (x: ApiModels.EmployeeActivityTypeCount): number {
                    return x.rank;
                })
                .Select(function (x: ApiModels.EmployeeActivityTypeCount): ApiModels.EmployeeActivityTypeCount {
                    x.iconSrc = Routes.Api.Employees.Settings.ActivityTypes.icon(x.activityTypeId);
                    return x;
                })
                .ToArray();
            return activityTypes;
        }

        //#endregion
        //#region Activity Year Chart

        activityYearChart: App.Google.LineChart = new App.Google.LineChart(
            document.getElementById(this.settings.activityYearsChart.googleElementId));
        isActivityYearChartReady = ko.observable<boolean>(false);
        private _activityYearChartDataTable: google.visualization.DataTable = this._newActivityYearChartDataTable();

        private _getActivityYearChartOptions(): google.visualization.LineChartOptions {
            var options: google.visualization.LineChartOptions = {
                animation: {
                    duration: 250,
                },
                vAxis: {
                    minValue: 0,
                },
                chartArea: {
                    top: 8,
                    left: 0,
                    width: '100%',
                    height: '60%'
                },
                legend: { position: 'none' },
                colors: [this._getChartDataColor()],
            };

            return options;
        }

        private _newActivityYearChartDataTable(): google.visualization.DataTable {
            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Year');
            dataTable.addColumn('number', 'Count');
            return dataTable;
        }

        private _initActivityYearChart(): JQueryPromise<void> {
            var promise = $.Deferred();

            if (!this.isActivityYearChartReady()) {
                this.activityYearChart.draw(this._activityYearChartDataTable, this._getActivityYearChartOptions())
                    .then((): void => {
                        if (!this.isActivityYearChartReady()) {
                            this.isActivityYearChartReady(true);
                            this.bindingsApplied.done((): void=> {
                            });
                        }
                        promise.resolve();
                    });
            }
            else {
                promise.resolve();
            }
            return promise;
        }

        private _drawActivityYearChart(): void {
            // the data may not yet be loaded, and if not, going to redraw after it is loaded
            var cachedData = this.placeData.cached;
            var needsRedraw = !cachedData;

            //// decide which part of the map to select
            var placeId = this.placeId();

            // hit the server up for data and redraw
            this._initActivityYearChart().then((): void => {
                this.placeData.ready().done((places: ApiModels.EmployeesPlaceApiModel[]): void => {
                    if (needsRedraw) {
                        this._drawActivityYearChart();
                        return;
                    }
                    var isPivotPeople = this.isPivotPeople();
                    this._activityYearChartDataTable.removeRows(0, this._activityYearChartDataTable.getNumberOfRows());
                    var activityYears = this._getActivityYears();
                    this.activityYears(activityYears);
                    $.each(activityYears, (i: number, dataPoint: ApiModels.EmployeeActivityYearCount): void => {
                        var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                        this._activityYearChartDataTable.addRow([dataPoint.year.toString(), total]);
                    });
                    this.activityYearChart.draw(this._activityYearChartDataTable, this._getActivityYearChartOptions())
                        .then((): void => {
                        });
                });
            });
        }

        activityYears = ko.observableArray<ApiModels.EmployeeActivityYearCount>();
        private _getActivityYears(): ApiModels.EmployeeActivityYearCount[] {
            var placeId = this.placeId();
            if (placeId == 1) placeId = null;
            var places = this.placeData.cached;
            //var currentYear = new Date().getFullYear();
            //var minYear = currentYear - 10;
            var currentYear = 2012;
            var minYear = 2003;
            var activityYears: ApiModels.EmployeeActivityYearCount[] = Enumerable.From(places)
                .Where(function (x: ApiModels.EmployeesPlaceApiModel): boolean {
                    if (placeId == null) return !x.placeId;
                    return x.placeId == placeId;
                })
                .SelectMany(function (x: ApiModels.EmployeesPlaceApiModel): ApiModels.EmployeeActivityYearCount[] {
                    return x.years;
                })
                .Distinct(function (x: ApiModels.EmployeeActivityYearCount): number {
                    return x.year;
                })
                .OrderBy(function (x: ApiModels.EmployeeActivityYearCount): number {
                    return x.year;
                })
                .Where(function (x: ApiModels.EmployeeActivityYearCount): boolean {
                    return x.year >= minYear && x.year <= currentYear;
                })
                .ToArray();
            return activityYears;
        }

        //#endregion
        //#region Place Overlays

        placeOverlays: KnockoutObservableArray<SummaryGeoChartPlaceOverlay>;

        arePlaceOverlaysVisible = ko.computed((): boolean => {
            var placeId = this.placeId();
            var isGeoChartReady = this.isGeoChartReady();
            var isPlaceOverlaySelected = this.isPlaceOverlaySelected ? this.isPlaceOverlaySelected() : false;
            if (!isGeoChartReady) return false;
            var areVisible = (placeId == 1 || isPlaceOverlaySelected)
                && isGeoChartReady;

            // hide the svg overlays if applicable
            if (Summary._isD3Defined() && this.settings.geoChart.googleElementId) {
                // overlay may already be drawn
                var dInjectRootElementId = '{0}_place_overlays_root'
                    .format(this.settings.geoChart.googleElementId);
                var dInjectRootSelection = d3.select('#{0}'.format(dInjectRootElementId));
                if (dInjectRootSelection.length) {
                    if (areVisible) {
                        dInjectRootSelection.attr('style', '');
                    }
                    else {
                        dInjectRootSelection.attr('style', 'display: none;');
                    }
                }
            }

            return areVisible;
        });

        private _parsePlaceOverlays(): void {
            if (this.placeOverlays) return;
            this.placeOverlays = ko.observableArray<SummaryGeoChartPlaceOverlay>();
            var overlays = $('#{0} .overlays .places .data'
                .format(this.settings.geoChart.boxElementId)).children();
            $.each(overlays, (i: number, overlay: Element): void => {
                var jOverlay = $(overlay);
                var iOverlay: SummaryGeoChartPlaceOverlay = {
                    total: ko.observable(0),
                    placeId: parseInt(jOverlay.data('place-id')),
                    title: jOverlay.attr('title'),
                    className: jOverlay.attr('class'),
                    imageSwapper: new App.ImageSwapper(
                        jOverlay.find('img.no-hover').first().attr('src'),
                        jOverlay.find('img.hover').first().attr('src')),
                };
                this.placeOverlays.push(iOverlay);
            });
        }

        private _getOverlayPlaceIds(): number[] {
            var placeIds: number[] = Enumerable.From(this.placeOverlays())
                .Select(function (x: SummaryGeoChartPlaceOverlay): number {
                    return x.placeId;
                })
                .ToArray();
            return placeIds;
        }

        clickPlaceOverlay(overlay: SummaryGeoChartPlaceOverlay, e: JQueryEventObject): void {
            var place = this._getPlaceById(overlay.placeId);
            if (place) {
                if (!place.activityPersonIds.length) {
                    return;
                }
                this.placeId(place.placeId);
            }
        }

        isPlaceOverlaySelected = ko.computed((): boolean => {
            var placeId = this.placeId();
            var areBindingsApplied = this.areBindingsApplied();
            var placeOverlays = this.placeOverlays ? this.placeOverlays() : undefined;
            if (!areBindingsApplied || !placeOverlays) return false;

            var isOverlaySelected = false;
            var overlay = Enumerable.From(placeOverlays)
                .SingleOrDefault(undefined, function (x: SummaryGeoChartPlaceOverlay): boolean {
                    return x.placeId == placeId;
                });
            if (overlay) {
                isOverlaySelected = true;
            }

            return isOverlaySelected;
        });

        //#endregion
        //#region SVG Injection

        private static _isD3Defined(): boolean {
            return typeof d3 !== 'undefined';
        }

        isD3Defined = ko.computed((): boolean => { return Summary._isD3Defined(); });

        isD3Undefined = ko.computed((): boolean => { return !Summary._isD3Defined(); });

        private _svgInjectPlaceOverlays(): void {
            // IE8 cannot load the d3 library
            if (!Summary._isD3Defined() ||
                !this.settings.geoChart.googleElementId ||
                !this.settings.geoChart.boxElementId)

                return;

            // overlay may already be drawn
            var dInjectRootElementId = '{0}_place_overlays_root'
                .format(this.settings.geoChart.googleElementId);
            if ($('#{0}'.format(dInjectRootElementId)).length)
                return;

            // svg structure is as follows:
            //  svg
            //      > defs
            //      > g
            //          > rect
            //          > g - map
            //              <----- inject new node here
            //          > g - legend
            //          > g - ?
            //          > g - tooltips

            // use d3 to select the first root g element from the geochart
            var dGoogleG = d3.select('#{0} svg > g'.format(this.settings.geoChart.googleElementId));

            // all of the overlays will become children of this g element
            var dInjectRoot = dGoogleG.append('g')
                .attr('id', dInjectRootElementId)
            ;
            var areOverlaysVisible = this.arePlaceOverlaysVisible();
            if (!areOverlaysVisible)
                dInjectRoot.attr('style', 'display: none;');

            // iterate over the parsed place overlays
            // first, need to show the data root in order to get valid positions
            var jContainer = $('#{0} .overlays .places .data'
                .format(this.settings.geoChart.boxElementId));
            jContainer.show(); // need to do this to get positions & dimensions from jQuery

            var overlays = this.placeOverlays();
            $.each(overlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                this._svgInjectPlaceOverlay(dInjectRoot, overlay);
            });

            jContainer.hide(); // no longer need dimensions, hide the HTML overlays

            // now use jQuery to rearrange the order of the elements
            $('#{0} svg > g > g:last-child'
                .format(this.settings.geoChart.googleElementId))
                .insertAfter('#{0} svg > g > g:nth-child(2)'
                    .format(this.settings.geoChart.googleElementId))
            ;
        }

        private _svgInjectPlaceOverlay(root: D3.Selection, overlay: SummaryGeoChartPlaceOverlay): D3.Selection {
            // create a new d3 container for this overlay
            var jOverlay = $('#{0} .overlays .places .data .{1}'
                .format(this.settings.geoChart.boxElementId, overlay.className));
            var dOverlay = root.append('g').attr('class', overlay.className);

            // compute position based on data element positions
            var x = jOverlay.position().left;
            var y = jOverlay.position().top;
            var width = jOverlay.outerWidth();
            var height = jOverlay.outerHeight();

            // append a no-hover d3 image to the overlay g element
            var noHoverImage = dOverlay.append('image')
                .attr('xlink:href', overlay.imageSwapper.noHoverSrc())
                .attr('x', x).attr('y', y)
                .attr('width', width).attr('height', height)
                .attr('class', 'no-hover')
            ;

            // append a hover d3 image to the overlay g element
            var hoverImage = dOverlay.append('image')
                .attr('xlink:href', overlay.imageSwapper.hoverSrc())
                .attr('x', x).attr('y', y)
                .attr('width', width).attr('height', height)
                .attr('class', 'hover').attr('style', 'display: none;')
            ;

            if (overlay.placeId == this.placeId()) {
                hoverImage.attr('style', '');
                noHoverImage.attr('style', 'display: none;');
            }

            this._svgApplyPlaceOverlayHover(overlay, noHoverImage, hoverImage);

            return dOverlay;
        }

        private _svgApplyPlaceOverlayHover(overlay: SummaryGeoChartPlaceOverlay, noHover: D3.Selection, hover: D3.Selection): void {
            // enable svg image hover swaps
            overlay.imageSwapper.isHover.subscribe((newValue: boolean): void => {

                // is this the selected overlay?
                var placeId = this.placeId();
                if (placeId == overlay.placeId) {
                    hover.attr('style', '');
                    noHover.attr('style', 'display:none');
                    return;
                }

                if (newValue) {
                    hover.attr('style', '');
                    noHover.attr('style', 'display:none');
                }
                else {
                    noHover.attr('style', '');
                    hover.attr('style', 'display:none');
                }
            });

            this.placeId.subscribe((newValue: number): void => {
                var placeId = this.placeId();
                if (placeId == overlay.placeId) {
                    hover.attr('style', '');
                    noHover.attr('style', 'display:none');
                }
                else {
                    noHover.attr('style', '');
                    hover.attr('style', 'display:none');
                }
            });
        }

        //#endregion
        //#region Tooltips

        private _tooltips = ko.observableArray<JQuery>();

        private _createOverlayTooltips(): void {
            var tooltips = this._tooltips();

            // remove tooltips when they already exist
            if (tooltips.length) {
                // destroy all of the tooltips
                $.each(this._tooltips(), (i: number, tooltip: JQuery): void => {
                    tooltip.tooltip('destroy');
                });
                this._tooltips([]);
            }

            var overlays = this.placeOverlays();
            $.each(overlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                // the tooltips are in the place ui
                var jOverlay = $('#{0} .overlays .places .ui .{1}'
                    .format(this.settings.geoChart.boxElementId, overlay.className));
                var tooltip = jOverlay.find('.tooltip');
                var content = tooltip.html() || 'tooltip';
                this._createOverlayTooltip(jOverlay, content);
                this._tooltips.push(jOverlay);
            });
        }

        private _createOverlayTooltip(target: JQuery, content: string): void {
            target.tooltip({
                content: content || 'tooltip content goes here',
                items: '*',
                track: true,
                show: false,
                hide: false,
                tooltipClass: 'geochart',
                position: {
                    my: 'right-15 bottom-15',
                    of: '.ui-tooltip-content',
                    within: '#{0}'.format(this.settings.geoChart.googleElementId),
                },
                open: function (e: any, ui: any) {
                    // get the width of the tooltip
                    var width = ui.tooltip.find('.ui-tooltip-content').outerWidth();
                    // set the width of the container
                    ui.tooltip.css({ width: '{0}px'.format(width) });
                },
            });
        }

        private _applyPlaceOverlayTotals(places: ApiModels.EmployeesPlaceApiModel[]): void {
            var isPivotPeople = this.isPivotPeople();
            var placeOverlays = this.placeOverlays();
            $.each(placeOverlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                var total = Enumerable.From(places)
                    .Where(function (x: ApiModels.EmployeesPlaceApiModel): boolean {
                        return x.placeId == overlay.placeId;
                    })
                    .Sum(function (x: ApiModels.EmployeesPlaceApiModel): number {
                        return isPivotPeople ? x.activityPersonIds.length : x.activityIds.length;
                    });
                overlay.total(total);
            });
        }

        //#endregion
    }
}