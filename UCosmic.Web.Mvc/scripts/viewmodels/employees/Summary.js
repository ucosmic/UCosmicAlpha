var Employees;
(function (Employees) {
    /// <reference path="../../typings/googlecharts/google.charts.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../google/GeoChart.ts" />
    (function (ViewModels) {
        var ImageSwapper = (function () {
            function ImageSwapper() {
                var _this = this;
                this._state = ko.observable('up');
                this.isUp = ko.computed(function () {
                    return _this._state() == 'up';
                });
                this.isHover = ko.computed(function () {
                    return _this._state() == 'hover';
                });
            }
            ImageSwapper.prototype.mouseover = function (self, e) {
                this._state('hover');
            };

            ImageSwapper.prototype.mouseout = function (self, e) {
                this._state('up');
            };
            return ImageSwapper;
        })();
        ViewModels.ImageSwapper = ImageSwapper;

        var Summary = (function () {
            //#endregion
            //#region Construction
            function Summary(settings) {
                this.settings = settings;
                this.isGeoChartReady = ko.observable(false);
                //#endregion
                //#region Extra Text Images
                this.pacificOceanSwapper = new ImageSwapper();
                this.gulfOfMexicoSwapper = new ImageSwapper();
                this.caribbeanSeaSwapper = new ImageSwapper();
                this.atlanticOceanSwapper = new ImageSwapper();
                this.southernOceanSwapper = new ImageSwapper();
                this.arcticOceanSwapper = new ImageSwapper();
                this.indianOceanSwapper = new ImageSwapper();
                this.antarcticaSwapper = new ImageSwapper();
                // CONSTRUCTOR
                this.geoChart = new App.Google.GeoChart(document.getElementById('google_geochart'));
                this._drawGeoChart();
            }
            Summary.loadGoogleVisualization = function () {
                var _this = this;
                // this is necessary to load all of the google visualization API's used by this
                // viewmodel. additionally, https://www.google.com/jsapi script must be present
                google.load('visualization', '1', { 'packages': ['corechart', 'geochart'] });

                google.setOnLoadCallback(function () {
                    _this._googleVisualizationLoadedPromise.resolve();
                });
                return this._googleVisualizationLoadedPromise;
            };

            Summary.prototype._drawGeoChart = function () {
                var _this = this;
                var data = google.visualization.arrayToDataTable([
                    ['Country', 'Popularity'],
                    ['Germany', 200],
                    ['United States', 300],
                    ['Brazil', 400],
                    ['Canada', 500],
                    ['France', 600],
                    ['RU', 700]
                ]);

                var options = {
                    backgroundColor: '#acccfd',
                    keepAspectRatio: false
                };
                this.geoChart.draw(data, options).done(function () {
                    _this.isGeoChartReady(true);
                });
            };
            Summary._googleVisualizationLoadedPromise = $.Deferred();
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(Employees.ViewModels || (Employees.ViewModels = {}));
    var ViewModels = Employees.ViewModels;
})(Employees || (Employees = {}));
