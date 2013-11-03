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
        var SummaryRouteState = (function () {
            function SummaryRouteState() {
            }
            SummaryRouteState.areEqual = function (first, second) {
                if (!first && !second)
                    return true;
                if (!first && second)
                    return false;
                if (first && !second)
                    return false;
                var areEqual = true;
                if (first.pivot != second.pivot)
                    areEqual = false;
                if (first.placeId != second.placeId)
                    areEqual = false;
                return areEqual;
            };

            SummaryRouteState.isEmpty = function (state) {
                if (!state)
                    return true;
                return !state.pivot && !state.placeId;
            };

            SummaryRouteState.isIncomplete = function (state) {
                if (!state)
                    return true;
                return !state.pivot || !state.placeId;
            };
            return SummaryRouteState;
        })();
        ViewModels.SummaryRouteState = SummaryRouteState;

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
                if (!this.cached) {
                    this.loader().done(function (data) {
                        _this.cached = data;
                        _this._promise.resolve(_this.cached);
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
                this.placeId = ko.observable(parseInt(sessionStorage.getItem(Summary._placeIdKey)) || Summary._placeIdDefault);
                this._placeIdChanged = ko.computed(function () {
                    _this._onPlaceIdChanged();
                });
                this.hasPlaceId = ko.computed(function () {
                    var placeId = _this.placeId();
                    return (placeId && placeId > 1);
                });
                this.hasNoPlaceId = ko.computed(function () {
                    return !_this.hasPlaceId();
                });
                this.routeState = ko.computed(function () {
                    return {
                        pivot: _this.pivot(),
                        placeId: _this.placeId()
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
                this._geoChartDataTable = this._newGeoChartDataTable();
                this._geoChartOptions = {
                    // options passed when drawing geochart
                    displayMode: 'regions',
                    region: 'world',
                    keepAspectRatio: this.settings.chart.keepAspectRatio ? true : false,
                    height: this.settings.chart.keepAspectRatio ? 480 : 500,
                    colorAxis: {
                        minValue: 1,
                        colors: ['#dceadc', '#006400']
                    },
                    backgroundColor: '#acccfd'
                };
                this.arePlaceOverlaysVisible = ko.computed(function () {
                    var placeId = _this.placeId();
                    var isGeoChartReady = _this.isGeoChartReady();
                    if (!isGeoChartReady)
                        return false;
                    var areVisible = (typeof placeId === 'undefined' || placeId == null || isNaN(placeId) || placeId == 1 || placeId == 0) && isGeoChartReady;

                    if (Summary._isD3Defined() && _this.settings.chart.googleElementId) {
                        // overlay may already be drawn
                        var dInjectRootElementId = '{0}_place_overlays_root'.format(_this.settings.chart.googleElementId);
                        var dInjectRootSelection = d3.select('#{0}'.format(dInjectRootElementId));
                        if (dInjectRootSelection.length) {
                            if (areVisible) {
                                dInjectRootSelection.attr('style', '');
                            } else {
                                dInjectRootSelection.attr('style', 'display: none;');
                            }
                        }
                    }

                    return areVisible;
                });
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
                //#region Top Summary
                this.activitiesSummary = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?')
                };
                this.activitiesSummaryData = new DataCacher(function () {
                    return _this._loadActivitiesSummary();
                });
                //#endregion
                //#region Selected Place Summary
                this.selectedPlaceSummary = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?')
                };
                this._placeSelected = ko.computed(function () {
                    _this._onPlaceSelected();
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

            Summary.prototype._onPlaceIdChanged = function () {
                // compare value with what is stored in the session
                var value = this.placeId();
                var old = parseInt(sessionStorage.getItem(Summary._placeIdKey)) || undefined;

                if (value !== old) {
                    // save the new value to session storage
                    sessionStorage.setItem(Summary._placeIdKey, value.toString());
                }
            };

            //#endregion
            //#endregion
            //#region Routing
            Summary.prototype._getUrlState = function () {
                var params = location.search.indexOf('?') == 0 ? location.search.substr(1) : location.search;
                var state = App.deparam(params, true);
                return state;
            };

            Summary.prototype._onRouteStateChanged = function () {
                // this runs whenever an observable component of routeState changes
                // and will run at least once when the page loads, since it is a computed
                // there are 4 main scenarios we want to handle here:
                // 1.) when the route state matches the url state, update the historyjs state
                // 2.) when we have incomplete url state, replace current url based on route state
                // 3.) when historyjs state is empty and url state is complete, we have a url
                //     that should override the current route state values
                // 4.) all other cases mean user interaction, and should push a new url
                var routeState = this.routeState();
                var urlState = this._getUrlState();
                var areBindingsApplied = this.areBindingsApplied();

                if (SummaryRouteState.isIncomplete(urlState) || SummaryRouteState.areEqual(routeState, urlState)) {
                    HistoryJS.replaceState(routeState, '', '?' + $.param(routeState));
                } else if (!areBindingsApplied) {
                    this._updateState(urlState);
                } else {
                    HistoryJS.pushState(routeState, '', '?' + $.param(routeState));
                }
            };

            Summary.prototype._onRouteChanged = function () {
                // this runs whenever historyjs detects a statechange event
                var urlState = this._getUrlState();
                this._updateState(urlState);
                this._applyState();
            };

            Summary.prototype._updateState = function (state) {
                this.pivot(state.pivot);
                this.placeId(state.placeId);
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

            Summary.prototype._getPlacesForEnumeration = function () {
                var searchTarget = this.isPivotActivities() ? this.activitiesPlaceData : this.peoplePlaceData;

                return searchTarget ? searchTarget.cached : undefined;
            };

            Summary.prototype._getPlaceById = function (placeId, searchTarget) {
                searchTarget = searchTarget || this._getPlacesForEnumeration();
                if (!searchTarget)
                    return undefined;
                var place = Enumerable.From(searchTarget).FirstOrDefault(undefined, function (x) {
                    return x.placeId == placeId;
                });

                return place;
            };

            Summary.prototype._getPlaceByName = function (placeName, searchTarget) {
                searchTarget = searchTarget || this._getPlacesForEnumeration();
                if (!searchTarget)
                    return undefined;
                var place = Enumerable.From(searchTarget).FirstOrDefault(undefined, function (x) {
                    return x.placeName == placeName;
                });

                return place;
            };

            Summary.prototype._newGeoChartDataTable = function () {
                // create data table schema
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Place');
                dataTable.addColumn('number', 'Total');
                return dataTable;
            };

            Summary.prototype._initGeoChart = function () {
                var _this = this;
                // just draw the geochart to make sure something is displayed
                // need to make sure we wait until it's done though before drying to draw again
                var promise = $.Deferred();

                if (!this.isGeoChartReady()) {
                    this.geoChart.draw(this._geoChartDataTable, this._geoChartOptions).then(function () {
                        if (!_this.isGeoChartReady()) {
                            _this.isGeoChartReady(true);
                            _this.bindingsApplied.done(function () {
                                _this._svgInjectPlaceOverlays();
                                google.visualization.events.addListener(_this.geoChart.geoChart, 'select', function () {
                                    _this._onGeoChartSelect();
                                });
                                google.visualization.events.addListener(_this.geoChart.geoChart, 'regionClick', function (e) {
                                    _this._onGeoChartRegionClick(e);
                                });
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
                // the data may not yet be loaded, and if not, going to redraw after it is loaded
                var cachedData = this._getPlacesForEnumeration();
                var needsRedraw = !cachedData;

                // decide which part of the map to select
                var placeId = this.placeId();
                var place = this._getPlaceById(placeId);
                this._geoChartOptions.region = !placeId || placeId == 1 || !place || !place.countryCode ? 'world' : place.countryCode;

                // change aspect ratio based on placeId
                this._geoChartOptions.keepAspectRatio = placeId && placeId > 1 && place && place.countryCode ? false : this.settings.chart.keepAspectRatio ? true : false;

                // hit the server up for data and redraw
                this._initGeoChart().then(function () {
                    if (_this.isPivotPeople()) {
                        _this.peoplePlaceData.ready().done(function (places) {
                            if (needsRedraw) {
                                _this._drawGeoChart();
                                return;
                            }
                            _this._geoChartDataTable.removeRows(0, _this._geoChartDataTable.getNumberOfRows());

                            $.each(places, function (i, dataPoint) {
                                _this._geoChartDataTable.addRow([dataPoint.placeName, dataPoint.personIds.length]);
                            });

                            _this.geoChart.draw(_this._geoChartDataTable, _this._geoChartOptions).then(function () {
                                setTimeout(function () {
                                    _this._svgInjectPlaceOverlays();
                                }, 0);
                                _this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(_this.isPivotPeople() ? 'People' : 'Activities'));
                                _this._applyPeopleOverlayTotals(places);
                                _this._createOverlayTooltips();
                            });
                        });
                    } else {
                        _this.activitiesPlaceData.ready().done(function (places) {
                            if (needsRedraw) {
                                _this._drawGeoChart();
                                return;
                            }
                            _this._geoChartDataTable.removeRows(0, _this._geoChartDataTable.getNumberOfRows());

                            $.each(places, function (i, dataPoint) {
                                _this._geoChartDataTable.addRow([dataPoint.placeName, dataPoint.activityIds.length]);
                            });

                            _this.geoChart.draw(_this._geoChartDataTable, _this._geoChartOptions).then(function () {
                                setTimeout(function () {
                                    _this._svgInjectPlaceOverlays();
                                }, 0);
                                _this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(_this.isPivotPeople() ? 'People' : 'Activities'));
                                _this._applyActivitiesOverlayTotals(places);
                                _this._createOverlayTooltips();
                            });
                        });
                    }
                });
            };

            Summary.prototype._onGeoChartSelect = function () {
                var selection = this.geoChart.geoChart.getSelection();
                if (selection && selection.length) {
                    var rowIndex = selection[0].row;

                    // first column of the data table has the place name (country name)
                    var placeName = this._geoChartDataTable.getFormattedValue(rowIndex, 0);
                    var place = this._getPlaceByName(placeName);
                    if (place) {
                        this.placeId(place.placeId);
                    }
                }
            };

            Summary.prototype._onGeoChartRegionClick = function (e) {
                // this will fire even when the country clicked has total === zero
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
                var areOverlaysVisible = this.arePlaceOverlaysVisible();
                if (!areOverlaysVisible)
                    dInjectRoot.attr('style', 'display: none;');

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

            Summary.prototype._onPlaceSelected = function () {
                var _this = this;
                var placeId = this.placeId();
                var areBindingsApplied = this.areBindingsApplied();
                if (placeId != 1 && areBindingsApplied) {
                    $.when(this.activitiesPlaceData.ready(), this.peoplePlaceData.ready()).then(function () {
                        var peoplePlace = _this._getPlaceById(placeId, _this.peoplePlaceData.cached);
                        var activitiesPlace = _this._getPlaceById(placeId, _this.activitiesPlaceData.cached);
                        var place = peoplePlace || activitiesPlace;
                        if (peoplePlace && peoplePlace.placeName) {
                            _this.selectedPlaceSummary.personCount(peoplePlace.personIds.length.toString());
                        }
                        if (activitiesPlace && activitiesPlace.placeName) {
                            _this.selectedPlaceSummary.activityCount(activitiesPlace.activityIds.length.toString());
                        }
                        if (place && place.placeName) {
                            _this.selectedPlaceSummary.locationCount(place.placeName);
                        }
                    });
                } else if (areBindingsApplied) {
                    this.selectedPlaceSummary.personCount('?');
                    this.selectedPlaceSummary.activityCount('?');
                    this.selectedPlaceSummary.locationCount('?');
                }
            };

            Summary.prototype.clearPlaceSelection = function () {
                this.placeId(1);
            };
            Summary._googleVisualizationLoadedPromise = $.Deferred();

            Summary._pivotDefault = DataGraphPivot.activities;
            Summary._pivotKey = 'EmployeeSummaryPivot';

            Summary._placeIdDefault = 1;
            Summary._placeIdKey = 'EmployeeSummaryPlaceId';
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(Employees.ViewModels || (Employees.ViewModels = {}));
    var ViewModels = Employees.ViewModels;
})(Employees || (Employees = {}));
