/// <reference path="../typings/google.visualization/google.visualization.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />

module App.Google {

    export interface LineChartEventName {
        error: string;
        ready: string;
        select: string;
    }

    export class LineChart {

        static eventName: LineChartEventName = {
            animationfinish: 'animationfinish',
            error: 'error',
            onmouseover: 'onmouseover',
            onmouseout: 'onmouseout',
            ready: 'ready',
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
        lineChart: google.visualization.LineChart;
        private _promise = $.Deferred();

        draw(data: google.visualization.DataTable, options?: google.visualization.LineChartOptions): JQueryPromise<void>;
        draw(data: google.visualization.DataView, options?: google.visualization.LineChartOptions): JQueryPromise<void>;
        draw(data: any, options?: google.visualization.LineChartOptions): JQueryPromise<void> {
            // if the chart does not yet exist, construct it and set
            // up a promise for its ready callback
            if (!this.lineChart) {
                this.lineChart = new google.visualization.LineChart(this.element);
            }

            this.lineChart.draw(data, options);

            google.visualization.events.addListener(this.lineChart, LineChart.eventName.ready, (): void => {
                this._promise.resolve();
            });

            return this._promise;
        }
    }
}