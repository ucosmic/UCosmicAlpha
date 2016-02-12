var Employees;
(function (Employees) {
    var ViewModels;
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
                this.MapDataIsLoading = ko.observable(false);
                this._bindingsApplied = $.Deferred();
                this.bindingsApplied = this._bindingsApplied;
                this.areBindingsApplied = ko.observable(false);
                this.hasEstablishmentSelects = ko.observable(false);
                this.selectedEstablishment = ko.observable();
                this.affiliations = ko.mapping.fromJS([]);
                this.rootEstablishment = 0;
                this.loadingSpinner = new App.Spinner();
                this.pivot = ko.observable(parseInt(sessionStorage.getItem(Summary._pivotKey)) || Summary._pivotDefault);
                this._pivotChanged = ko.computed(function () { _this._onPivotChanged(); });
                this.isPivotPeople = ko.computed(function () {
                    return _this.pivot() == DataGraphPivot.people;
                });
                this.isPivotActivities = ko.computed(function () {
                    return _this.pivot() == DataGraphPivot.activities;
                });
                this.placeId = ko.observable(parseInt(sessionStorage.getItem(Summary._placeIdKey)) || Summary._placeIdDefault);
                this._placeIdChanged = ko.computed(function () { _this._onPlaceIdChanged(); });
                this.hasPlaceId = ko.computed(function () {
                    var placeId = _this.placeId();
                    return (placeId && placeId > 1);
                });
                this.hasNoPlaceId = ko.computed(function () {
                    return !_this.hasPlaceId();
                });
                this.selectedTenant = ko.observable(0);
                this.establishmentId = ko.observable(parseInt(sessionStorage.getItem(Summary._establishmentIdKey)) || this.settings.tenantId);
                this._establishmentIdChanged = ko.computed(function () { _this._onEstablishmentIdChanged(); });
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
                        establishmentId: _this.establishmentId(),
                    };
                });
                this._routeStateChanged = ko.computed(function () {
                    _this._onRouteStateChanged();
                }).extend({ throttle: 1 });
                this.hasPlaceData = ko.observable(false);
                this.placeData = $.Deferred();
                this.hasTenancyData = ko.observable(false);
                this.isCreatingSelectEstablishments = false;
                this.tenancyData = new App.DataCacher(function () {
                    return _this._loadTenancyData();
                });
                this._selectedTenantChanged = ko.computed(function () {
                    var areBindingsApplied = _this.areBindingsApplied();
                    var hasTenancyData = _this.hasTenancyData();
                    var selectedTenant = _this.selectedTenant();
                    if (_this.selectedTenant()) {
                        _this.settings.tenantId = _this.selectedTenant();
                    }
                    var establishmentId = _this.establishmentId();
                    if (!areBindingsApplied || !hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                        return;
                    _this.establishmentId(selectedTenant);
                    _this._reloadPlaceData();
                });
                this.tenantOptions = ko.observableArray();
                this.establishmentData = new App.DataCacher(function () {
                    return _this._loadEstablishmentData();
                });
                this.activityTotals = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?'),
                };
                this.activityCountsData = new App.DataCacher(function () {
                    return _this._loadActivityCounts();
                });
                this.selectedPlaceSummary = {
                    personCount: ko.observable('?'),
                    activityCount: ko.observable('?'),
                    locationCount: ko.observable('?'),
                };
                this._placeSelected = ko.computed(function () { _this._onPlaceSelected(); });
                this.geoChart = new App.Google.GeoChart(document.getElementById(this.settings.geoChart.googleElementId));
                this.geoChartSpinner = new App.Spinner({ delay: 400, runImmediately: true, });
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
                    var areVisible = (placeId == 1 || isPlaceOverlaySelected)
                        && isGeoChartReady;
                    if (Summary._isD3Defined() && _this.settings.geoChart.googleElementId) {
                        var dInjectRootElementId = '{0}_place_overlays_root'
                            .format(_this.settings.geoChart.googleElementId);
                        var dInjectRootSelection = d3.select('#{0}'.format(dInjectRootElementId));
                        if (dInjectRootSelection.length) {
                            if (areVisible) {
                                dInjectRootSelection.attr('style', '');
                            }
                            else {
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
                    var overlay = Enumerable.From(placeOverlays)
                        .SingleOrDefault(undefined, function (x) {
                        return x.placeId == placeId;
                    });
                    if (overlay) {
                        isOverlaySelected = true;
                    }
                    return isOverlaySelected;
                });
                this.isD3Defined = ko.computed(function () { return Summary._isD3Defined(); });
                this.isD3Undefined = ko.computed(function () { return !Summary._isD3Defined(); });
                this._tooltips = ko.observableArray();
                this._parsePlaceOverlays();
                HistoryJS.Adapter.bind(window, 'statechange', function () { _this._onRouteChanged(); });
                this.rootEstablishment = settings.tenantId;
                this._initGeoChart();
                this._initActivityTypeChart();
                this._initActivityYearChart();
                this._loadTenancyData();
                this._loadPlaceData();
            }
            Summary.loadGoogleVisualization = function () {
                google.load('visualization', '1', { 'packages': ['corechart', 'geochart'] });
                google.setOnLoadCallback(function () {
                    Summary._googleVisualizationLoadedPromise.resolve();
                });
                return Summary._googleVisualizationLoadedPromise;
            };
            Summary.prototype._ConstructMapData = function () {
                var _this = this;
                var stringActivityMapData;
                var activityMapData;
                var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
                var ancestorId = this.selectedTenant() ? this.selectedTenant().toString() : "null";
                var keyword = "null";
                if (stringActivityMapDataSearch == ancestorId + keyword) {
                    stringActivityMapData = sessionStorage.getItem('activityMapData');
                    activityMapData = $.parseJSON(stringActivityMapData);
                }
                if (!activityMapData || !activityMapData.length) {
                    var settings = settings || {};
                    var url = '/api/usf.edu/employees/map/?ancestorid=' + ancestorId;
                    settings.url = url;
                    this.ajaxMapData = $.ajax(settings)
                        .done(function (response) {
                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', ancestorId + keyword);
                        _this.MapDataIsLoading(false);
                    })
                        .fail(function (xhr) {
                    });
                }
                else {
                    this.MapDataIsLoading(false);
                }
            };
            Summary.prototype.applyBindings = function () {
                var _this = this;
                var element = this.settings.element;
                if (element) {
                    ko.applyBindings(this, element);
                }
                this.areBindingsApplied(true);
                this._bindingsApplied.resolve();
                $(window).on("popstate", function () {
                    if (_this.ajaxMapData) {
                        _this.ajaxMapData.abort();
                    }
                });
                $("form").submit(function (event) {
                    _this.loadingSpinner.start();
                });
                $('a').click(function () {
                    _this.loadingSpinner.start();
                });
            };
            Summary.prototype._onPivotChanged = function () {
                var value = this.pivot();
                var old = parseInt(sessionStorage.getItem(Summary._pivotKey)) || 0;
                if (value !== old) {
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
            Summary.prototype.table_mapLink = function (data, e) {
                e.preventDefault;
                window.location.href = e.target.parentElement.href + '?ancestorId=' + this.selectedTenant();
            };
            Summary.prototype._getUrlState = function () {
                var params = location.search.indexOf('?') == 0
                    ? location.search.substr(1) : location.search;
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
                this.tenancyData.ready()
                    .done(function (establishments) {
                    routeState = _this.routeState();
                    urlState = _this._getUrlState();
                    if (SummaryRouteState.isIncomplete(urlState) || SummaryRouteState.areEqual(routeState, urlState)) {
                        HistoryJS.replaceState(routeState, '', '?' + $.param(routeState));
                    }
                    else {
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
                // calling .ready() on placeData invokes this
                var _this = this;
                var settings = settings || {};
                var establishmentId = this.establishmentId() ? this.establishmentId() : this.selectedTenant();
                var url = '/api/' + this.settings.tenantId + '/employees/snapshot/' + establishmentId + '/' + this.placeId();
                settings.url = url;
                this.geoChartSpinner.start();
                $.ajax(settings)
                    .done(function (response) {
                    _this.hasPlaceData(response && response.counts.length != undefined);
                    _this.placeData.cached = response.counts;
                    _this.placeData.resolve(response);
                })
                    .fail(function (xhr) {
                })
                    .always(function () {
                    _this.geoChartSpinner.stop();
                });
            };
            Summary.prototype._reloadPlaceData = function () {
                // calling .ready() on placeData invokes this
                var _this = this;
                var settings = settings || {};
                var establishmentId = this.establishmentId() ? this.establishmentId() : this.selectedTenant();
                var url = '/api/' + this.settings.tenantId + '/employees/snapshot/' + establishmentId + '/' + this.placeId();
                settings.url = url;
                this.geoChartSpinner.start();
                this._onPlaceSelected();
                $.ajax(settings)
                    .done(function (response) {
                    _this.hasPlaceData(response && response.counts.length != undefined);
                    _this.placeData.cached = response.counts;
                    _this.placeData.resolve(response);
                    var place = _this._getPlaceById(_this.placeId());
                    _this._loadActivityCounts();
                    var optionOverrides = _this._getGeoChartOptions();
                    optionOverrides.region = !_this.placeId() || _this.placeId() == 1 || !place || !place.countryCode
                        ? 'world' : place.countryCode;
                    _this.draw_place_data(response, false, optionOverrides);
                    _this.draw_activity_type_data(response, false);
                    _this.draw_activity_year_data(response, false);
                })
                    .fail(function (xhr) {
                })
                    .always(function () {
                    _this.geoChartSpinner.stop();
                });
            };
            Summary.prototype._getPlaceById = function (placeId) {
                var place = Enumerable.From(this.placeData.cached)
                    .FirstOrDefault(undefined, function (x) {
                    return x.id == placeId;
                });
                return place;
            };
            Summary.prototype._getPlaceByName = function (placeName) {
                var place = Enumerable.From(this.placeData.cached)
                    .FirstOrDefault(undefined, function (x) {
                    return x.name == placeName;
                });
                return place;
            };
            Summary.prototype._createEstablishmentSelects = function (response) {
                this.establishmentId();
                if (this.selectedTenant() == 0) {
                    this.selectedTenant(this.establishmentId());
                }
                var parentId = this.selectedTenant();
                if (!parentId) {
                    parentId = this.settings.tenantId;
                }
                var previousParentId = 0;
                this.isCreatingSelectEstablishments = true;
                this.affiliations.removeAll();
                while (true) {
                    response.map(function (x, index, array) {
                        x.officialName = x.contextName ? x.contextName : x.officialName && x.officialName.indexOf(',') > -1 ? x.officialName.substring(0, x.officialName.indexOf(',')) : x.officialName;
                        return x;
                    });
                    var options = Enumerable.From(response)
                        .Where("x => x.parentId==" + parentId)
                        .OrderBy(function (x) {
                        return x.rank;
                    })
                        .ThenBy(function (x) {
                        return x.contextName || x.officialName;
                    })
                        .Select("x =>  {value: x.id, text: x.officialName}").ToArray();
                    if (options.length > 0) {
                        options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
                        this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
                    }
                    previousParentId = parentId;
                    var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
                    if (parentCheck[0] != undefined) {
                        parentId = parentCheck[0].parentId;
                    }
                    else {
                        this.isCreatingSelectEstablishments = false;
                        this.hasEstablishmentSelects(true);
                        return;
                    }
                }
            };
            Summary.prototype._loadEstablishmentData = function () {
                var _this = this;
                var promise = $.Deferred();
                this.mainCampus = this.rootEstablishment;
                if (!this.mainCampus) {
                    this.mainCampus = this.selectedTenant();
                    if (!this.mainCampus) {
                        this.mainCampus = this.settings.tenantId;
                    }
                }
                var temp = sessionStorage.getItem('campuses' + this.mainCampus);
                if (temp) {
                    var response = $.parseJSON(temp);
                    this._createEstablishmentSelects(response);
                }
                else {
                    var settings = settings || {};
                    settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                    $.ajax(settings)
                        .done(function (response) {
                        promise.resolve(response);
                        sessionStorage.setItem('campuses' + _this.mainCampus, JSON.stringify(response));
                        _this._createEstablishmentSelects(response);
                    })
                        .fail(function (xhr) {
                        promise.reject(xhr);
                    });
                }
                return promise;
            };
            Summary.prototype._loadTenancyData = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.when(Establishments.Servers.Single(this.settings.tenantId), Establishments.Servers.GetChildren(this.settings.tenantId))
                    .done(function (parentData, childData) {
                    childData = childData || [];
                    var tenants = Enumerable.From(childData)
                        .OrderBy(function (x) {
                        return x.rank;
                    }).ToArray();
                    tenants.unshift(parentData);
                    _this.tenantOptions([]);
                    if (childData.length) {
                        var options = Enumerable.From(tenants)
                            .Select(function (x) {
                            var option = {
                                value: x.id,
                                text: x.contextName || x.officialName,
                            };
                            return option;
                        }).ToArray();
                        _this.tenantOptions(options);
                    }
                    deferred.resolve(tenants);
                    _this.establishmentData.ready();
                    var myThis = _this;
                    _this.selectedTenant(_this.establishmentId());
                    _this.selectedTenant.subscribe(function (newValue) {
                        _this.selectedEstablishment(_this.selectedTenant());
                    });
                    $("#campusSelect").on("change", "select", function () {
                        if (myThis.isCreatingSelectEstablishments == false) {
                            if (this.value != '') {
                                myThis.selectedTenant(this.value);
                                myThis._loadEstablishmentData();
                            }
                            else {
                                var prevCampusSelect = $(this).parent().parent().prev().find("select");
                                if (prevCampusSelect.length) {
                                    myThis.selectedTenant(prevCampusSelect.val());
                                    myThis._loadEstablishmentData();
                                }
                                else {
                                    myThis.selectedTenant(myThis.rootEstablishment);
                                    myThis._loadEstablishmentData();
                                }
                            }
                        }
                    });
                    if (childData.length)
                        _this.hasTenancyData(true);
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    deferred.reject();
                });
                return deferred.promise();
            };
            Summary.prototype._loadActivityCounts = function () {
                var _this = this;
                var promise = $.Deferred();
                Employees.Servers.GetActivityCounts(this.selectedTenant())
                    .done(function (summary) {
                    ko.mapping.fromJS(summary, {}, _this.activityTotals);
                    promise.resolve(summary);
                })
                    .fail(function (xhr) {
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
                    $.when(this.placeData).then(function () {
                        var place = _this._getPlaceById(placeId);
                        _this.selectedPlaceSummary.personCount(place.peopleCount.toString());
                        _this.selectedPlaceSummary.activityCount(place.count.toString());
                        _this.selectedPlaceSummary.locationCount(place.name);
                    });
                }
                else if (areBindingsApplied) {
                    this.selectedPlaceSummary.personCount('?');
                    this.selectedPlaceSummary.activityCount('?');
                    this.selectedPlaceSummary.locationCount('?');
                }
            };
            Summary.prototype.clearPlaceSelection = function () {
                this.placeId(1);
                this._reloadPlaceData();
            };
            Summary.prototype._getGeoChartOptions = function (overrides) {
                if (!this._geoChartGradientLo)
                    this._geoChartGradientLo = $('<div class="charts-color-gradient-lo" />')
                        .hide().appendTo('body').css('color') || '#ccc';
                if (!this._geoChartGradientHi)
                    this._geoChartGradientHi = $('<div class="charts-color-gradient-hi" />')
                        .hide().appendTo('body').css('color') || '#333';
                var options = {
                    displayMode: 'regions',
                    region: 'world',
                    keepAspectRatio: this.settings.geoChart.keepAspectRatio ? true : false,
                    height: this.settings.geoChart.keepAspectRatio ? 480 : 500,
                    colorAxis: {
                        minValue: 1,
                        colors: [this._geoChartGradientLo, this._geoChartGradientHi,],
                    },
                    backgroundColor: '#acccfd',
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
                    this.geoChart.draw(this._geoChartDataTable, this._getGeoChartOptions())
                        .then(function () {
                        if (!_this.isGeoChartReady()) {
                            _this.isGeoChartReady(true);
                            _this.bindingsApplied.done(function () {
                                _this._svgInjectPlaceOverlays();
                                google.visualization.events.addListener(_this.geoChart.geoChart, 'select', function () { _this._onGeoChartSelect(); });
                                google.visualization.events.addListener(_this.geoChart.geoChart, 'regionClick', function (e) {
                                    _this._onGeoChartRegionClick(e);
                                });
                            });
                        }
                        promise.resolve();
                    });
                }
                else {
                    promise.resolve();
                }
                return promise;
            };
            Summary.prototype.draw_place_data = function (places, needsRedraw, optionOverrides) {
                var _this = this;
                if (needsRedraw) {
                    this._drawGeoChart();
                    return;
                }
                var isPivotPeople = this.isPivotPeople();
                this._geoChartDataTable.setColumnLabel(1, 'Total {0}'.format(isPivotPeople ? 'People' : 'Activities'));
                this._geoChartDataTable.removeRows(0, this._geoChartDataTable.getNumberOfRows());
                $.each(places.counts, function (i, dataPoint) {
                    if (!dataPoint.id)
                        return;
                    var total = isPivotPeople ? dataPoint.peopleCount : dataPoint.count;
                    _this._geoChartDataTable.addRow([dataPoint.name, total]);
                });
                this.geoChart.draw(this._geoChartDataTable, this._getGeoChartOptions(optionOverrides))
                    .then(function () {
                    setTimeout(function () { _this._svgInjectPlaceOverlays(); }, 0);
                    _this._applyPlaceOverlayTotals(places.counts);
                    _this._createOverlayTooltips();
                });
            };
            Summary.prototype._drawGeoChart = function () {
                var _this = this;
                var cachedData = this.placeData.cached;
                var needsRedraw = !cachedData;
                var placeId = this.placeId();
                if (this.placeId() == 17) {
                    placeId = 1;
                }
                var place = this._getPlaceById(placeId);
                var optionOverrides = this._getGeoChartOptions();
                optionOverrides.region = !placeId || placeId == 1 || !place || !place.countryCode
                    ? 'world' : place.countryCode;
                optionOverrides.keepAspectRatio = placeId && placeId > 1 && place && place.countryCode ? false :
                    this.settings.geoChart.keepAspectRatio ? true : false;
                this._initGeoChart().then(function () {
                    _this.placeData.done(function (places) {
                        _this.draw_place_data(places, needsRedraw, optionOverrides);
                    });
                });
            };
            Summary.prototype._onGeoChartSelect = function () {
                var selection = this.geoChart.geoChart.getSelection();
                if (selection && selection.length) {
                    var rowIndex = selection[0].row;
                    var placeName = this._geoChartDataTable.getFormattedValue(rowIndex, 0);
                    var place = this._getPlaceByName(placeName);
                    if (this.placeId() == place.id) {
                        var paramObject = {
                            placeNames: placeName,
                            placeIds: place.id,
                            pivot: this.pivot(),
                            keyword: '',
                            ancestorId: this.selectedTenant()
                        };
                        location.href = 'table/?' + $.param(paramObject);
                    }
                    if (place) {
                        this.placeId(place.id);
                    }
                    this._reloadPlaceData();
                }
            };
            Summary.prototype._onGeoChartRegionClick = function (e) {
            };
            Summary.prototype._getChartDataColor = function () {
                if (!this._chartDataColor)
                    this._chartDataColor = $('<div class="charts-color-dark" />')
                        .hide().appendTo('body').css('color') || '#333';
                return this._chartDataColor;
            };
            Summary.prototype._getActivityTypeChartOptions = function () {
                var options = {
                    animation: {
                        duration: 250,
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
                            color: this._getChartDataColor(),
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
                dataTable.addColumn({ type: 'number', role: 'id' });
                return dataTable;
            };
            Summary.prototype._initActivityTypeChart = function () {
                var _this = this;
                var promise = $.Deferred();
                if (!this.isActivityTypeChartReady()) {
                    this.activityTypeChart.draw(this._activityTypeChartDataTable, this._getActivityTypeChartOptions())
                        .then(function () {
                        if (!_this.isActivityTypeChartReady()) {
                            _this.isActivityTypeChartReady(true);
                            _this.bindingsApplied.done(function () {
                                google.visualization.events.addListener(_this.activityTypeChart.columnChart, 'select', function () { _this._onActivityTypeChartSelect(); });
                            });
                        }
                        promise.resolve();
                    });
                }
                else {
                    promise.resolve();
                }
                return promise;
            };
            Summary.prototype._onActivityTypeChartSelect = function () {
                var selectedItem = this.activityTypeChart.columnChart.getSelection()[0];
                if (selectedItem) {
                    var value = this._activityTypeChartDataTable.getValue(selectedItem.row, 3);
                    var placeName = "";
                    var paramObject;
                    if (this.placeId() != 1) {
                        paramObject = {
                            placeNames: this.selectedPlaceSummary.locationCount(),
                            placeIds: this.placeId(),
                            pivot: this.pivot(),
                            keyword: '',
                            activityTypeIds: value
                        };
                    }
                    else {
                        paramObject = {
                            pivot: this.pivot(),
                            keyword: '',
                            activityTypeIds: value,
                            ancestorId: this.selectedTenant()
                        };
                    }
                    location.href = 'table/?' + $.param(paramObject);
                }
            };
            Summary.prototype.draw_activity_type_data = function (places, needsRedraws) {
                var _this = this;
                if (needsRedraws) {
                    this._drawActivityTypeChart();
                    return;
                }
                var isPivotPeople = this.isPivotPeople();
                this._activityTypeChartDataTable.removeRows(0, this._activityTypeChartDataTable.getNumberOfRows());
                var activityTypes = places.types;
                this.activityTypes(activityTypes);
                $.each(activityTypes, function (i, dataPoint) {
                    var total = isPivotPeople ? dataPoint.peopleCount : dataPoint.count;
                    _this._activityTypeChartDataTable.addRow([dataPoint.text, total, total, dataPoint.activityTypeId]);
                });
                var dataView = new google.visualization.DataView(this._activityTypeChartDataTable);
                dataView.setColumns([0, 1, 1, 2]);
                this.activityTypeChart.draw(dataView, this._getActivityTypeChartOptions())
                    .then(function () {
                });
            };
            Summary.prototype._drawActivityTypeChart = function () {
                var _this = this;
                var cachedData = this.placeData.cached;
                var needsRedraws = !cachedData;
                var placeId = this.placeId();
                this._initActivityTypeChart().then(function () {
                    _this.placeData.done(function (places) {
                        _this.draw_activity_type_data(places, needsRedraws);
                    });
                });
            };
            Summary.prototype._getActivityYearChartOptions = function () {
                var options = {
                    animation: {
                        duration: 250,
                    },
                    vAxis: {
                        minValue: 0,
                    },
                    chartArea: {
                        top: 8,
                        left: 0,
                        width: '100%',
                        height: '60%'
                    },
                    legend: { position: 'none' },
                    colors: [this._getChartDataColor()],
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
                    this.activityYearChart.draw(this._activityYearChartDataTable, this._getActivityYearChartOptions())
                        .then(function () {
                        if (!_this.isActivityYearChartReady()) {
                            _this.isActivityYearChartReady(true);
                            _this.bindingsApplied.done(function () {
                            });
                        }
                        promise.resolve();
                    });
                }
                else {
                    promise.resolve();
                }
                return promise;
            };
            Summary.prototype.draw_activity_year_data = function (places, needsRedraws) {
                var _this = this;
                if (needsRedraws) {
                    this._drawActivityYearChart();
                    return;
                }
                var isPivotPeople = this.isPivotPeople();
                this._activityYearChartDataTable.removeRows(0, this._activityYearChartDataTable.getNumberOfRows());
                var activityYears = places.year;
                this.activityYears(activityYears);
                $.each(activityYears, function (i, dataPoint) {
                    var total = isPivotPeople ? dataPoint.peopleCount : dataPoint.count;
                    _this._activityYearChartDataTable.addRow([dataPoint.year.toString(), total]);
                });
                this.activityYearChart.draw(this._activityYearChartDataTable, this._getActivityYearChartOptions())
                    .then(function () {
                });
            };
            Summary.prototype._drawActivityYearChart = function () {
                var _this = this;
                var cachedData = this.placeData.cached;
                var needsRedraws = !cachedData;
                var placeId = this.placeId();
                this._initActivityYearChart().then(function () {
                    _this.placeData.done(function (places) {
                        _this.draw_activity_year_data(places, needsRedraws);
                    });
                });
            };
            Summary.prototype._parsePlaceOverlays = function () {
                var _this = this;
                if (this.placeOverlays)
                    return;
                this.placeOverlays = ko.observableArray();
                var overlays = $('#{0} .overlays .places .data'
                    .format(this.settings.geoChart.boxElementId)).children();
                $.each(overlays, function (i, overlay) {
                    var jOverlay = $(overlay);
                    var iOverlay = {
                        total: ko.observable(0),
                        placeId: parseInt(jOverlay.data('place-id')),
                        title: jOverlay.attr('title'),
                        className: jOverlay.attr('class'),
                        imageSwapper: new App.ImageSwapper(jOverlay.find('img.no-hover').first().attr('src'), jOverlay.find('img.hover').first().attr('src')),
                    };
                    _this.placeOverlays.push(iOverlay);
                });
            };
            Summary.prototype._getOverlayPlaceIds = function () {
                var placeIds = Enumerable.From(this.placeOverlays())
                    .Select(function (x) {
                    return x.placeId;
                })
                    .ToArray();
                return placeIds;
            };
            Summary.prototype.clickPlaceOverlay = function (overlay, e) {
                var place = this._getPlaceById(overlay.placeId);
                if (this.placeId() == place.id) {
                    var paramObject = {
                        placeNames: place.name,
                        placeIds: place.id,
                        pivot: 1,
                        keyword: '',
                        ancestorId: this.selectedTenant()
                    };
                    location.href = 'table/?' + $.param(paramObject);
                }
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
                if (!Summary._isD3Defined() ||
                    !this.settings.geoChart.googleElementId ||
                    !this.settings.geoChart.boxElementId)
                    return;
                var dInjectRootElementId = '{0}_place_overlays_root'
                    .format(this.settings.geoChart.googleElementId);
                if ($('#{0}'.format(dInjectRootElementId)).length)
                    return;
                var dGoogleG = d3.select('#{0} svg > g'.format(this.settings.geoChart.googleElementId));
                var dInjectRoot = dGoogleG.append('g')
                    .attr('id', dInjectRootElementId);
                var areOverlaysVisible = this.arePlaceOverlaysVisible();
                if (!areOverlaysVisible)
                    dInjectRoot.attr('style', 'display: none;');
                var jContainer = $('#{0} .overlays .places .data'
                    .format(this.settings.geoChart.boxElementId));
                jContainer.show();
                var overlays = this.placeOverlays();
                $.each(overlays, function (i, overlay) {
                    _this._svgInjectPlaceOverlay(dInjectRoot, overlay);
                });
                jContainer.hide();
                $('#{0} svg > g > g:last-child'
                    .format(this.settings.geoChart.googleElementId))
                    .insertAfter('#{0} svg > g > g:nth-child(2)'
                    .format(this.settings.geoChart.googleElementId));
            };
            Summary.prototype._svgInjectPlaceOverlay = function (root, overlay) {
                var jOverlay = $('#{0} .overlays .places .data .{1}'
                    .format(this.settings.geoChart.boxElementId, overlay.className));
                var dOverlay = root.append('g').attr('class', overlay.className);
                var x = jOverlay.position().left;
                var y = jOverlay.position().top;
                var width = jOverlay.outerWidth();
                var height = jOverlay.outerHeight();
                var noHoverImage = dOverlay.append('image')
                    .attr('xlink:href', overlay.imageSwapper.noHoverSrc())
                    .attr('x', x).attr('y', y)
                    .attr('width', width).attr('height', height)
                    .attr('class', 'no-hover');
                var hoverImage = dOverlay.append('image')
                    .attr('xlink:href', overlay.imageSwapper.hoverSrc())
                    .attr('x', x).attr('y', y)
                    .attr('width', width).attr('height', height)
                    .attr('class', 'hover').attr('style', 'display: none;');
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
                    }
                    else {
                        noHover.attr('style', '');
                        hover.attr('style', 'display:none');
                    }
                });
                this.placeId.subscribe(function (newValue) {
                    var placeId = _this.placeId();
                    if (placeId == overlay.placeId) {
                        hover.attr('style', '');
                        noHover.attr('style', 'display:none');
                    }
                    else {
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
                    var jOverlay = $('#{0} .overlays .places .ui .{1}'
                        .format(_this.settings.geoChart.boxElementId, overlay.className));
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
                        within: '#{0}'.format(this.settings.geoChart.googleElementId),
                    },
                    open: function (e, ui) {
                        var width = ui.tooltip.find('.ui-tooltip-content').outerWidth();
                        ui.tooltip.css({ width: '{0}px'.format(width) });
                    },
                });
            };
            Summary.prototype._applyPlaceOverlayTotals = function (places) {
                var isPivotPeople = this.isPivotPeople();
                var placeOverlays = this.placeOverlays();
                $.each(placeOverlays, function (i, overlay) {
                    var total = Enumerable.From(places)
                        .Where(function (x) {
                        return x.id == overlay.placeId;
                    })
                        .Sum(function (x) {
                        return isPivotPeople ? x.peopleCount : x.count;
                    });
                    overlay.total(total);
                });
            };
            Summary._googleVisualizationLoadedPromise = $.Deferred();
            Summary._pivotDefault = DataGraphPivot.activities;
            Summary._pivotKey = 'EmployeeSummaryPivot';
            Summary._placeIdDefault = 1;
            Summary._placeIdKey = 'EmployeeSummaryPlaceId';
            Summary._establishmentIdKey = 'EmployeeSummaryEstablishmentId';
            return Summary;
        })();
        ViewModels.Summary = Summary;
    })(ViewModels = Employees.ViewModels || (Employees.ViewModels = {}));
})(Employees || (Employees = {}));
