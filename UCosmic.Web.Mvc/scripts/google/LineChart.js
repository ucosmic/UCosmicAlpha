var App;
(function (App) {
    (function (Google) {
        var LineChart = (function () {
            function LineChart(elementOrId) {
                this._promise = $.Deferred();
                if (typeof elementOrId === 'string') {
                    this.element = document.getElementById(elementOrId);
                } else {
                    this.element = elementOrId;
                }
            }
            LineChart.prototype.draw = function (data, options) {
                var _this = this;
                if (!this.lineChart) {
                    this.lineChart = new google.visualization.LineChart(this.element);
                }

                this.lineChart.draw(data, options);

                google.visualization.events.addListener(this.lineChart, LineChart.eventName.ready, function () {
                    _this._promise.resolve();
                });

                return this._promise;
            };
            LineChart.eventName = {
                animationfinish: 'animationfinish',
                error: 'error',
                onmouseover: 'onmouseover',
                onmouseout: 'onmouseout',
                ready: 'ready',
                select: 'select'
            };
            return LineChart;
        })();
        Google.LineChart = LineChart;
    })(App.Google || (App.Google = {}));
    var Google = App.Google;
})(App || (App = {}));
