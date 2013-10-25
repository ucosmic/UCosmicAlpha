var Employees;
(function (Employees) {
    /// <reference path="../../typings/d3/d3.d.ts" />
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
            ImageSwapper.prototype.onMouseEnter = function (self, e) {
                this._state('hover');
            };

            ImageSwapper.prototype.onMouseLeave = function (self, e) {
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
            //#region Construction & Initialization
            function Summary(settings) {
                var _this = this;
                this.settings = settings;
                this._bindingsApplied = $.Deferred();
                this.bindingsApplied = this._bindingsApplied;
                this.geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
                this.isGeoChartReady = ko.observable(false);
                this.activityPlaceData = new DataCacher(function () {
                    return _this._loadActivityPlaceData();
                });
                this.isD3Undefined = ko.computed(function () {
                    return !Summary._isD3Defined();
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
                this.activityPlaceData.ready();
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

            Summary.prototype.applyBindings = function () {
                // did we get an element or an element id?
                var element = this.settings.element;
                if (!element) {
                    element = document.getElementById(this.settings.elementId);
                }
                ko.applyBindings(this, element);
                this._bindingsApplied.resolve();

                this._drawGeoChart();
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
                    keepAspectRatio: this.settings.geoChartKeepAspectRatio ? true : false,
                    height: this.settings.geoChartKeepAspectRatio ? 480 : 500,
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

                    // svg injection depends on both the chart being ready
                    // and bindings having been applied
                    _this.bindingsApplied.done(function () {
                        _this._injectGeoChartOverlays();
                    });

                    // now hit the server up for data and redraw
                    _this.activityPlaceData.ready().done(function (places) {
                        $.each(places, function (i, dataPoint) {
                            dataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                        });

                        _this.geoChart.draw(dataTable, options);
                    });
                });
            };

            Summary._isD3Defined = //#endregion
            //#region SVG Injection
            function () {
                return typeof d3 !== 'undefined';
            };

            Summary.prototype._injectGeoChartOverlays = function () {
                if (!Summary._isD3Defined() || !this.settings.geoChartWaterOverlaysElementId)
                    return;

                // svg structure is as follows:
                //  svg
                //      > defs
                //      > g
                //          > rect
                //          > g - map
                //          > g - legend
                //          > g - ?
                //          > g - tooltips
                // use d3 to select the first root g element from the geochart
                var rootG = d3.select('#{0} svg > g'.format(this.settings.geoChartElementId));

                // append a new g element to the geochart's root g element
                // all of the overlays will become children of this g element
                var parentG = rootG.append('g').attr('id', '{0}_root'.format(this.settings.geoChartWaterOverlaysElementId));

                // iterate over the children of the overlays element
                // in the markup the overlays is a UL with each overlay as an LI
                // (however the following code does not take that into account)
                var container = $('#{0}'.format(this.settings.geoChartWaterOverlaysElementId));
                container.show();
                var overlays = container.children();
                $.each(overlays, function (i, overlay) {
                    // create a new d3 container for this overlay
                    var dOverlay = parentG.append('g');
                    var jOverlay = $(overlay);
                    $.each($(overlay).children(), function (i, child) {
                        var jChild = $(child);

                        if (jChild.prop('tagName').toUpperCase() !== 'IMG')
                            return;

                        // need to compute position in case it is defined in a css class
                        // it is the parent's offset (the overlay's offset) that determines both x and y
                        var x = jOverlay.position().left;
                        var y = jOverlay.position().top;

                        // width and height will be accessible when shown
                        var width = jChild.css('width');
                        var height = jChild.css('height');
                        var src = jChild.attr('src');
                        var display = jChild.css('display');

                        // append a d3 image to the overlay g element
                        var image = dOverlay.append('image').attr('xlink:href', src).attr('x', x).attr('y', y).attr('width', width).attr('height', height);

                        if (display && display.toLowerCase() == 'none') {
                            image.attr('style', 'display: none;');
                        }
                    });

                    // TODO: move this to a separate handler
                    // the images are now in the SVG, but they have no mouse events
                    // use d3 to iterate over each svg overlay
                    $.each($(dOverlay[0][0]).children(), function (i, child) {
                        // the child is an SVG image, and has 1 SVG image sibling
                        var jChild = $(child);
                        var dChild = d3.select(child);
                        var display = jChild.css('display');
                        var sibling = jChild.siblings('image');

                        // put mouseleave on the hidden element (it will be the hot one)
                        var eventName = display && display.toLowerCase() == 'none' ? 'mouseleave' : 'mouseenter';
                        dChild.on(eventName, function () {
                            jChild.hide();
                            sibling.show();
                        });

                        // nudge down caribbean
                        var src = dChild.attr('xlink:href');
                        if (src && src.toLowerCase().indexOf('caribbean') > 0) {
                            var oldY = dChild.attr('y');
                            var newY = parseInt(oldY) + 5;
                            dChild.attr('y', newY);
                        }
                    });
                });

                container.hide();

                // now rearrange the g order
                // now use jQuery to rearrange the order of the elements
                $('#google_geochart svg > g > g:last-child').insertAfter('#google_geochart svg > g > g:nth-child(2)').removeAttr('id');
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
