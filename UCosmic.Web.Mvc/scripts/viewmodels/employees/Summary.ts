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

    export interface SummaryRouteState {
        pivot: DataGraphPivot; // enum during build, int at runtime
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

        private _response: T;
        private _promise: JQueryDeferred<T> = $.Deferred();
        ready(): JQueryPromise<T> {
            if (!this._response) {
                this.loader()
                    .done((data: T): void => {
                        this._response = data;
                        this._promise.resolve(this._response);
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
        //#endregion
        //#region Routing

        routeState = ko.computed((): SummaryRouteState => {
            return {
                pivot: this.pivot(),
            };
        });

        private _routeStateChanged = ko.computed((): void => {
            this._onRouteStateChanged();
        }).extend({ throttle: 1 });

        private _onRouteStateChanged() {
            var routeState = this.routeState();
            var historyState = HistoryJS.getState();
            if (!historyState.data.pivot) {
                HistoryJS.replaceState(routeState, document.title, '?' + $.param(routeState));
            }
            else {
                HistoryJS.pushState(routeState, document.title, '?' + $.param(routeState));
            }
        }

        private _onRouteChanged() {
            var state = HistoryJS.getState();
            var data: SummaryRouteState = state.data;
            this.pivot(data.pivot);
            this._applyState();
        }

        private _applyState(): void {
            this._drawGeoChart();
        }

        //#endregion
        //#region Pivot Data

        hasPivotData: KnockoutObservable<boolean> = ko.observable(false);

        activitiesPlaceData: DataCacher<ApiModels.ActivitiesPlaceApiModel[]> = new DataCacher(
            (): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> => {
                return this._loadActivitiesPlaceData();
            });

        private _loadActivitiesPlaceData(): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> {
            // calling .ready() on activitiesPlaceData invokes this
            var promise: JQueryDeferred<ApiModels.ActivitiesPlaceApiModel[]> = $.Deferred();
            var request: ApiModels.ActivitiesPlacesInputModel = {
                countries: true,
                placeIds: this._getOverlayPlaceIds(),
            };
            this.geoChartSpinner.start();
            Servers.ActivitiesPlaces(this.settings.tenantDomain, request)
                .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
                    this.hasPivotData(places && places.length > 0);
                    promise.resolve(places);
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load activity location summary data.', true);
                    promise.reject();
                })
                .always((): void => {
                    this.geoChartSpinner.stop();
                });
            return promise;
        }

        peoplePlaceData: DataCacher<ApiModels.PeoplePlaceApiModel[]> = new DataCacher(
            (): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> => {
                return this._loadPeoplePlaceData();
            });

        private _loadPeoplePlaceData(): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> {
            // calling .ready() on peoplePlaceData invokes this
            var promise: JQueryDeferred<ApiModels.PeoplePlaceApiModel[]> = $.Deferred();
            var request: ApiModels.PeoplePlacesInputModel = {
                countries: true,
                placeIds: this._getOverlayPlaceIds(),
            };
            this.geoChartSpinner.start();
            Servers.PeoplePlaces(this.settings.tenantDomain, request)
                .done((places: ApiModels.PeoplePlaceApiModel[]): void => {
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

        //#endregion
        //#region Google GeoChart

        geoChart: App.Google.GeoChart = new App.Google.GeoChart(
            document.getElementById(this.settings.chart.googleElementId));
        geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
        isGeoChartReady: KnockoutObservable<boolean> = ko.observable(false);

        private static _geoChartOptions(settings: SummarySettings): google.visualization.GeoChartOptions {
            // options passed when drawing geochart
            var options: google.visualization.GeoChartOptions = {
                displayMode: 'regions',
                region: 'world',
                keepAspectRatio: settings.chart.keepAspectRatio ? true : false,
                height: settings.chart.keepAspectRatio ? 480 : 500,
                colorAxis: {
                    minValue: 1,
                    colors: ['#dceadc', '#006400', ],
                },
                backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
                //backgroundColor: 'transparent',
            };
            return options;
        }

        private _newGeoChartDataTable(): google.visualization.DataTable {
            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Place');
            dataTable.addColumn('number', 'Total {0}'
                .format(this.isPivotPeople() ? 'People' : 'Activities'));
            return dataTable;
        }

        private _initGeoChart(): JQueryPromise<void> {
            // just draw the geochart to make sure something is displayed
            // need to make sure we wait until it's done though before drying to draw again
            var promise = $.Deferred();

            if (!this.isGeoChartReady()) {
                var dataTable = this._newGeoChartDataTable();
                var options = Summary._geoChartOptions(this.settings);
                this.geoChart.draw(dataTable, options).then((): void => {
                    // svg injection depends on the chart being ready,
                    // and bindings having been applied, and the
                    // overlays being visible
                    if (!this.isGeoChartReady()) {
                        this.isGeoChartReady(true); // call this before overlaying to ensure positions
                        this.bindingsApplied.done((): void=> {
                            this._svgInjectPlaceOverlays();
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
            var options = Summary._geoChartOptions(this.settings);
            var dataTable = this._newGeoChartDataTable();

            // hit the server up for data and redraw
            this._initGeoChart().then((): void => {
                if (this.isPivotPeople()) {
                    this.peoplePlaceData.ready()
                        .done((places: ApiModels.PeoplePlaceApiModel[]): void => {
                            $.each(places, (i: number, dataPoint: ApiModels.PeoplePlaceApiModel): void=> {
                                dataTable.addRow([dataPoint.placeName, dataPoint.personIds.length]);
                            });

                            this.geoChart.draw(dataTable, options).then((): void => {
                                this._applyPeopleOverlayTotals(places);
                                this._createOverlayTooltips();
                            });
                        });
                }
                else {
                    this.activitiesPlaceData.ready()
                        .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
                            $.each(places, (i: number, dataPoint: ApiModels.ActivitiesPlaceApiModel): void=> {
                                dataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                            });

                            this.geoChart.draw(dataTable, options).then((): void => {
                                this._applyActivitiesOverlayTotals(places);
                                this._createOverlayTooltips();
                            });
                        });
                }
            });
        }

        //#endregion
        //#region Place Overlays

        placeOverlays: KnockoutObservableArray<SummaryGeoChartPlaceOverlay>;

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
            // make the ui images transparent
            overlay.imageSwapper.hoverSrc(this.settings.chart.transparentImgSrc);
            overlay.imageSwapper.noHoverSrc(this.settings.chart.transparentImgSrc);

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

        private _applyActivitiesOverlayTotals(places: ApiModels.ActivitiesPlaceApiModel[]): void {
            var placeOverlays = this.placeOverlays();
            $.each(placeOverlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                var total = Enumerable.From(places)
                    .Where(function (x: ApiModels.ActivitiesPlaceApiModel): boolean {
                        return x.placeId == overlay.placeId;
                    })
                    .Sum(function (x: ApiModels.ActivitiesPlaceApiModel): number {
                        return x.activityIds.length;
                    });
                overlay.total(total);
            });
        }

        private _applyPeopleOverlayTotals(places: ApiModels.PeoplePlaceApiModel[]): void {
            var placeOverlays = this.placeOverlays();
            $.each(placeOverlays, (i: number, overlay: SummaryGeoChartPlaceOverlay): void => {
                var total = Enumerable.From(places)
                    .Where(function (x: ApiModels.PeoplePlaceApiModel): boolean {
                        return x.placeId == overlay.placeId;
                    })
                    .Sum(function (x: ApiModels.PeoplePlaceApiModel): number {
                        return x.personIds.length;
                    });
                overlay.total(total);
            });
        }

        //#endregion
        //#region Summaries

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
    }
}