module App.Google {

    export interface ColumnChartEventName {
        error: string;
        ready: string;
        select: string;
    }

    export class ColumnChart {

        static eventName: ColumnChartEventName = {
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
        columnChart: google.visualization.ColumnChart;
        private _promise = $.Deferred();

        draw(data: google.visualization.DataTable, options?: google.visualization.ColumnChartOptions): JQueryPromise<void>;
        draw(data: google.visualization.DataView, options?: google.visualization.ColumnChartOptions): JQueryPromise<void>;
        draw(data: any, options?: google.visualization.ColumnChartOptions): JQueryPromise<void> {
            // if the chart does not yet exist, construct it and set
            // up a promise for its ready callback
            if (!this.columnChart) {
                this.columnChart = new google.visualization.ColumnChart(this.element);
            }

            this.columnChart.draw(data, options);

            google.visualization.events.addListener(this.columnChart, ColumnChart.eventName.ready, (): void => {
                this._promise.resolve();
            });

            return this._promise;
        }
    }
}