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
        geoChartElementId: string;
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

        mouseover(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('hover');
        }

        mouseout(self: ImageSwapper, e: JQueryEventObject): void {
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
        //#region Construction

        constructor(public settings: SummarySettings) {
            // CONSTRUCTOR
            this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.geoChartElementId));
            this._drawGeoChart();
            this.activitiesSummaryData.ready();
        }

        //#endregion
        //#region Google GeoChart

        geoChart: App.Google.GeoChart;
        geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
        isGeoChartReady: KnockoutObservable<boolean> = ko.observable(false);
        activityPlaceData: DataCacher<ApiModels.ActivityPlaceApiModel[]> = new DataCacher(
            (): JQueryPromise<ApiModels.ActivityPlaceApiModel[]> => {
                return this._loadActivityPlaceData();
            });

        private _loadActivityPlaceData(): JQueryPromise<ApiModels.ActivityPlaceApiModel[]> {
            var promise: JQueryDeferred<ApiModels.ActivityPlaceApiModel[]> = $.Deferred();
            var request: ApiModels.ActivityPlacesInputModel = {
                countries: true,
            };
            this.geoChartSpinner.start();
            Servers.ActivityPlaces(this.settings.tenantDomain, request)
                .done((places: ApiModels.ActivityPlaceApiModel[]): void => {
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
                //keepAspectRatio: this.settings.geoChartKeepAspectRatio ? true : false,
                //keepAspectRatio: true,
                keepAspectRatio: false,
                colorAxis: {
                    minValue: 1,
                    colors: ['#dceadc', '#006400', ],
                },
                backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
                //backgroundColor: 'transparent', // google maps water color is a5bfdd, Doug's bg color is acccfd
            };

            // create data table schema
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Place');
            dataTable.addColumn('number', 'Total Activities');

            // go ahead and draw the chart with empty data to make sure its ready
            this.geoChart.draw(dataTable, options).then((): void => {
                this.isGeoChartReady(true);
                this._testSvgInjection();

                // now hit the server up for data and redraw
                this.activityPlaceData.ready()
                    .done((places: ApiModels.ActivityPlaceApiModel[]): void => {
                        $.each(places, (i: number, dataPoint: ApiModels.ActivityPlaceApiModel): void=> {
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

        private _testSvgInjection(): void {

            // IE8 cannot load the d3 library
            if (!Summary._isD3Defined()) return;

            // svg structure is as follows:
            //  svg
            //      > defs
            //      > g
            //          > rect
            //          > g - map
            //          > g - legend
            //          > g - ?
            //          > g - tooltips
            var rootG = d3.select('#google_geochart svg > g');
            var parentG = rootG.append('g')
                .attr('id', 'overlay_root')
            ;

            var overlays = $('#google_geochart_overlay_container section');
            $.each(overlays, (i: number, overlay: Element): void => {
                var overlayG = parentG.append('g');
                $.each($(overlay).children(), (i: number, child: any): void => {
                    var jChild = $(child);
                    var src = jChild.attr('src');
                    var x = jChild.css('left');
                    var y = jChild.css('top');
                    var width = jChild.css('width');
                    var height = jChild.css('height');
                    var display = jChild.css('display');
                    if (jChild.prop('tagName').toUpperCase() == 'IMG') {
                        var image = overlayG.append('image')
                            .attr('xlink:href', src)
                            .attr('x', parseInt(x)).attr('y', parseInt(y))
                            .attr('width', width).attr('height', height)
                        ;
                        if (display && display.toLowerCase() == 'none') {
                            image.attr('style', 'display: none;');
                        }
                    }
                });

                $.each($(overlayG[0][0]).children(), (i: number, child: Element): void => {
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

            // now rearrange the g order
            // now use jQuery to rearrange the order of the elements
            $('#google_geochart svg > g > g:last-child')
                .insertAfter('#google_geochart svg > g > g:nth-child(2)')
            //.removeAttr('id')
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