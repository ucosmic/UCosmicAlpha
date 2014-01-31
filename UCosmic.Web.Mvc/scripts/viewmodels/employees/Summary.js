var Employees;
(function (Employees) {
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
                if (first.establishmentId != second.establishmentId)
                    areEqual = false;
                return areEqual;
            };

            SummaryRouteState.isEmpty = function (state) {
                if (!state)
                    return true;
                return !state.pivot && !state.placeId && !state.establishmentId;
            };

            SummaryRouteState.isIncomplete = function (state) {
                if (!state)
                    return true;
                return !state.pivot || !state.placeId || !state.establishmentId;
            };
            return SummaryRouteState;
        })();
        ViewModels.SummaryRouteState = SummaryRouteState;

        (function (DataGraphPivot) {
            DataGraphPivot[DataGraphPivot["unknown"] = 0] = "unknown";
            DataGraphPivot[DataGraphPivot["activities"] = 1] = "activities";
            DataGraphPivot[DataGraphPivot["people"] = 2] = "people";
            DataGraphPivot[DataGraphPivot["degress"] = 3] = "degress";
        })(ViewModels.DataGraphPivot || (ViewModels.DataGraphPivot = {}));
        var DataGraphPivot = ViewModels.DataGraphPivot;

        var Summary = (function () {
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
                    return _this.pivot() == 2 /* people */;
                });
                this.isPivotActivities = ko.computed(function () {
                    return _this.pivot() == 1 /* activities */;
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
                this.establishmentId = ko.observable(parseInt(sessionStorage.getItem(Summary._establishmentIdKey)) || this.settings.tenantId);
                this._establishmentIdChanged = ko.computed(function () {
                    _this._onEstablishmentIdChanged();
                });
                this.hasEstablishmentId = ko.computed(function () {
                    var establishmentId = _this.establishmentId();
                    return (establishmentId && establishmentId > 0);
                });
                this.hasNoEstablishmentId = ko.computed(function () {
                    return !_this.hasEstablishmentId();
                });
                this.routeState = ko.computed(function () {
                    return {
                        pivot: _this.pivot(),
                        placeId: _this.placeId(),
                        establishmentId: _this.establishmentId()
                    };
                });
                this._routeStateChanged = ko.computed(function () {
                    _this._onRouteStateChanged();
                }).extend({ throttle: 1 });
                this.hasPlaceData = ko.observable(false);
                this.placeData = new App.DataCacher(function () {
                    return _this._loadPlaceData();
                });
                this.hasTenancyData = ko.observable(false);
                this.selectedTenant = ko.observable(this.settings.tenantId);
                this.tenancyData = new App.DataCacher(function () {
                    return _this._loadTenancyData();
                });
                this._selectedTenantChanged = ko.computed(function () {
                    var areBindingsApplied = _this.areBindingsApplied();
                    var hasTenancyData = _this.hasTenancyData();
                    var selectedTenant = _this.selectedTenant();
                    var establishmentId = _this.establishmentId();
                    if (!areBindingsApplied || !hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                        return;

                    $.when(_this.placeData.reload(), _this.activityCountsData.reload()).done(function () {
                        _this.establishmentId(selectedTenant);
                    });
                });
                this.tenantOptions = ko.observableArray();
                this.activityTotals = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?')
                };
                this.activityCountsData = new App.DataCacher(function () {
                    return _this._loadActivityCounts();
                });
                this.selectedPlaceSummary = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?')
                };
                this._placeSelected = ko.computed(function () {
                    _this._onPlaceSelected();
                });
                this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.geoChart.googleElementId));
                this.geoChartSpinner = new App.Spinner({ delay: 400, runImmediately: true });
                this.isGeoChartReady = ko.observable(false);
                this._geoChartDataTable = this._newGeoChartDataTable();
                this.activityTypeChart = new App.Google.ColumnChart(document.getElementById(this.settings.activityTypesChart.googleElementId));
                this.isActivityTypeChartReady = ko.observable(false);
                this._activityTypeChartDataTable = this._newActivityTypeChartDataTable();
                this.activityTypes = ko.observableArray();
                this.activityYearChart = new App.Google.LineChart(document.getElementById(this.settings.activityYearsChart.googleElementId));
                this.isActivityYearChartReady = ko.observable(false);
                this._activityYearChartDataTable = this._newActivityYearChartDataTable();
                this.activityYears = ko.observableArray();
                this.arePlaceOverlaysVisible = ko.computed(function () {
                    var placeId = _this.placeId();
                    var isGeoChartReady = _this.isGeoChartReady();
                    var isPlaceOverlaySelected = _this.isPlaceOverlaySelected ? _this.isPlaceOverlaySelected() : false;
                    if (!isGeoChartReady)
                        return false;
                    var areVisible = (placeId == 1 || isPlaceOverlaySelected) && isGeoChartReady;

                    if (Summary._isD3Defined() && _this.settings.geoChart.googleElementId) {
                        var dInjectRootElementId = '{0}_place_overlays_root'.format(_this.settings.geoChart.googleElementId);
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
                this.isPlaceOverlaySelected = ko.computed(function () {
                    var placeId = _this.placeId();
                    var areBindingsApplied = _this.areBindingsApplied();
                    var placeOverlays = _this.placeOverlays ? _this.placeOverlays() : undefined;
                    if (!areBindingsApplied || !placeOverlays)
                        return false;

                    var isOverlaySelected = false;
                    var overlay = Enumerable.From(placeOverlays).SingleOrDefault(undefined, function (x) {
                        return x.placeId == placeId;
                    });
                    if (overlay) {
                        isOverlaySelected = true;
                    }

                    return isOverlaySelected;
                });
                this.isD3Defined = ko.computed(function () {
                    return Summary._isD3Defined();
                });
                this.isD3Undefined = ko.computed(function () {
                    return !Summary._isD3Defined();
                });
                this._tooltips = ko.observableArray();
                this._parsePlaceOverlays();

                HistoryJS.Adapter.bind(window, 'statechange', function () {
                    _this._onRouteChanged();
                });

                this._initGeoChart();
                this._initActivityTypeChart();
                this._initActivityYearChart();
            }
            Summary.loadGoogleVisualization = function () {
                google.load('visualization', '1', { 'packages': ['corechart', 'geochart'] });

                google.setOnLoadCallback(function () {
                    Summary._googleVisualizationLoadedPromise.resolve();
                });
                return Summary._googleVisualizationLoadedPromise;
            };

            Summary.prototype.applyBindings = function () {
                var element = this.settings.element;
                if (element) {
                    ko.applyBindings(this, element);
                }
                this.areBindingsApplied(true);
                this._bindingsApplied.resolve();
            };

            Summary.prototype._onPivotChanged = function () {
                var value = this.pivot();
                var old = parseInt(sessionStorage.getItem(Summary._pivotKey)) || 0;

                if (value !== old) {
                    sessionStorage.setItem(Summary._pivotKey, value.toString());
                }
            };

            Summary.prototype.pivotPeople = function () {
                this.pivot(2 /* people */);
            };

            Summary.prototype.pivotActivities = function () {
                this.pivot(1 /* activities */);
            };

            Summary.prototype.isPivot = function (pivot) {
                return this.pivot() == pivot;
            };

            Summary.prototype._onPlaceIdChanged = function () {
                var value = this.placeId();
                var old = parseInt(sessionStorage.getItem(Summary._placeIdKey)) || undefined;

                if (value !== old) {
                    sessionStorage.setItem(Summary._placeIdKey, value.toString());
                }
            };

            Summary.prototype._onEstablishmentIdChanged = function () {
                var value = this.establishmentId();
                var old = parseInt(sessionStorage.getItem(Summary._establishmentIdKey)) || undefined;

                if (value !== old) {
                    sessionStorage.setItem(Summary._establishmentIdKey, value.toString());
                }
            };

            Summary.prototype._getUrlState = function () {
                var params = location.search.indexOf('?') == 0 ? location.search.substr(1) : location.search;
                if (!Summary._isD3Defined()) {
                    params = location.hash.indexOf('#?') == 0 ? location.hash.substr(2) : '';
                }
                var state = App.deparam(params, true);
                return state;
            };

            Summary.prototype._onRouteStateChanged = function () {
                var _this = this;
                var routeState = this.routeState();
                var urlState = this._getUrlState();

                var areBindingsApplied = this.areBindingsApplied();
                if (!areBindingsApplied)
                    return;
                this.tenancyData.ready().done(function (establishments) {
                    routeState = _this.routeState();
                    urlState = _this._getUrlState();

                    if (SummaryRouteState.isIncomplete(urlState) || SummaryRouteState.areEqual(routeState, urlState)) {
                        HistoryJS.replaceState(routeState, '', '?' + $.param(routeState));
                    } else {
                        HistoryJS.pushState(routeState, '', '?' + $.param(routeState));
                    }
                });
            };

            Summary.prototype._onRouteChanged = function () {
                var urlState = this._getUrlState();
                this._updateState(urlState);
                this._applyState();
            };

            Summary.prototype._updateState = function (state) {
                this.pivot(state.pivot);
                this.placeId(state.placeId);
                this.selectedTenant(state.establishmentId);
                this.establishmentId(state.establishmentId);
            };

            Summary.prototype._applyState = function () {
                this.activityCountsData.ready();
                this._drawGeoChart();
                this._drawActivityTypeChart();
                this._drawActivityYearChart();
            };

            Summary.prototype._loadPlaceData = function () {
                var _this = this;
                var promise = $.Deferred();
                var request = {
                    countries: true,
                    placeIds: this._getOverlayPlaceIds(),
                    placeAgnostic: true
                };
                this.geoChartSpinner.start();
                Employees.Servers.GetEmployeesPlaces(this.settings.tenantId, request).done(function (places) {
                    _this.hasPlaceData(places && places.length > 0);
                    promise.resolve(places);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load employee location summary data.', true);
                    promise.reject();
                }).always(function () {
                    _this.geoChartSpinner.stop();
                });
                return promise;
            };

            Summary.prototype._getPlaceById = function (placeId) {
                var place = Enumerable.From(this.placeData.cached).FirstOrDefault(undefined, function (x) {
                    return x.placeId == placeId;
                });

                return place;
            };

            Summary.prototype._getPlaceByName = function (placeName) {
                var place = Enumerable.From(this.placeData.cached).FirstOrDefault(undefined, function (x) {
                    return x.placeName == placeName;
                });

                return place;
            };

            Summary.prototype._loadTenancyData = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.when(Establishments.Servers.Single(this.settings.tenantId), Establishments.Servers.GetChildren(this.settings.tenantId)).done(function (parentData, childData) {
                    childData = childData || [];
                    var tenants = Enumerable.From(childData).OrderBy(function (x) {
                        return x.rank;
                    }).ToArray();
                    tenants.unshift(parentData);

                    _this.tenantOptions([]);
                    if (childData.length) {
                        var options = Enumerable.From(tenants).Select(function (x) {
                            var option = {
                                value: x.id,
                                text: x.contextName || x.officialName
                            };
                            return option;
                        }).ToArray();
                        _this.tenantOptions(options);
                    }

                    deferred.resolve(tenants);
                    if (childData.length)
                        _this.hasTenancyData(true);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    deferred.reject();
                });
                return deferred.promise();
            };

            Summary.prototype._loadActivityCounts = function () {
                var _this = this;
                var promise = $.Deferred();
                Employees.Servers.GetActivityCounts(this.selectedTenant()).done(function (summary) {
                    ko.mapping.fromJS(summary, {}, _this.activityTotals);
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
                    $.when(this.placeData.ready()).then(function () {
                        var place = _this._getPlaceById(placeId);
                        _this.selectedPlaceSummary.personCount(place.activityPersonIds.length.toString());
                        _this.selectedPlaceSummary.activityCount(place.activityIds.length.toString());
                        _this.selectedPlaceSummary.locationCount(place.placeName);
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

            Summary.prototype._getGeoChartOptions = function (overrides) {
                if (!this._geoChartGradientLo)
                    this._geoChartGradientLo = $('<div class="charts-color-gradient-lo" />').hide().appendTo('body').css('color') || '#ccc';
                if (!this._geoChartGradientHi)
                    this._geoChartGradientHi = $('<div class="charts-color-gradient-hi" />').hide().appendTo('body').css('color') || '#333';
                var options = {
                    displayMode: 'regions',
                    region: 'world',
                    keepAspectRatio: this.settings.geoChart.keepAspectRatio ? true : false,
                    height: this.settings.geoChart.keepAspectRatio ? 480 : 500,
                    colorAxis: {
                        minValue: 1,
                        colors: [this._geoChartGradientLo, this._geoChartGradientHi]
                    },
                    backgroundColor: '#acccfd'
                };

                if (overrides && overrides.region)
                    options.region = overrides.region;
                if (overrides && (overrides.keepAspectRatio || overrides.keepAspectRatio == false))
                    options.keepAspectRatio = overrides.keepAspectRatio;

                return options;
            };

            Summary.prototype._newGeoChartDataTable = function () {
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Place');
                dataTable.addColumn('number', 'Total');
                return dataTable;
            };

            Summary.prototype._initGeoChart = function () {
                var _this = this;
                var promise = $.Deferred();

                if (!this.isGeoChartReady()) {
                    this.geoChart.draw(this._geoChartDataTable, this._getGeoChartOptions()).then(function () {
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
                var cachedData = this.placeData.cached;
                var needsRedraw = !cachedData;

                var placeId = this.placeId();
                var place = this._getPlaceById(placeId);
                var optionOverrides = this._getGeoChartOptions();
                optionOverrides.region = !placeId || placeId == 1 || !place || !place.countryCode ? 'world' : place.countryCode;

                optionOverrides.keepAspectRatio = placeId && placeId > 1 && place && place.countryCode ? false : this.settings.geoChart.keepAspectRatio ? true : false;

                this._initGeoChart().then(function () {
                    _this.placeData.ready().done(function (places) {
                        if (needsRedraw) {
                            _this._drawGeoChart();
                            return;
                        }
                        var isPivotPeople = _this.isPivotPeople();
                        _this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(isPivotPeople ? 'People' : 'Activities'));
                        _this._geoChartDataTable.removeRows(0, _this._geoChartDataTable.getNumberOfRows());
                        $.each(places, function (i, dataPoint) {
                            if (!dataPoint.placeId)
                                return;
                            var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                            _this._geoChartDataTable.addRow([dataPoint.placeName, total]);
                        });
                        _this.geoChart.draw(_this._geoChartDataTable, _this._getGeoChartOptions(optionOverrides)).then(function () {
                            setTimeout(function () {
                                _this._svgInjectPlaceOverlays();
                            }, 0);
                            _this._applyPlaceOverlayTotals(places);
                            _this._createOverlayTooltips();
                        });
                    });
                });
            };

            Summary.prototype._onGeoChartSelect = function () {
                var selection = this.geoChart.geoChart.getSelection();
                if (selection && selection.length) {
                    var rowIndex = selection[0].row;

                    var placeName = this._geoChartDataTable.getFormattedValue(rowIndex, 0);
                    var place = this._getPlaceByName(placeName);
                    if (place) {
                        this.placeId(place.placeId);
                    }
                }
            };

            Summary.prototype._onGeoChartRegionClick = function (e) {
            };

            Summary.prototype._getChartDataColor = function () {
                if (!this._chartDataColor)
                    this._chartDataColor = $('<div class="charts-color-dark" />').hide().appendTo('body').css('color') || '#333';
                return this._chartDataColor;
            };

            Summary.prototype._getActivityTypeChartOptions = function () {
                var options = {
                    animation: {
                        duration: 250
                    },
                    hAxis: {
                        textPosition: 'none'
                    },
                    vAxis: {
                        textPosition: 'none'
                    },
                    chartArea: {
                        top: 16,
                        left: 10,
                        width: '100%',
                        height: '75%'
                    },
                    legend: { position: 'none' },
                    isStacked: true,
                    series: [
                        {
                            type: 'bars',
                            color: this._getChartDataColor()
                        },
                        {
                            type: 'line',
                            color: 'black',
                            lineWidth: 0,
                            pointSize: 0,
                            visibleInLegend: false
                        }
                    ]
                };

                return options;
            };

            Summary.prototype._newActivityTypeChartDataTable = function () {
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Activity Type');
                dataTable.addColumn('number', 'Count');
                dataTable.addColumn({ type: 'number', role: 'annotation' });
                return dataTable;
            };

            Summary.prototype._initActivityTypeChart = function () {
                var _this = this;
                var promise = $.Deferred();

                if (!this.isActivityTypeChartReady()) {
                    this.activityTypeChart.draw(this._activityTypeChartDataTable, this._getActivityTypeChartOptions()).then(function () {
                        if (!_this.isActivityTypeChartReady()) {
                            _this.isActivityTypeChartReady(true);
                            _this.bindingsApplied.done(function () {
                            });
                        }
                        promise.resolve();
                    });
                } else {
                    promise.resolve();
                }
                return promise;
            };

            Summary.prototype._drawActivityTypeChart = function () {
                var _this = this;
                var cachedData = this.placeData.cached;
                var needsRedraw = !cachedData;

                var placeId = this.placeId();

                this._initActivityTypeChart().then(function () {
                    _this.placeData.ready().done(function (places) {
                        if (needsRedraw) {
                            _this._drawActivityTypeChart();
                            return;
                        }
                        var isPivotPeople = _this.isPivotPeople();
                        _this._activityTypeChartDataTable.removeRows(0, _this._activityTypeChartDataTable.getNumberOfRows());
                        var activityTypes = _this._getActivityTypes();
                        _this.activityTypes(activityTypes);
                        $.each(activityTypes, function (i, dataPoint) {
                            var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                            _this._activityTypeChartDataTable.addRow([dataPoint.text, total, total]);
                        });
                        var dataView = new google.visualization.DataView(_this._activityTypeChartDataTable);
                        dataView.setColumns([0, 1, 1, 2]);
                        _this.activityTypeChart.draw(dataView, _this._getActivityTypeChartOptions()).then(function () {
                        });
                    });
                });
            };

            Summary.prototype._getActivityTypes = function () {
                var placeId = this.placeId();
                if (placeId == 1)
                    placeId = null;
                var places = this.placeData.cached;
                var activityTypes = Enumerable.From(places).Where(function (x) {
                    if (placeId == null)
                        return !x.placeId;
                    return x.placeId == placeId;
                }).SelectMany(function (x) {
                    return x.activityTypes;
                }).Distinct(function (x) {
                    return x.activityTypeId;
                }).OrderBy(function (x) {
                    return x.rank;
                }).Select(function (x) {
                    x.iconSrc = Routes.Api.Employees.Settings.ActivityTypes.icon(x.activityTypeId);
                    return x;
                }).ToArray();
                return activityTypes;
            };

            Summary.prototype._getActivityYearChartOptions = function () {
                var options = {
                    animation: {
                        duration: 250
                    },
                    vAxis: {
                        minValue: 0
                    },
                    chartArea: {
                        top: 8,
                        left: 0,
                        width: '100%',
                        height: '60%'
                    },
                    legend: { position: 'none' },
                    colors: [this._getChartDataColor()]
                };

                return options;
            };

            Summary.prototype._newActivityYearChartDataTable = function () {
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Year');
                dataTable.addColumn('number', 'Count');
                return dataTable;
            };

            Summary.prototype._initActivityYearChart = function () {
                var _this = this;
                var promise = $.Deferred();

                if (!this.isActivityYearChartReady()) {
                    this.activityYearChart.draw(this._activityYearChartDataTable, this._getActivityYearChartOptions()).then(function () {
                        if (!_this.isActivityYearChartReady()) {
                            _this.isActivityYearChartReady(true);
                            _this.bindingsApplied.done(function () {
                            });
                        }
                        promise.resolve();
                    });
                } else {
                    promise.resolve();
                }
                return promise;
            };

            Summary.prototype._drawActivityYearChart = function () {
                var _this = this;
                var cachedData = this.placeData.cached;
                var needsRedraw = !cachedData;

                var placeId = this.placeId();

                this._initActivityYearChart().then(function () {
                    _this.placeData.ready().done(function (places) {
                        if (needsRedraw) {
                            _this._drawActivityYearChart();
                            return;
                        }
                        var isPivotPeople = _this.isPivotPeople();
                        _this._activityYearChartDataTable.removeRows(0, _this._activityYearChartDataTable.getNumberOfRows());
                        var activityYears = _this._getActivityYears();
                        _this.activityYears(activityYears);
                        $.each(activityYears, function (i, dataPoint) {
                            var total = isPivotPeople ? dataPoint.activityPersonIds.length : dataPoint.activityIds.length;
                            _this._activityYearChartDataTable.addRow([dataPoint.year.toString(), total]);
                        });
                        _this.activityYearChart.draw(_this._activityYearChartDataTable, _this._getActivityYearChartOptions()).then(function () {
                        });
                    });
                });
            };

            Summary.prototype._getActivityYears = function () {
                var placeId = this.placeId();
                if (placeId == 1)
                    placeId = null;
                var places = this.placeData.cached;

                var currentYear = 2012;
                var minYear = 2003;
                var activityYears = Enumerable.From(places).Where(function (x) {
                    if (placeId == null)
                        return !x.placeId;
                    return x.placeId == placeId;
                }).SelectMany(function (x) {
                    return x.years;
                }).Distinct(function (x) {
                    return x.year;
                }).OrderBy(function (x) {
                    return x.year;
                }).Where(function (x) {
                    return x.year >= minYear && x.year <= currentYear;
                }).ToArray();
                return activityYears;
            };

            Summary.prototype._parsePlaceOverlays = function () {
                var _this = this;
                if (this.placeOverlays)
                    return;
                this.placeOverlays = ko.observableArray();
                var overlays = $('#{0} .overlays .places .data'.format(this.settings.geoChart.boxElementId)).children();
                $.each(overlays, function (i, overlay) {
                    var jOverlay = $(overlay);
                    var iOverlay = {
                        total: ko.observable(0),
                        placeId: parseInt(jOverlay.data('place-id')),
                        title: jOverlay.attr('title'),
                        className: jOverlay.attr('class'),
                        imageSwapper: new App.ImageSwapper(jOverlay.find('img.no-hover').first().attr('src'), jOverlay.find('img.hover').first().attr('src'))
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

            Summary.prototype.clickPlaceOverlay = function (overlay, e) {
                var place = this._getPlaceById(overlay.placeId);
                if (place) {
                    if (!place.activityPersonIds.length) {
                        return;
                    }
                    this.placeId(place.placeId);
                }
            };

            Summary._isD3Defined = function () {
                return typeof d3 !== 'undefined';
            };

            Summary.prototype._svgInjectPlaceOverlays = function () {
                var _this = this;
                if (!Summary._isD3Defined() || !this.settings.geoChart.googleElementId || !this.settings.geoChart.boxElementId)
                    return;

                var dInjectRootElementId = '{0}_place_overlays_root'.format(this.settings.geoChart.googleElementId);
                if ($('#{0}'.format(dInjectRootElementId)).length)
                    return;

                var dGoogleG = d3.select('#{0} svg > g'.format(this.settings.geoChart.googleElementId));

                var dInjectRoot = dGoogleG.append('g').attr('id', dInjectRootElementId);
                var areOverlaysVisible = this.arePlaceOverlaysVisible();
                if (!areOverlaysVisible)
                    dInjectRoot.attr('style', 'display: none;');

                var jContainer = $('#{0} .overlays .places .data'.format(this.settings.geoChart.boxElementId));
                jContainer.show();

                var overlays = this.placeOverlays();
                $.each(overlays, function (i, overlay) {
                    _this._svgInjectPlaceOverlay(dInjectRoot, overlay);
                });

                jContainer.hide();

                $('#{0} svg > g > g:last-child'.format(this.settings.geoChart.googleElementId)).insertAfter('#{0} svg > g > g:nth-child(2)'.format(this.settings.geoChart.googleElementId));
            };

            Summary.prototype._svgInjectPlaceOverlay = function (root, overlay) {
                var jOverlay = $('#{0} .overlays .places .data .{1}'.format(this.settings.geoChart.boxElementId, overlay.className));
                var dOverlay = root.append('g').attr('class', overlay.className);

                var x = jOverlay.position().left;
                var y = jOverlay.position().top;
                var width = jOverlay.outerWidth();
                var height = jOverlay.outerHeight();

                var noHoverImage = dOverlay.append('image').attr('xlink:href', overlay.imageSwapper.noHoverSrc()).attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('class', 'no-hover');

                var hoverImage = dOverlay.append('image').attr('xlink:href', overlay.imageSwapper.hoverSrc()).attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('class', 'hover').attr('style', 'display: none;');

                if (overlay.placeId == this.placeId()) {
                    hoverImage.attr('style', '');
                    noHoverImage.attr('style', 'display: none;');
                }

                this._svgApplyPlaceOverlayHover(overlay, noHoverImage, hoverImage);

                return dOverlay;
            };

            Summary.prototype._svgApplyPlaceOverlayHover = function (overlay, noHover, hover) {
                var _this = this;
                overlay.imageSwapper.isHover.subscribe(function (newValue) {
                    var placeId = _this.placeId();
                    if (placeId == overlay.placeId) {
                        hover.attr('style', '');
                        noHover.attr('style', 'display:none');
                        return;
                    }

                    if (newValue) {
                        hover.attr('style', '');
                        noHover.attr('style', 'display:none');
                    } else {
                        noHover.attr('style', '');
                        hover.attr('style', 'display:none');
                    }
                });

                this.placeId.subscribe(function (newValue) {
                    var placeId = _this.placeId();
                    if (placeId == overlay.placeId) {
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
                    $.each(this._tooltips(), function (i, tooltip) {
                        tooltip.tooltip('destroy');
                    });
                    this._tooltips([]);
                }

                var overlays = this.placeOverlays();
                $.each(overlays, function (i, overlay) {
                    var jOverlay = $('#{0} .overlays .places .ui .{1}'.format(_this.settings.geoChart.boxElementId, overlay.className));
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
                        within: '#{0}'.format(this.settings.geoChart.googleElementId)
                    },
                    open: function (e, ui) {
                        var width = ui.tooltip.find('.ui-tooltip-content').outerWidth();

                        ui.tooltip.css({ width: '{0}px'.format(width) });
                    }
                });
            };

            Summary.prototype._applyPlaceOverlayTotals = function (places) {
                var isPivotPeople = this.isPivotPeople();
                var placeOverlays = this.placeOverlays();
                $.each(placeOverlays, function (i, overlay) {
                    var total = Enumerable.From(places).Where(function (x) {
                        return x.placeId == overlay.placeId;
                    }).Sum(function (x) {
                        return isPivotPeople ? x.activityPersonIds.length : x.activityIds.length;
                    });
                    overlay.total(total);
                });
            };
            Summary._googleVisualizationLoadedPromise = $.Deferred();

            Summary._pivotDefault = 1 /* activities */;
            Summary._pivotKey = 'EmployeeSummaryPivot';

            Summary._placeIdDefault = 1;
            Summary._placeIdKey = 'EmployeeSummaryPlaceId';

            Summary._establishmentIdKey = 'EmployeeSummaryEstablishmentId';
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(Employees.ViewModels || (Employees.ViewModels = {}));
    var ViewModels = Employees.ViewModels;
})(Employees || (Employees = {}));
