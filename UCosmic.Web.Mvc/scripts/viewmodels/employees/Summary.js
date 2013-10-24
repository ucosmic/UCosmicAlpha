var Employees;
(function (Employees) {
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../../typings/googlecharts/google.charts.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/linq/linq.d.ts" />
    /// <reference path="../../google/GeoChart.ts" />
    /// <reference path="Server.ts" />
    /// <reference path="Models.d.ts" />
    /// <reference path="../../app/App.ts" />
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

        var DataCacher = (function () {
            function DataCacher(loader) {
                this.loader = loader;
                this._promise = $.Deferred();
            }
            DataCacher.prototype.ready = function () {
                var _this = this;
                if (!this._response) {
                    this.loader().done(function (data) {
                        _this._response = data;
                        _this._promise.resolve(_this._response);
                    }).fail(function (xhr) {
                        _this._promise.reject();
                    });
                }
                return this._promise;
            };
            return DataCacher;
        })();
        ViewModels.DataCacher = DataCacher;

        var Summary = (function () {
            //#endregion
            //#region Construction
            function Summary(settings) {
                var _this = this;
                this.settings = settings;
                this.geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
                this.isGeoChartReady = ko.observable(false);
                this.activityPlaceData = new DataCacher(function () {
                    return _this._loadActivityPlaceData();
                });
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
                //#endregion
                //#region Summaries
                this.activitiesSummary = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?')
                };
                this.activitiesSummaryData = new DataCacher(function () {
                    return _this._loadActivitiesSummary();
                });
                // CONSTRUCTOR
                this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.geoChartElementId));
                this._drawGeoChart();
                this.activitiesSummaryData.ready();
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

            Summary.prototype._loadActivityPlaceData = function () {
                var _this = this;
                var promise = $.Deferred();
                var request = {
                    countries: true
                };
                this.geoChartSpinner.start();
                Employees.Servers.ActivityPlaces(this.settings.tenantDomain, request).done(function (places) {
                    promise.resolve(places);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load activity location summary data.', true);
                    promise.reject();
                }).always(function () {
                    _this.geoChartSpinner.stop();
                });
                return promise;
            };

            Summary.prototype._drawGeoChart = function () {
                var _this = this;
                // options passed when drawing geochart
                var options = {
                    displayMode: 'regions',
                    region: 'world',
                    keepAspectRatio: false,
                    colorAxis: {
                        minValue: 1,
                        colors: ['#dceadc', '#006400']
                    },
                    backgroundColor: '#acccfd'
                };

                // create data table schema
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Place');
                dataTable.addColumn('number', 'Total Activities');

                // go ahead and draw the chart with empty data to make sure its ready
                this.geoChart.draw(dataTable, options).then(function () {
                    _this.isGeoChartReady(true);

                    // now hit the server up for data and redraw
                    _this.activityPlaceData.ready().done(function (places) {
                        $.each(places, function (i, dataPoint) {
                            dataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                        });

                        _this.geoChart.draw(dataTable, options);
                    });
                });
            };

            Summary.prototype._loadActivitiesSummary = function () {
                var _this = this;
                var promise = $.Deferred();
                Employees.Servers.ActivitiesSummary(this.settings.tenantDomain).done(function (summary) {
                    ko.mapping.fromJS(summary, {}, _this.activitiesSummary);
                    promise.resolve(summary);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load activity total summary data.', true);
                    promise.reject();
                });
                return promise;
            };
            Summary._googleVisualizationLoadedPromise = $.Deferred();
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(Employees.ViewModels || (Employees.ViewModels = {}));
    var ViewModels = Employees.ViewModels;
})(Employees || (Employees = {}));
