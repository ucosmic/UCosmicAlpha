var App;
(function (App) {
    /// <reference path="../typings/google.visualization/google.visualization.d.ts" />
    /// <reference path="../typings/jquery/jquery.d.ts" />
    (function (Google) {
        var ColumnChart = (function () {
            function ColumnChart(elementOrId) {
                this._promise = $.Deferred();
                if (typeof elementOrId === 'string') {
                    this.element = document.getElementById(elementOrId);
                } else {
                    this.element = elementOrId;
                }
            }
            ColumnChart.prototype.draw = function (data, options) {
                var _this = this;
                if (!this.columnChart) {
                    this.columnChart = new google.visualization.ColumnChart(this.element);
                }

                this.columnChart.draw(data, options);

                google.visualization.events.addListener(this.columnChart, ColumnChart.eventName.ready, function () {
                    _this._promise.resolve();
                });

                return this._promise;
            };
            ColumnChart.eventName = {
                animationfinish: 'animationfinish',
                error: 'error',
                onmouseover: 'onmouseover',
                onmouseout: 'onmouseout',
                ready: 'ready',
                select: 'select'
            };
            return ColumnChart;
        })();
        Google.ColumnChart = ColumnChart;
    })(App.Google || (App.Google = {}));
    var Google = App.Google;
})(App || (App = {}));
//# sourceMappingURL=ColumnChart.js.map
