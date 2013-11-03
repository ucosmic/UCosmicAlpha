/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/HistoryJS.ts" />
/// <reference path="../../typings/history/history.d.ts" />
/// <reference path="../../typings/d3/d3.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/googlecharts/google.charts.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/linq/linq.d.ts" />
/// <reference path="../../google/GeoChart.ts" />
/// <reference path="Server.ts" />
/// <reference path="Models.d.ts" />
/// <reference path="../../app/App.ts" />

module Employees.ViewModels {

    export interface SummarySettings {
        tenantDomain: string;
        element: Element;
        chart: SummaryGeoChartSettings;
    }

    export interface SummaryGeoChartSettings {
        boxElementId: string;
        googleElementId: string;
        transparentImgSrc: string;
        keepAspectRatio?: boolean;
    }

    export interface SummaryGeoChartPlaceOverlay {
        placeId: number;
        title: string;
        className: string;
        total: KnockoutObservable<number>;
        imageSwapper: ImageSwapper;
    }

    export class SummaryRouteState {
        pivot: DataGraphPivot; // enum during build, int at runtime
        placeId: number;

        static areEqual(first: SummaryRouteState, second: SummaryRouteState): boolean {
            if (!first && !second) return true;
            if (!first && second) return false;
            if (first && !second) return false;
            var areEqual = true;
            if (first.pivot != second.pivot) areEqual = false;
            if (first.placeId != second.placeId) areEqual = false;
            return areEqual;
        }

        static isEmpty(state: SummaryRouteState): boolean {
            if (!state) return true;
            return !state.pivot && !state.placeId;
        }

        static isIncomplete(state: SummaryRouteState): boolean {
            if (!state) return true;
            return !state.pivot || !state.placeId;
        }
    }

    export enum DataGraphPivot {
        unknown = 0,
        people = 1,
        activities = 2,
        degress = 3,
    }

    export class ImageSwapper {

        hoverSrc: KnockoutObservable<string> = ko.observable('');
        noHoverSrc: KnockoutObservable<string> = ko.observable('');

        constructor(noHoverSrc?: string, hoverSrc?: string) {
            this.noHoverSrc(noHoverSrc || '');
            this.hoverSrc(hoverSrc || '');
        }

        private _state: KnockoutObservable<string> = ko.observable('none');

        isNoHover = ko.computed((): boolean => {
            return this._state() == 'none';
        });

        isHover = ko.computed((): boolean => {
            return this._state() == 'hover';
        });

        src = ko.computed((): string => {
            return this.isHover() ? this.hoverSrc() : this.noHoverSrc();
        });

        onMouseEnter(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('hover');
        }

        onMouseLeave(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('none');
        }
    }

    export class DataCacher<T> {
        constructor(public loader: () => JQueryPromise<T>) { }

        cached: T;
        private _promise: JQueryDeferred<T> = $.Deferred();
        ready(): JQueryPromise<T> {
            if (!this.cached) {
                this.loader()
                    .done((data: T): void => {
                        this.cached = data;
                        this._promise.resolve(this.cached);
                    })
                    .fail((xhr: JQueryXHR): void => {
                        this._promise.reject();
                    });
            }
            return this._promise;
        }
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

            // begin loading data
            this.activitiesSummaryData.ready();
            this._initGeoChart();

            // need to fire this once because route changes before history is bound
            this.bindingsApplied.done((): void => {
                this._applyState();
            });
        }

        private _bindingsApplied: JQueryDeferred<void> = $.Deferred();
        bindingsApplied: JQueryPromise<void> = this._bindingsApplied;
        areBindingsApplied: KnockoutObservable<boolean> = ko.observable(false);

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
        pivot: KnockoutObservable<DataGraphPivot> = ko.observable(
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
        placeId: KnockoutObservable<number> = ko.observable(
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
        //#endregion
        //#region Routing

        private _getUrlState(): SummaryRouteState {
            var params = location.search.indexOf('?') == 0
                ? location.search.substr(1) : location.search;
            var state: SummaryRouteState = App.deparam(params, true);
            return state;
        }

        routeState = ko.computed((): SummaryRouteState => {
            return {
                pivot: this.pivot(),
                placeId: this.placeId(),
            };
        });

        private _routeStateChanged = ko.computed((): void => {
            this._onRouteStateChanged();
        }).extend({ throttle: 1 });

        private _onRouteStateChanged(): void {
            // this runs whenever an observable component of routeState changes
            // and will run at least once when the page loads, since it is a computed
            // there are 4 main scenarios we want to handle here:
            // 1.) when the route state matches the url state, update the historyjs state
            // 2.) when we have incomplete url state, replace current url based on route state
            // 3.) when historyjs state is empty and url state is complete, we have a url
            //     that should override the current route state values
            // 4.) all other cases mean user interaction, and should push a new url
            var routeState = this.routeState(); // the new state we want in the URL
            var urlState = this._getUrlState(); // actual state based on current URL
            var areBindingsApplied = this.areBindingsApplied();

            // when the url state is missing something (or everything), replace it with route data
            if (SummaryRouteState.isIncomplete(urlState) || SummaryRouteState.areEqual(routeState, urlState)) {
                HistoryJS.replaceState(routeState, '', '?' + $.param(routeState));
            }

            // by now url state is not equal but is not incomplete either
            // since we have it, update the route values with the url values
            else if (!areBindingsApplied) {
                this._updateState(urlState);
            }
            else {
                HistoryJS.pushState(routeState, '', '?' + $.param(routeState));
            }
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
        }

        private _applyState(): void {
            this._drawGeoChart();
        }

        //#endregion
        //#region Pivot Data

        hasPivotData: KnockoutObservable<boolean> = ko.observable(false);

        //activitiesPlaceData: DataCacher<ApiModels.ActivitiesPlaceApiModel[]> = new DataCacher(
        //    (): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> => {
        //        return this._loadActivitiesPlaceData();
        //    });

        //private _loadActivitiesPlaceData(): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> {
        //    // calling .ready() on activitiesPlaceData invokes this
        //    var promise: JQueryDeferred<ApiModels.ActivitiesPlaceApiModel[]> = $.Deferred();
        //    var request: ApiModels.ActivitiesPlacesInputModel = {
        //        countries: true,
        //        placeIds: this._getOverlayPlaceIds(),
        //    };
        //    this.geoChartSpinner.start();
        //    Servers.ActivitiesPlaces(this.settings.tenantDomain, request)
        //        .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
        //            this.hasPivotData(places && places.length > 0);
        //            promise.resolve(places);
        //        })
        //        .fail((xhr: JQueryXHR): void => {
        //            App.Failures.message(xhr, 'while trying to load activity location summary data.', true);
        //            promise.reject();
        //        })
        //        .always((): void => {
        //            this.geoChartSpinner.stop();
        //        });
        //    return promise;
        //}

        //peoplePlaceData: DataCacher<ApiModels.PeoplePlaceApiModel[]> = new DataCacher(
        //    (): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> => {
        //        return this._loadPeoplePlaceData();
        //    });

        //private _loadPeoplePlaceData(): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> {
        //    // calling .ready() on peoplePlaceData invokes this
        //    var promise: JQueryDeferred<ApiModels.PeoplePlaceApiModel[]> = $.Deferred();
        //    var request: ApiModels.PeoplePlacesInputModel = {
        //        countries: true,
        //        placeIds: this._getOverlayPlaceIds(),
        //    };
        //    this.geoChartSpinner.start();
        //    Servers.PeoplePlaces(this.settings.tenantDomain, request)
        //        .done((places: ApiModels.PeoplePlaceApiModel[]): void => {
        //            this.hasPivotData(places && places.length > 0);
        //            promise.resolve(places);
        //        })
        //        .fail((xhr: JQueryXHR): void => {
        //            App.Failures.message(xhr, 'while trying to load employee location summary data.', true);
        //            promise.reject();
        //        })
        //        .always((): void => {
        //            this.geoChartSpinner.stop();
        //        });
        //    return promise;
        //}

        placeData: DataCacher<ApiModels.EmployeesPlaceApiModel[]> = new DataCacher(
            (): JQueryPromise<ApiModels.EmployeesPlaceApiModel[]> => {
                return this._loadPlaceData();
            });

        private _loadPlaceData(): JQueryPromise<ApiModels.EmployeesPlaceApiModel[]> {
            // calling .ready() on placeData invokes this
            var promise: JQueryDeferred<ApiModels.EmployeesPlaceApiModel[]> = $.Deferred();
            var request: ApiModels.EmployeesPlacesInputModel = {
                countries: true,
                placeIds: this._getOverlayPlaceIds(),
            };
            this.geoChartSpinner.start();
            Servers.EmployeesPlaces(this.settings.tenantDomain, request)
                .done((places: ApiModels.EmployeesPlaceApiModel[]): void => {
                    this.hasPivotData(places && places.length > 0);
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

        //private _getPlacesForEnumeration(): ApiModels.EmployeesPlaceApiModel[] {
        //    var searchTarget: DataCacher<ApiModels.EmployeesPivotPlaceApiModel[]> = this.isPivotActivities()
        //        ? <DataCacher<ApiModels.EmployeesPivotPlaceApiModel[]>>this.activitiesPlaceData
        //        : this.peoplePlaceData;

        //    return searchTarget ? searchTarget.cached : undefined;
        //}

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
        //#region Google GeoChart

        geoChart: App.Google.GeoChart = new App.Google.GeoChart(
            document.getElementById(this.settings.chart.googleElementId));
        geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
        isGeoChartReady: KnockoutObservable<boolean> = ko.observable(false);
        private _geoChartDataTable: google.visualization.DataTable = this._newGeoChartDataTable();

        private _geoChartOptions: google.visualization.GeoChartOptions = {
            // options passed when drawing geochart
            displayMode: 'regions',
            region: 'world',
            keepAspectRatio: this.settings.chart.keepAspectRatio ? true : false,
            height: this.settings.chart.keepAspectRatio ? 480 : 500,
            colorAxis: {
                minValue: 1,
                colors: ['#dceadc', '#006400', ],
            },
            backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
            //backgroundColor: 'transparent',
        };

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
                this.geoChart.draw(this._geoChartDataTable, this._geoChartOptions).then((): void => {
                    // svg injection depends on the chart being ready,
                    // and bindings having been applied, and the
                    // overlays being visible
                    if (!this.isGeoChartReady()) {
                        this.isGeoChartReady(true); // call this before overlaying to ensure positions
                        this.bindingsApplied.done((): void=> {
                            this._svgInjectPlaceOverlays();
                            google.visualization.events.addListener(this.geoChart.geoChart, 'select',
                                (): void => { this._onGeoChartSelect(); });
                            google.visualization.events.addListener(this.geoChart.geoChart, 'regionClick',
                                (e: google.visualization.GeoChartRegionClickEvent): void => { this._onGeoChartRegionClick(e); });
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
            this._geoChartOptions.region = !placeId || placeId == 1 || !place || !place.countryCode
                ? 'world' : place.countryCode;

            // change aspect ratio based on placeId
            this._geoChartOptions.keepAspectRatio = placeId && placeId > 1 && place && place.countryCode ? false :
            this.settings.chart.keepAspectRatio ? true : false;

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
                        var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                        this._geoChartDataTable.addRow([dataPoint.placeName, total]);
                    });
                    this.geoChart.draw(this._geoChartDataTable, this._geoChartOptions).then((): void => {
                        setTimeout((): void => { this._svgInjectPlaceOverlays(); }, 0);
                        this._applyPlaceOverlayTotals(places);
                        this._createOverlayTooltips();
                    });
                });
                //if (this.isPivotPeople()) {
                //    this.peoplePlaceData.ready()
                //        .done((places: ApiModels.PeoplePlaceApiModel[]): void => {
                //            if (needsRedraw) {
                //                this._drawGeoChart();
                //                return;
                //            }
                //            this._geoChartDataTable.removeRows(0, this._geoChartDataTable.getNumberOfRows());

                //            $.each(places, (i: number, dataPoint: ApiModels.PeoplePlaceApiModel): void => {
                //                this._geoChartDataTable.addRow([dataPoint.placeName, dataPoint.personIds.length]);
                //            });

                //            this.geoChart.draw(this._geoChartDataTable, this._geoChartOptions).then((): void => {
                //                setTimeout((): void => { this._svgInjectPlaceOverlays(); }, 0);
                //                this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(this.isPivotPeople() ? 'People' : 'Activities'));
                //                this._applyPeopleOverlayTotals(places);
                //                this._createOverlayTooltips();
                //            });
                //        });
                //}
                //else {
                //    this.activitiesPlaceData.ready()
                //        .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
                //            if (needsRedraw) {
                //                this._drawGeoChart();
                //                return;
                //            }
                //            this._geoChartDataTable.removeRows(0, this._geoChartDataTable.getNumberOfRows());

                //            $.each(places, (i: number, dataPoint: ApiModels.ActivitiesPlaceApiModel): void=> {
                //                this._geoChartDataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                //            });

                //            this.geoChart.draw(this._geoChartDataTable, this._geoChartOptions).then((): void => {
                //                setTimeout((): void => { this._svgInjectPlaceOverlays(); }, 0);
                //                this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(this.isPivotPeople() ? 'People' : 'Activities'));
                //                this._applyActivitiesOverlayTotals(places);
                //                this._createOverlayTooltips();
                //            });
                //        });
                //}
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
        //#region Place Overlays

        placeOverlays: KnockoutObservableArray<SummaryGeoChartPlaceOverlay>;

        arePlaceOverlaysVisible = ko.computed((): boolean => {
            var placeId = this.placeId();
            var isGeoChartReady = this.isGeoChartReady();
            if (!isGeoChartReady) return false;
            var areVisible = (typeof placeId === 'undefined' || placeId == null || isNaN(placeId) || placeId == 1 || placeId == 0)
                && isGeoChartReady;

            // hide the svg overlays if applicable
            if (Summary._isD3Defined() && this.settings.chart.googleElementId) {
                // overlay may already be drawn
                var dInjectRootElementId = '{0}_place_overlays_root'
                    .format(this.settings.chart.googleElementId);
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
            this.placeOverlays = ko.observableArray();
            var overlays = $('#{0} .overlays .places .data'
                .format(this.settings.chart.boxElementId)).children();
            $.each(overlays, (i: number, overlay: Element): void => {
                var jOverlay = $(overlay);
                var iOverlay: SummaryGeoChartPlaceOverlay = {
                    total: ko.observable(0),
                    placeId: parseInt(jOverlay.data('place-id')),
                    title: jOverlay.attr('title'),
                    className: jOverlay.attr('class'),
                    imageSwapper: new ImageSwapper(
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

        //#endregion
        //#region SVG Injection

        private static _isD3Defined(): boolean {
            return typeof d3 !== 'undefined';
        }

        isD3Defined = ko.computed((): boolean => {
            return Summary._isD3Defined();
        });

        isD3Undefined = ko.computed((): boolean => {
            return !Summary._isD3Defined();
        });

        private _svgInjectPlaceOverlays(): void {
            // IE8 cannot load the d3 library
            if (!Summary._isD3Defined() ||
                !this.settings.chart.googleElementId ||
                !this.settings.chart.boxElementId)

                return;

            // overlay may already be drawn
            var dInjectRootElementId = '{0}_place_overlays_root'
                .format(this.settings.chart.googleElementId);
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
            var dGoogleG = d3.select('#{0} svg > g'.format(this.settings.chart.googleElementId));

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
                .format(this.settings.chart.boxElementId));
            jContainer.show(); // need to do this to get positions & dimensions from jQuery

            var overlays = this.placeOverlays();
            $.each(overlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                this._svgInjectPlaceOverlay(dInjectRoot, overlay);
            });

            jContainer.hide(); // no longer need dimensions, hide the HTML overlays

            // now use jQuery to rearrange the order of the elements
            $('#{0} svg > g > g:last-child'
                .format(this.settings.chart.googleElementId))
                .insertAfter('#{0} svg > g > g:nth-child(2)'
                    .format(this.settings.chart.googleElementId))
            ;
        }

        private _svgInjectPlaceOverlay(root: D3.Selection, overlay: SummaryGeoChartPlaceOverlay): D3.Selection {
            // create a new d3 container for this overlay
            var jOverlay = $('#{0} .overlays .places .data .{1}'
                .format(this.settings.chart.boxElementId, overlay.className));
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

            this._svgApplyPlaceOverlayHover(overlay, noHoverImage, hoverImage);

            return dOverlay;
        }

        private _svgApplyPlaceOverlayHover(overlay: SummaryGeoChartPlaceOverlay, noHover: D3.Selection, hover: D3.Selection): void {
            // enable svg image hover swaps
            overlay.imageSwapper.isHover.subscribe((newValue: boolean): void => {
                if (newValue) {
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

        private _tooltips: KnockoutObservableArray<JQuery> = ko.observableArray();

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
                    .format(this.settings.chart.boxElementId, overlay.className));
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
                    within: '#{0}'.format(this.settings.chart.googleElementId),
                },
                open: function (e: any, ui: any) {
                    // get the width of the tooltip
                    var width = ui.tooltip.find('.ui-tooltip-content').outerWidth();
                    // set the width of the container
                    ui.tooltip.css({ width: '{0}px'.format(width) });
                },
            });
        }

        //private _applyActivitiesOverlayTotals(places: ApiModels.ActivitiesPlaceApiModel[]): void {
        //    var placeOverlays = this.placeOverlays();
        //    $.each(placeOverlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
        //        var total = Enumerable.From(places)
        //            .Where(function (x: ApiModels.ActivitiesPlaceApiModel): boolean {
        //                return x.placeId == overlay.placeId;
        //            })
        //            .Sum(function (x: ApiModels.ActivitiesPlaceApiModel): number {
        //                return x.activityIds.length;
        //            });
        //        overlay.total(total);
        //    });
        //}

        //private _applyPeopleOverlayTotals(places: ApiModels.PeoplePlaceApiModel[]): void {
        //    var placeOverlays = this.placeOverlays();
        //    $.each(placeOverlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
        //        var total = Enumerable.From(places)
        //            .Where(function (x: ApiModels.PeoplePlaceApiModel): boolean {
        //                return x.placeId == overlay.placeId;
        //            })
        //            .Sum(function (x: ApiModels.PeoplePlaceApiModel): number {
        //                return x.personIds.length;
        //            });
        //        overlay.total(total);
        //    });
        //}

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
        //#region Summaries
        //#region Top Summary
        activitiesSummary: KoModels.ActivitiesSummary = {
            personCount: ko.observable('?'),
            activityCount: ko.observable('?'),
            locationCount: ko.observable('?'),
        };
        activitiesSummaryData: DataCacher<ApiModels.ActivitiesSummary> = new DataCacher(
            (): JQueryPromise<ApiModels.ActivitiesSummary> => {
                return this._loadActivitiesSummary();
            });

        private _loadActivitiesSummary(): JQueryPromise<ApiModels.ActivitiesSummary> {
            var promise: JQueryDeferred<ApiModels.ActivitiesSummary> = $.Deferred();
            Servers.ActivitiesSummary(this.settings.tenantDomain)
                .done((summary: ApiModels.ActivitiesSummary): void => {
                    ko.mapping.fromJS(summary, {}, this.activitiesSummary);
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

        selectedPlaceSummary: KoModels.ActivitiesSummary = {
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
    }
}