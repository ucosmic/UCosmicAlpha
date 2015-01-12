var App;
(function (App) {
    var Google;
    (function (Google) {
        var GeoChart = (function () {
            function GeoChart(elementOrId) {
                this._promise = $.Deferred();
                if (typeof elementOrId === 'string') {
                    this.element = document.getElementById(elementOrId);
                }
                else {
                    this.element = elementOrId;
                }
            }
            GeoChart.prototype.draw = function (data, options) {
                var _this = this;
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
                select: 'select',
            };
            return GeoChart;
        })();
        Google.GeoChart = GeoChart;
    })(Google = App.Google || (App.Google = {}));
})(App || (App = {}));
