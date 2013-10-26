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
        element: Element;
        elementId?: string;
        geoChartElementId: string;
        geoChartWaterOverlaysElementId?: string;
        geoChartKeepAspectRatio?: boolean;
        tenantDomain: string;
    }

    export class ImageSwapper {
        private _state: KnockoutObservable<string> = ko.observable('up');

        isUp = ko.computed((): boolean => {
            return this._state() == 'up';
        });

        isHover = ko.computed((): boolean => {
            return this._state() == 'hover';
        });

        onMouseEnter(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('hover');
        }

        onMouseLeave(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('up');
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

            google.setOnLoadCallback((): void => {
                this._googleVisualizationLoadedPromise.resolve();
            });
            return this._googleVisualizationLoadedPromise;
        }

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SummarySettings) {
            // CONSTRUCTOR
            this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.geoChartElementId));
            this.activityPlaceData.ready();
            this.activitiesSummaryData.ready();
        }

        private _bindingsApplied: JQueryDeferred<void> = $.Deferred();
        bindingsApplied: JQueryPromise<void> = this._bindingsApplied;

        applyBindings(): void {
            // did we get an element or an element id?
            var element = this.settings.element;
            if (!element) {
                element = document.getElementById(this.settings.elementId);
            }
            ko.applyBindings(this, element);
            this._bindingsApplied.resolve();

            this._drawGeoChart();
        }

        //#endregion
        //#region Google GeoChart

        geoChart: App.Google.GeoChart;
        geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
        isGeoChartReady: KnockoutObservable<boolean> = ko.observable(false);
        activityPlaceData: DataCacher<ApiModels.ActivitiesPlaceApiModel[]> = new DataCacher(
            (): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> => {
                return this._loadActivityPlaceData();
            });

        private _loadActivityPlaceData(): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> {
            var promise: JQueryDeferred<ApiModels.ActivitiesPlaceApiModel[]> = $.Deferred();
            var request: ApiModels.ActivitiesPlacesInputModel = {
                countries: true,
            };
            this.geoChartSpinner.start();
            Servers.ActivityPlaces(this.settings.tenantDomain, request)
                .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
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

        private _drawGeoChart(): void {

            // options passed when drawing geochart
            var options: google.visualization.GeoChartOptions = {
                displayMode: 'regions',
                region: 'world',
                keepAspectRatio: this.settings.geoChartKeepAspectRatio ? true : false,
                height: this.settings.geoChartKeepAspectRatio ? 480 : 500,
                colorAxis: {
                    minValue: 1,
                    colors: ['#dceadc', '#006400', ],
                },
                backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
                //backgroundColor: 'transparent',
            };

            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Place');
            dataTable.addColumn('number', 'Total Activities');

            // go ahead and draw the chart with empty data to make sure its ready
            this.geoChart.draw(dataTable, options).then((): void => {
                this.isGeoChartReady(true);

                // svg injection depends on both the chart being ready
                // and bindings having been applied
                this.bindingsApplied.done((): void=> {
                    this._injectGeoChartOverlays();
                });

                // now hit the server up for data and redraw
                this.activityPlaceData.ready()
                    .done((places: ApiModels.ActivitiesPlaceApiModel[]): void => {
                        $.each(places, (i: number, dataPoint: ApiModels.ActivitiesPlaceApiModel): void=> {
                            dataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                        });

                        this.geoChart.draw(dataTable, options);
                    });
            });
        }

        //#endregion
        //#region SVG Injection

        private static _isD3Defined(): boolean {
            return typeof d3 !== 'undefined';
        }

        isD3Undefined = ko.computed((): boolean => {
            return !Summary._isD3Defined();
        });

        private _injectGeoChartOverlays(): void {

            // IE8 cannot load the d3 library
            if (!Summary._isD3Defined() || !this.settings.geoChartWaterOverlaysElementId)
                return;

            // svg structure is as follows:
            //  svg
            //      > defs
            //      > g
            //          > rect
            //          > g - map
            //          > g - legend
            //          > g - ?
            //          > g - tooltips

            // use d3 to select the first root g element from the geochart
            var rootG = d3.select('#{0} svg > g'.format(this.settings.geoChartElementId));

            // append a new g element to the geochart's root g element
            // all of the overlays will become children of this g element
            var parentG = rootG.append('g')
                .attr('id', '{0}_root'.format(this.settings.geoChartWaterOverlaysElementId))
            ; // note this element's id will be removed later, it is here for testing only

            // iterate over the children of the overlays element
            // in the markup the overlays is a UL with each overlay as an LI
            // (however the following code does not take that into account)
            var container = $('#{0}'.format(this.settings.geoChartWaterOverlaysElementId));
            container.show(); // need to do this to get positions & dimensions from jQuery
            var overlays = container.children();
            $.each(overlays, (i: number, overlay: Element): void => {
                // create a new d3 container for this overlay
                var dOverlay = parentG.append('g');
                var jOverlay = $(overlay);
                $.each($(overlay).children(), (i: number, child: any): void => {
                    var jChild = $(child);

                    // currently this only supports image injection
                    if (jChild.prop('tagName').toUpperCase() !== 'IMG') return;

                    // need to compute position in case it is defined in a css class
                    // it is the parent's offset (the overlay's offset) that determines both x and y
                    var x = jOverlay.position().left;
                    var y = jOverlay.position().top;

                    // width and height will be accessible when shown
                    var width = jChild.css('width');
                    var height = jChild.css('height');
                    var src = jChild.attr('src');
                    var display = jChild.css('display');

                    // append a d3 image to the overlay g element
                    var image = dOverlay.append('image')
                        .attr('xlink:href', src)
                        .attr('x', x).attr('y', y)
                        .attr('width', width).attr('height', height)
                    ;

                    // hide the hot image in the d3 overlay collection
                    if (display && display.toLowerCase() == 'none') {
                        image.attr('style', 'display: none;');
                    }
                });

                // TODO: move this to a separate handler
                // the images are now in the SVG, but they have no mouse events
                // use d3 to iterate over each svg overlay
                $.each($(dOverlay[0][0]).children(), (i: number, child: Element): void => {
                    // the child is an SVG image, and has 1 SVG image sibling
                    var jChild = $(child);
                    var dChild = d3.select(child);
                    var display = jChild.css('display');
                    var sibling = jChild.siblings('image');

                    // put mouseleave on the hidden element (it will be the hot one)
                    var eventName = display && display.toLowerCase() == 'none'
                        ? 'mouseleave' : 'mouseenter';
                    dChild.on(eventName, (): void => {
                        jChild.hide();
                        sibling.show();
                    });

                    // nudge down caribbean
                    var src = dChild.attr('xlink:href');
                    if (src && src.toLowerCase().indexOf('caribbean') > 0) {
                        var oldY = dChild.attr('y');
                        var newY = parseInt(oldY) + 5;
                        dChild.attr('y', newY);
                    }
                });
            });


            container.hide(); // no longer need dimensions, hide the HTML overlays

            // now rearrange the g order
            // now use jQuery to rearrange the order of the elements
            $('#google_geochart svg > g > g:last-child')
                .insertAfter('#google_geochart svg > g > g:nth-child(2)')
                .removeAttr('id')
            ;
        }

        //#endregion
        //#region Extra Text Images

        pacificOceanSwapper: ImageSwapper = new ImageSwapper();
        gulfOfMexicoSwapper: ImageSwapper = new ImageSwapper();
        caribbeanSeaSwapper: ImageSwapper = new ImageSwapper();
        atlanticOceanSwapper: ImageSwapper = new ImageSwapper();
        southernOceanSwapper: ImageSwapper = new ImageSwapper();
        arcticOceanSwapper: ImageSwapper = new ImageSwapper();
        indianOceanSwapper: ImageSwapper = new ImageSwapper();
        antarcticaSwapper: ImageSwapper = new ImageSwapper();

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