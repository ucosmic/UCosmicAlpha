var Employees;
(function (Employees) {
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/HistoryJS.ts" />
    /// <reference path="../../typings/history/history.d.ts" />
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
        (function (DataGraphPivot) {
            DataGraphPivot[DataGraphPivot["unknown"] = 0] = "unknown";
            DataGraphPivot[DataGraphPivot["people"] = 1] = "people";
            DataGraphPivot[DataGraphPivot["activities"] = 2] = "activities";
            DataGraphPivot[DataGraphPivot["degress"] = 3] = "degress";
        })(ViewModels.DataGraphPivot || (ViewModels.DataGraphPivot = {}));
        var DataGraphPivot = ViewModels.DataGraphPivot;

        var ImageSwapper = (function () {
            function ImageSwapper(noHoverSrc, hoverSrc) {
                var _this = this;
                this.hoverSrc = ko.observable('');
                this.noHoverSrc = ko.observable('');
                this._state = ko.observable('none');
                this.isNoHover = ko.computed(function () {
                    return _this._state() == 'none';
                });
                this.isHover = ko.computed(function () {
                    return _this._state() == 'hover';
                });
                this.src = ko.computed(function () {
                    return _this.isHover() ? _this.hoverSrc() : _this.noHoverSrc();
                });
                this.noHoverSrc(noHoverSrc || '');
                this.hoverSrc(hoverSrc || '');
            }
            ImageSwapper.prototype.onMouseEnter = function (self, e) {
                this._state('hover');
            };

            ImageSwapper.prototype.onMouseLeave = function (self, e) {
                this._state('none');
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
            //#region Construction & Binding
            function Summary(settings) {
                var _this = this;
                this.settings = settings;
                this._bindingsApplied = $.Deferred();
                this.bindingsApplied = this._bindingsApplied;
                this.areBindingsApplied = ko.observable(false);
                this.pivot = ko.observable(parseInt(sessionStorage.getItem(Summary._pivotKey)) || Summary._pivotDefault);
                this._pivotChanged = ko.computed(function () {
                    _this._onPivotChanged();
                });
                this.isPivotPeople = ko.computed(function () {
                    return _this.pivot() == DataGraphPivot.people;
                });
                this.isPivotActivities = ko.computed(function () {
                    return _this.pivot() == DataGraphPivot.activities;
                });
                //#endregion
                //#endregion
                //#region Routing
                this.routeState = ko.computed(function () {
                    return {
                        pivot: _this.pivot()
                    };
                });
                this._routeStateChanged = ko.computed(function () {
                    _this._onRouteStateChanged();
                }).extend({ throttle: 1 });
                //#endregion
                //#region Pivot Data
                this.hasPivotData = ko.observable(false);
                this.activitiesPlaceData = new DataCacher(function () {
                    return _this._loadActivitiesPlaceData();
                });
                this.peoplePlaceData = new DataCacher(function () {
                    return _this._loadPeoplePlaceData();
                });
                //#endregion
                //#region Google GeoChart
                this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.chart.googleElementId));
                this.geoChartSpinner = new App.Spinner(new App.SpinnerOptions(400, true));
                this.isGeoChartReady = ko.observable(false);
                this.isD3Defined = ko.computed(function () {
                    return Summary._isD3Defined();
                });
                this.isD3Undefined = ko.computed(function () {
                    return !Summary._isD3Defined();
                });
                //#endregion
                //#region Tooltips
                this._tooltips = ko.observableArray();
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
                // parse the place overlays
                this._parsePlaceOverlays();

                // bind history.js to statechange events
                HistoryJS.Adapter.bind(window, 'statechange', function () {
                    _this._onRouteChanged();
                });

                // begin loading data
                this.activitiesSummaryData.ready();
                this._initGeoChart();

                // need to fire this once because route changes before history is bound
                this.bindingsApplied.done(function () {
                    _this._applyState();
                });
            }
            Summary.loadGoogleVisualization = function () {
                // this is necessary to load all of the google visualization API's used by this
                // viewmodel. additionally, https://www.google.com/jsapi script must be present
                google.load('visualization', '1', { 'packages': ['corechart', 'geochart'] });

                google.setOnLoadCallback(function () {
                    Summary._googleVisualizationLoadedPromise.resolve();
                });
                return Summary._googleVisualizationLoadedPromise;
            };

            Summary.prototype.applyBindings = function () {
                // did we get an element or an element id?
                var element = this.settings.element;
                if (element) {
                    ko.applyBindings(this, element);
                }
                this.areBindingsApplied(true);
                this._bindingsApplied.resolve();
            };

            Summary.prototype._onPivotChanged = function () {
                // compare value with what is stored in the session
                var value = this.pivot();
                var old = parseInt(sessionStorage.getItem(Summary._pivotKey)) || 0;

                if (value !== old) {
                    // save the new value to session storage
                    sessionStorage.setItem(Summary._pivotKey, value.toString());
                }
            };

            Summary.prototype.pivotPeople = function () {
                this.pivot(DataGraphPivot.people);
            };

            Summary.prototype.pivotActivities = function () {
                this.pivot(DataGraphPivot.activities);
            };

            Summary.prototype.isPivot = function (pivot) {
                return this.pivot() == pivot;
            };

            Summary.prototype._onRouteStateChanged = function () {
                var routeState = this.routeState();
                var historyState = HistoryJS.getState();
                if (!historyState.data.pivot) {
                    HistoryJS.replaceState(routeState, document.title, '?' + $.param(routeState));
                } else {
                    HistoryJS.pushState(routeState, document.title, '?' + $.param(routeState));
                }
            };

            Summary.prototype._onRouteChanged = function () {
                var state = HistoryJS.getState();
                var data = state.data;
                this.pivot(data.pivot);
                this._applyState();
            };

            Summary.prototype._applyState = function () {
                this._drawGeoChart();
            };

            Summary.prototype._loadActivitiesPlaceData = function () {
                var _this = this;
                // calling .ready() on activitiesPlaceData invokes this
                var promise = $.Deferred();
                var request = {
                    countries: true,
                    placeIds: this._getOverlayPlaceIds()
                };
                this.geoChartSpinner.start();
                Employees.Servers.ActivitiesPlaces(this.settings.tenantDomain, request).done(function (places) {
                    _this.hasPivotData(places && places.length > 0);
                    promise.resolve(places);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load activity location summary data.', true);
                    promise.reject();
                }).always(function () {
                    _this.geoChartSpinner.stop();
                });
                return promise;
            };

            Summary.prototype._loadPeoplePlaceData = function () {
                var _this = this;
                // calling .ready() on peoplePlaceData invokes this
                var promise = $.Deferred();
                var request = {
                    countries: true,
                    placeIds: this._getOverlayPlaceIds()
                };
                this.geoChartSpinner.start();
                Employees.Servers.PeoplePlaces(this.settings.tenantDomain, request).done(function (places) {
                    _this.hasPivotData(places && places.length > 0);
                    promise.resolve(places);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load employee location summary data.', true);
                    promise.reject();
                }).always(function () {
                    _this.geoChartSpinner.stop();
                });
                return promise;
            };

            Summary._geoChartOptions = function (settings) {
                // options passed when drawing geochart
                var options = {
                    displayMode: 'regions',
                    region: 'world',
                    keepAspectRatio: settings.chart.keepAspectRatio ? true : false,
                    height: settings.chart.keepAspectRatio ? 480 : 500,
                    colorAxis: {
                        minValue: 1,
                        colors: ['#dceadc', '#006400']
                    },
                    backgroundColor: '#acccfd'
                };
                return options;
            };

            Summary.prototype._newGeoChartDataTable = function () {
                // create data table schema
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Place');
                dataTable.addColumn('number', 'Total {0}'.format(this.isPivotPeople() ? 'People' : 'Activities'));
                return dataTable;
            };

            Summary.prototype._initGeoChart = function () {
                var _this = this;
                // just draw the geochart to make sure something is displayed
                // need to make sure we wait until it's done though before drying to draw again
                var promise = $.Deferred();

                if (!this.isGeoChartReady()) {
                    var dataTable = this._newGeoChartDataTable();
                    var options = Summary._geoChartOptions(this.settings);
                    this.geoChart.draw(dataTable, options).then(function () {
                        if (!_this.isGeoChartReady()) {
                            _this.isGeoChartReady(true);
                            _this.bindingsApplied.done(function () {
                                _this._svgInjectPlaceOverlays();
                            });
                        }
                        promise.resolve();
                    });
                } else {
                    promise.resolve();
                }
                return promise;
            };

            Summary.prototype._drawGeoChart = function () {
                var _this = this;
                var options = Summary._geoChartOptions(this.settings);
                var dataTable = this._newGeoChartDataTable();

                // hit the server up for data and redraw
                this._initGeoChart().then(function () {
                    if (_this.isPivotPeople()) {
                        _this.peoplePlaceData.ready().done(function (places) {
                            $.each(places, function (i, dataPoint) {
                                dataTable.addRow([dataPoint.placeName, dataPoint.personIds.length]);
                            });

                            _this.geoChart.draw(dataTable, options).then(function () {
                                _this._applyPeopleOverlayTotals(places);
                                _this._createOverlayTooltips();
                            });
                        });
                    } else {
                        _this.activitiesPlaceData.ready().done(function (places) {
                            $.each(places, function (i, dataPoint) {
                                dataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                            });

                            _this.geoChart.draw(dataTable, options).then(function () {
                                _this._applyActivitiesOverlayTotals(places);
                                _this._createOverlayTooltips();
                            });
                        });
                    }
                });
            };

            Summary.prototype._parsePlaceOverlays = function () {
                var _this = this;
                if (this.placeOverlays)
                    return;
                this.placeOverlays = ko.observableArray();
                var overlays = $('#{0} .overlays .places .data'.format(this.settings.chart.boxElementId)).children();
                $.each(overlays, function (i, overlay) {
                    var jOverlay = $(overlay);
                    var iOverlay = {
                        total: ko.observable(0),
                        placeId: parseInt(jOverlay.data('place-id')),
                        title: jOverlay.attr('title'),
                        className: jOverlay.attr('class'),
                        imageSwapper: new ImageSwapper(jOverlay.find('img.no-hover').first().attr('src'), jOverlay.find('img.hover').first().attr('src'))
                    };
                    _this.placeOverlays.push(iOverlay);
                });
            };

            Summary.prototype._getOverlayPlaceIds = function () {
                var placeIds = Enumerable.From(this.placeOverlays()).Select(function (x) {
                    return x.placeId;
                }).ToArray();
                return placeIds;
            };

            Summary._isD3Defined = //#endregion
            //#region SVG Injection
            function () {
                return typeof d3 !== 'undefined';
            };

            Summary.prototype._svgInjectPlaceOverlays = function () {
                var _this = this;
                if (!Summary._isD3Defined() || !this.settings.chart.googleElementId || !this.settings.chart.boxElementId)
                    return;

                // overlay may already be drawn
                var dInjectRootElementId = '{0}_place_overlays_root'.format(this.settings.chart.googleElementId);
                if ($('#{0}'.format(dInjectRootElementId)).length)
                    return;

                // svg structure is as follows:
                //  svg
                //      > defs
                //      > g
                //          > rect
                //          > g - map
                //              <----- inject new node here
                //          > g - legend
                //          > g - ?
                //          > g - tooltips
                // use d3 to select the first root g element from the geochart
                var dGoogleG = d3.select('#{0} svg > g'.format(this.settings.chart.googleElementId));

                // all of the overlays will become children of this g element
                var dInjectRoot = dGoogleG.append('g').attr('id', dInjectRootElementId);

                // iterate over the parsed place overlays
                // first, need to show the data root in order to get valid positions
                var jContainer = $('#{0} .overlays .places .data'.format(this.settings.chart.boxElementId));
                jContainer.show();

                var overlays = this.placeOverlays();
                $.each(overlays, function (i, overlay) {
                    _this._svgInjectPlaceOverlay(dInjectRoot, overlay);
                });

                jContainer.hide();

                // now use jQuery to rearrange the order of the elements
                $('#{0} svg > g > g:last-child'.format(this.settings.chart.googleElementId)).insertAfter('#{0} svg > g > g:nth-child(2)'.format(this.settings.chart.googleElementId));
            };

            Summary.prototype._svgInjectPlaceOverlay = function (root, overlay) {
                // create a new d3 container for this overlay
                var jOverlay = $('#{0} .overlays .places .data .{1}'.format(this.settings.chart.boxElementId, overlay.className));
                var dOverlay = root.append('g').attr('class', overlay.className);

                // compute position based on data element positions
                var x = jOverlay.position().left;
                var y = jOverlay.position().top;
                var width = jOverlay.outerWidth();
                var height = jOverlay.outerHeight();

                // append a no-hover d3 image to the overlay g element
                var noHoverImage = dOverlay.append('image').attr('xlink:href', overlay.imageSwapper.noHoverSrc()).attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('class', 'no-hover');

                // append a hover d3 image to the overlay g element
                var hoverImage = dOverlay.append('image').attr('xlink:href', overlay.imageSwapper.hoverSrc()).attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('class', 'hover').attr('style', 'display: none;');

                this._svgApplyPlaceOverlayHover(overlay, noHoverImage, hoverImage);

                return dOverlay;
            };

            Summary.prototype._svgApplyPlaceOverlayHover = function (overlay, noHover, hover) {
                // make the ui images transparent
                overlay.imageSwapper.hoverSrc(this.settings.chart.transparentImgSrc);
                overlay.imageSwapper.noHoverSrc(this.settings.chart.transparentImgSrc);

                // enable svg image hover swaps
                overlay.imageSwapper.isHover.subscribe(function (newValue) {
                    if (newValue) {
                        hover.attr('style', '');
                        noHover.attr('style', 'display:none');
                    } else {
                        noHover.attr('style', '');
                        hover.attr('style', 'display:none');
                    }
                });
            };

            Summary.prototype._createOverlayTooltips = function () {
                var _this = this;
                var tooltips = this._tooltips();

                if (tooltips.length) {
                    // destroy all of the tooltips
                    $.each(this._tooltips(), function (i, tooltip) {
                        tooltip.tooltip('destroy');
                    });
                    this._tooltips([]);
                }

                var overlays = this.placeOverlays();
                $.each(overlays, function (i, overlay) {
                    // the tooltips are in the place ui
                    var jOverlay = $('#{0} .overlays .places .ui .{1}'.format(_this.settings.chart.boxElementId, overlay.className));
                    var tooltip = jOverlay.find('.tooltip');
                    var content = tooltip.html() || 'tooltip';
                    _this._createOverlayTooltip(jOverlay, content);
                    _this._tooltips.push(jOverlay);
                });
            };

            Summary.prototype._createOverlayTooltip = function (target, content) {
                target.tooltip({
                    content: content || 'tooltip content goes here',
                    items: '*',
                    track: true,
                    show: false,
                    hide: false,
                    tooltipClass: 'geochart',
                    position: {
                        my: 'right-15 bottom-15',
                        of: '.ui-tooltip-content',
                        within: '#{0}'.format(this.settings.chart.googleElementId)
                    },
                    open: function (e, ui) {
                        // get the width of the tooltip
                        var width = ui.tooltip.find('.ui-tooltip-content').outerWidth();

                        // set the width of the container
                        ui.tooltip.css({ width: '{0}px'.format(width) });
                    }
                });
            };

            Summary.prototype._applyActivitiesOverlayTotals = function (places) {
                var placeOverlays = this.placeOverlays();
                $.each(placeOverlays, function (i, overlay) {
                    var total = Enumerable.From(places).Where(function (x) {
                        return x.placeId == overlay.placeId;
                    }).Sum(function (x) {
                        return x.activityIds.length;
                    });
                    overlay.total(total);
                });
            };

            Summary.prototype._applyPeopleOverlayTotals = function (places) {
                var placeOverlays = this.placeOverlays();
                $.each(placeOverlays, function (i, overlay) {
                    var total = Enumerable.From(places).Where(function (x) {
                        return x.placeId == overlay.placeId;
                    }).Sum(function (x) {
                        return x.personIds.length;
                    });
                    overlay.total(total);
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

            Summary._pivotDefault = DataGraphPivot.activities;
            Summary._pivotKey = 'EmployeeSummaryPivot';
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(Employees.ViewModels || (Employees.ViewModels = {}));
    var ViewModels = Employees.ViewModels;
})(Employees || (Employees = {}));
