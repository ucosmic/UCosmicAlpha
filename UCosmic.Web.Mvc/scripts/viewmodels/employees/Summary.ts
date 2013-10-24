/// <reference path="../../typings/googlecharts/google.charts.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../google/GeoChart.ts" />

module Employees.ViewModels {

    export interface SummarySettings {
        chartElementId: string;
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
            this.geoChart = new App.Google.GeoChart(document.getElementById('google_geochart'));
            this._drawGeoChart();
        }

        //#endregion
        //#region Google GeoChart

        geoChart: App.Google.GeoChart;
        isGeoChartReady: KnockoutObservable<boolean> = ko.observable(false);

        private _drawGeoChart(): void {
            var data = google.visualization.arrayToDataTable([
                ['Country', 'Popularity'],
                ['Germany', 200],
                ['United States', 300],
                ['Brazil', 400],
                ['Canada', 500],
                ['France', 600],
                ['RU', 700]
            ]);

            var options: google.visualization.GeoChartOptions = {
                backgroundColor: '#acccfd', // google maps water color is a5bfdd, Doug's bg color is acccfd
                keepAspectRatio: false,
            };
            this.geoChart.draw(data, options).done((): void => {
                this.isGeoChartReady(true);
            });
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
    }
}