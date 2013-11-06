/// <reference path="../typings/google.visualization/google.visualization.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />

module App.Google {

    export interface GeoChartEventName {
        error: string;
        ready: string;
        regionClick: string;
        select: string;
    }

    export class GeoChart {

        static eventName: GeoChartEventName = {
            error: 'error',
            ready: 'ready',
            regionClick: 'regionClick',
            select: 'select',
        }

        constructor(element: Element);
        constructor(elementId: string);
        constructor(elementOrId: any) {
            // did we get an element or an element id?
            if (typeof elementOrId === 'string') {
                this.element = document.getElementById(elementOrId);
            }
            else {
                this.element = elementOrId;
            }
        }

        element: Element;
        geoChart: google.visualization.GeoChart;
        private _promise = $.Deferred();

        draw(data: google.visualization.DataTable, options?: google.visualization.GeoChartOptions): JQueryPromise<void> {
            // if the chart does not yet exist, construct it and set
            // up a promise for its ready callback
            if (!this.geoChart) {
                this.geoChart = new google.visualization.GeoChart(this.element);
            }

            this.geoChart.draw(data, options);

            google.visualization.events.addListener(this.geoChart, GeoChart.eventName.ready, (): void => {
                this._promise.resolve();
            });

            return this._promise;
        }
    }
}