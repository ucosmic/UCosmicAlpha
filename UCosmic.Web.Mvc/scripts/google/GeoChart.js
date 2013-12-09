/// <reference path="../typings/google.visualization/google.visualization.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
var App;
(function (App) {
    (function (Google) {
        var GeoChart = (function () {
            function GeoChart(elementOrId) {
                this._promise = $.Deferred();
                // did we get an element or an element id?
                if (typeof elementOrId === 'string') {
                    this.element = document.getElementById(elementOrId);
                } else {
                    this.element = elementOrId;
                }
            }
            GeoChart.prototype.draw = function (data, options) {
                var _this = this;
                // if the chart does not yet exist, construct it and set
                // up a promise for its ready callback
                if (!this.geoChart) {
                    this.geoChart = new google.visualization.GeoChart(this.element);
                }

                this.geoChart.draw(data, options);

                google.visualization.events.addListener(this.geoChart, GeoChart.eventName.ready, function () {
                    _this._promise.resolve();
                });

                return this._promise;
            };
            GeoChart.eventName = {
                error: 'error',
                ready: 'ready',
                regionClick: 'regionClick',
                select: 'select'
            };
            return GeoChart;
        })();
        Google.GeoChart = GeoChart;
    })(App.Google || (App.Google = {}));
    var Google = App.Google;
})(App || (App = {}));
