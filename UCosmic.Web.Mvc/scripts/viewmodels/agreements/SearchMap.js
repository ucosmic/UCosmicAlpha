var Agreements;
(function (Agreements) {
    var ViewModels;
    (function (ViewModels) {
        var SearchMap = (function () {
            function SearchMap(settings) {
                var _this = this;
                this.settings = settings;
                this.zoom = ko.observable(parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
                this.lat = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap.defaultMapCenter.lat());
                this.lng = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap.defaultMapCenter.lng());
                this.detailPreference = ko.observable(sessionStorage.getItem(SearchMap.DetailPrefSessionKey));
                this.detailPreferenceChecked = ko.computed({
                    read: function () { return _this.detailPreference() == '_blank'; },
                    write: function (value) { _this.detailPreference(value ? '_blank' : ''); },
                });
                this.continentCode = ko.observable(sessionStorage.getItem(SearchMap.ContinentSessionKey) || 'any');
                this.countryCode = ko.observable(sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
                this.placeId = ko.observable(parseInt(sessionStorage.getItem(SearchMap.PlaceIdSessionKey) || 0));
                this.typeCode = ko.observable(sessionStorage.getItem(SearchMap.TypeSessionKey) || 'any');
                this.initSessionTypeCode = sessionStorage.getItem(SearchMap.TypeSessionKey) || 'any';
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');
                    if (_this.continentCode() == undefined)
                        _this.continentCode('any');
                    if (_this.typeCode() == undefined)
                        _this.typeCode('any');
                    if (_this.typeCode() != 'any' && _this.typeCode() != undefined) {
                        _this._loadSummary(_this.typeCode());
                    }
                    sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                    sessionStorage.setItem(SearchMap.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchMap.TypeSessionKey, _this.typeCode());
                    sessionStorage.setItem(SearchMap.PlaceIdSessionKey, _this.placeId().toString());
                    sessionStorage.setItem(SearchMap.ZoomSessionKey, _this.zoom().toString());
                    sessionStorage.setItem(SearchMap.LatSessionKey, _this.lat().toString());
                    sessionStorage.setItem(SearchMap.LngSessionKey, _this.lng().toString());
                    sessionStorage.setItem(SearchMap.DetailPrefSessionKey, _this.detailPreference() || '');
                }).extend({ throttle: 0, });
                this._map = new App.GoogleMaps.Map('google_map_canvas', {
                    center: new google.maps.LatLng(this.lat(), this.lng()),
                    zoom: this.zoom(),
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                    },
                }, {
                    maxPrecision: 8,
                });
                this.status = {
                    agreementCount: ko.observable('?'),
                    partnerCount: ko.observable('?'),
                    countryCount: ko.observable('?'),
                };
                this.summary = {
                    agreementCount: ko.observable('?'),
                    partnerCount: ko.observable('?'),
                    countryCount: ko.observable('?'),
                };
                this.countries = ko.observableArray();
                this.countryOptions = ko.computed(function () {
                    return _this._computeCountryOptions();
                });
                this.continentOptions = ko.computed(function () {
                    return _this._computeContinentOptions();
                });
                this.typeOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this.routeFormat = '#/{0}/continent/{7}/country/{1}/type/{2}/place/{3}/zoom/{4}/latitude/{5}/longitude/{6}/'
                    .format(this.settings.route).replace('{7}', '{0}');
                this._isActivated = ko.observable(false);
                this.loadViewport = 0;
                this._route = ko.computed(function () {
                    return _this._computeRoute();
                });
                this._scopeHistory = ko.observableArray();
                this._currentScope = ko.computed(function () {
                    return _this._computeCurrentScope();
                });
                this._scopeDirty = ko.computed(function () {
                    _this._onScopeDirty();
                }).extend({ throttle: 1 });
                this._viewportHistory = ko.observableArray();
                this._currentViewport = ko.computed(function () {
                    return _this._computeCurrentViewport();
                });
                this._viewportDirty = ko.computed(function () {
                    _this._onViewportDirty();
                }).extend({ throttle: 1 });
                this.spinner = new App.Spinner({ delay: 400, });
                this.lastStatusRequestedCount = 0;
                this.infoWindowContent = {
                    partner: ko.observable({}),
                    agreements: ko.observableArray([]),
                };
                this._loadSummary(this.typeCode());
                this._loadCountryOptions();
                this._loadAgreementTypes();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
                this._map.ready().done(function () {
                    _this._map.onIdle(function () {
                        var idles = _this._map.idles();
                        setTimeout(function () {
                            if (idles == _this._map.idles() && !_this._map.isDragging() && _this._isActivated()) {
                                if (_this.zoom() != _this._map.zoom()
                                    || !SearchMap._areCoordinatesEqualEnough(_this.lat(), _this._map.lat())
                                    || !SearchMap._areCoordinatesEqualEnough(_this.lng(), _this._map.lng())) {
                                    _this.lat(_this._map.lat());
                                    _this.lng(_this._map.lng());
                                    _this.zoom(_this._map.zoom());
                                    _this.setLocation();
                                }
                            }
                        }, 1000);
                    });
                });
            }
            SearchMap.prototype.triggerMapResize = function () {
                return this._map.triggerResize();
            };
            SearchMap._areCoordinatesEqualEnough = function (coord1, coord2) {
                var diff = Math.abs(coord1 - coord2);
                return diff < 0.000001;
            };
            SearchMap.prototype._loadSummary = function (typeCode) {
                var _this = this;
                var url = this.settings.summaryApi;
                if (typeCode) {
                    var keyword = "!none!";
                    var countryCode = 'any';
                    url = url += "Table/" + countryCode + "/" + typeCode + "/" + keyword;
                }
                $.get(url)
                    .done(function (response) {
                    ko.mapping.fromJS(response, {}, _this.summary);
                });
            };
            SearchMap.prototype.clearFilter = function () {
                if (this.placeId())
                    this.placeId(0);
                else if (this.countryCode() != 'any')
                    this.countryCode('any');
                else if (this.continentCode() != 'any')
                    this.continentCode('any');
            };
            SearchMap.prototype._computeCountryOptions = function () {
                var options = [{
                        code: this.countryCode(),
                        name: '[Loading...]',
                    }];
                var countries = this.countries();
                if (countries && countries.length) {
                    var anyCountry = {
                        code: 'any',
                        name: '[All countries]',
                    };
                    var noCountry = {
                        code: 'none',
                        name: '[Without country]',
                    };
                    options = countries.slice(0);
                    var continentCode = this.continentCode();
                    if (continentCode != 'any' && continentCode != 'none') {
                        options = Enumerable.From(options)
                            .Where(function (x) {
                            return x.continentCode == continentCode;
                        }).ToArray();
                    }
                    options = Enumerable.From([anyCountry])
                        .Concat(options)
                        .Concat([noCountry]).ToArray();
                }
                return options;
            };
            SearchMap.prototype._computeContinentOptions = function () {
                var options = [{
                        code: this.continentCode(),
                        name: '[Loading...]',
                    }];
                var countries = this.countries();
                if (countries && countries.length) {
                    var anyContinent = {
                        code: 'any',
                        name: '[All continents]',
                    };
                    var noContinent = {
                        code: 'none',
                        name: '[Without continent]',
                    };
                    options = Enumerable.From(countries)
                        .Select(function (x) {
                        return {
                            code: x.continentCode,
                            name: x.continentName
                        };
                    })
                        .Distinct(function (x) {
                        return x.code;
                    })
                        .OrderBy(function (x) {
                        return x.name;
                    })
                        .ToArray();
                    options = Enumerable.From([anyContinent])
                        .Concat(options)
                        .Concat([noContinent]).ToArray();
                }
                return options;
            };
            SearchMap.prototype._loadCountryOptions = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get())
                    .done(function (response) {
                    _this.countries(response);
                    deferred.resolve();
                });
                return deferred;
            };
            SearchMap.prototype._loadAgreementTypes = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get("/api/agreements/agreement-types/0/")
                    .done(function (response) {
                    var options = response.slice(0);
                    var any = {
                        code: 'any',
                        name: '[All types]'
                    };
                    options = Enumerable.From([any]).Concat(options).ToArray();
                    _this.typeOptions(options);
                    _this.typeCode(_this.initSessionTypeCode);
                    deferred.resolve();
                });
                return deferred;
            };
            SearchMap.prototype.continentSelected = function () {
                this.countryCode('any');
                this.placeId(0);
            };
            SearchMap.prototype.countrySelected = function () {
                this.placeId(0);
            };
            SearchMap.prototype._runSammy = function () {
                var viewModel = this;
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)')
                    .replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;
                    return viewModel._onBeforeRoute(e);
                });
                this.sammy.get(this.routeFormat.format(':continent', ':country', ':type', ':place', ':zoom', ':lat', ':lng'), function () {
                    var e = this;
                    viewModel._onRoute(e);
                });
                this.sammy.get(this.settings.activationRoute || this.sammy.getLocation(), function () {
                    viewModel.setLocation();
                });
                if (!this.settings.sammy && !this.sammy.isRunning())
                    this.sammy.run();
            };
            SearchMap.prototype._onBeforeRoute = function (e) {
                var newLat = e.params['lat'];
                var newLng = e.params['lng'];
                var oldLat = this.lat();
                var oldLng = this.lng();
                var allowRoute = true;
                if (this._scopeHistory().length > 1 &&
                    parseInt(e.params['zoom']) == this.zoom() &&
                    this._areFloatsEqualEnough(parseFloat(newLat), oldLat) &&
                    this._areFloatsEqualEnough(parseFloat(newLng), oldLng)) {
                    return false;
                }
                return allowRoute;
            };
            SearchMap.prototype._areFloatsEqualEnough = function (value1, value2) {
                if (value1 == value2)
                    return true;
                var string1 = value1.toString();
                var string2 = value2.toString();
                var index1 = string1.indexOf('.');
                var index2 = string2.indexOf('.');
                if (index1 < 0 || index2 < 0)
                    return string1 == string2;
                var int1 = parseInt(string1.substr(0, index1));
                var int2 = parseInt(string2.substr(0, index2));
                if (int1 != int2)
                    return false;
                var precision1 = parseInt(string1.substr(index1 + 1));
                var precision2 = parseInt(string2.substr(index2 + 1));
                if (precision1 < 10000)
                    return precision1 == precision2;
                while (precision1.toString().length < precision2.toString().length) {
                    precision1 *= 10;
                }
                while (precision2.toString().length < precision1.toString().length) {
                    precision2 *= 10;
                }
                return Math.abs(precision1 - precision2) < 100;
                return true;
            };
            SearchMap.prototype._onRoute = function (e) {
                var continent = e.params['continent'];
                var country = e.params['country'];
                var type = e.params['type'];
                var placeId = e.params['place'];
                var zoom = e.params['zoom'];
                var lat = e.params['lat'];
                var lng = e.params['lng'];
                this.continentCode(continent);
                this.countryCode(country);
                this.typeCode(type);
                this.placeId(parseInt(placeId));
                this.zoom(parseInt(zoom));
                this.lat(parseFloat(lat));
                this.lng(parseFloat(lng));
                this.activate();
            };
            SearchMap.prototype.activate = function () {
                var _this = this;
                if (!this._isActivated()) {
                    if (this._map.map)
                        this._map.triggerResize();
                    this._scopeHistory([]);
                    this._viewportHistory([]);
                    $.when(this._map.ready()).then(function () {
                        _this._isActivated(true);
                    });
                }
            };
            SearchMap.prototype.deactivate = function () {
                if (this._isActivated())
                    this._isActivated(false);
            };
            SearchMap.prototype._computeRoute = function () {
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                var typeCode = this.typeCode();
                var placeId = this.placeId();
                var zoom = this.zoom();
                var lat = this.lat();
                var lng = this.lng();
                this.routeChanged = true;
                var route = this.routeFormat.format(continentCode, countryCode, typeCode, placeId, zoom, lat, lng);
                return route;
            };
            SearchMap.prototype.setLocation = function () {
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    this.sammy.setLocation(route);
                }
            };
            SearchMap.prototype._computeCurrentScope = function () {
                var scope = {
                    continentCode: this.continentCode(),
                    countryCode: this.countryCode(),
                    typeCode: this.typeCode(),
                    placeId: this.placeId(),
                };
                return scope;
            };
            SearchMap.prototype._onScopeDirty = function () {
                var _this = this;
                if (!this._isActivated())
                    return;
                var scopeHistory = this._scopeHistory();
                var lastScope = scopeHistory.length
                    ? Enumerable.From(scopeHistory).Last() : null;
                var thisScope = this._currentScope();
                if (!lastScope || lastScope.countryCode != thisScope.countryCode ||
                    lastScope.continentCode != thisScope.continentCode ||
                    (!isNaN(lastScope.placeId) && lastScope.placeId != thisScope.placeId) || lastScope.typeCode != thisScope.typeCode) {
                    this._scopeHistory.push(thisScope);
                    $.when(this._map.ready()).then(function () {
                        _this._map.triggerResize();
                        _this._load();
                    });
                }
            };
            SearchMap.prototype._computeCurrentViewport = function () {
                var viewport = {
                    zoom: this.zoom(),
                    center: new google.maps.LatLng(this.lat(), this.lng()),
                };
                return viewport;
            };
            SearchMap.prototype._onViewportDirty = function () {
                var _this = this;
                var zoom = this.zoom();
                var lat = this.lat();
                var lng = this.lng();
                if (!this._isActivated() || this.loadViewport)
                    return;
                var viewportHistory = this._viewportHistory();
                var lastViewport = viewportHistory.length
                    ? Enumerable.From(viewportHistory).Last() : null;
                var thisViewport = this._currentViewport();
                if (!lastViewport || lastViewport.zoom != thisViewport.zoom ||
                    !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lat(), thisViewport.center.lat()) ||
                    !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lng(), thisViewport.center.lng())) {
                    this._viewportHistory.push(thisViewport);
                    $.when(this._map.ready()).then(function () {
                        _this._map.setViewport(thisViewport).then(function () {
                            _this.setLocation();
                        });
                    });
                }
            };
            SearchMap.prototype._load = function () {
                var _this = this;
                this.spinner.start();
                if (!this.placeId()) {
                    this.status.agreementCount('?');
                    this.status.partnerCount('?');
                    var placeType = '';
                    var continentCode = this.continentCode();
                    var countryCode = this.countryCode();
                    var typeCode = this.typeCode();
                    if (continentCode == 'any' && countryCode == 'any') {
                        placeType = 'continents';
                    }
                    else if (countryCode == 'any') {
                        placeType = 'countries';
                    }
                    var placesReceived = this._requestPlaces(placeType);
                    $.when(placesReceived).done(function () {
                        _this._receivePlaces(placeType);
                        setTimeout(function () {
                            _this._requestPlaces('continents');
                            _this._requestPlaces('countries');
                            _this._requestPlaces('');
                        }, 0);
                    })
                        .always(function () {
                        _this.spinner.stop();
                    });
                }
                else {
                    var partnersReceived = this._requestPartners();
                    $.when(partnersReceived).done(function () {
                        _this._receivePartners();
                    })
                        .always(function () {
                        _this.spinner.stop();
                    });
                }
            };
            SearchMap.prototype._requestPlaces = function (placeType) {
                var _this = this;
                var deferred = $.Deferred();
                if (placeType == 'countries' && !this._continentsResponse) {
                    var continentsReceived = this._requestPlaces('continents');
                    $.when(continentsReceived).then(function () {
                        _this._requestPlaces('countries').done(function () {
                            deferred.resolve();
                        });
                    });
                }
                else if ((placeType == 'continents' && !this._continentsResponse) ||
                    (placeType == 'countries' && !this._countriesResponse) ||
                    (!placeType && !this._placesResponse)) {
                    $.get(this.settings.partnerPlacesApi.format(placeType))
                        .done(function (response) {
                        if (placeType == 'continents') {
                            _this._continentsResponse = ko.observableArray(response);
                        }
                        else if (placeType == 'countries') {
                            _this._countriesResponse = ko.observableArray(response);
                        }
                        else {
                            _this._placesResponse = ko.observableArray(response);
                        }
                        deferred.resolve();
                    })
                        .fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to load agreement map data', true);
                        deferred.reject();
                    });
                }
                else {
                    deferred.resolve();
                }
                return deferred;
            };
            SearchMap.prototype._receivePlaces = function (placeType) {
                var places = placeType == 'continents'
                    ? this._continentsResponse()
                    : placeType == 'countries'
                        ? this._countriesResponse()
                        : this._placesResponse();
                if (this.typeCode() != 'any') {
                    var type = this.typeCode();
                    places = places.map(function (x) {
                        x.agreementCount = x.agreementTypes.filter(function (value, index, test) {
                            if (value.indexOf(type) == -1) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }).length;
                        return x;
                    });
                }
                else {
                    places = places.map(function (x) {
                        x.agreementCount = x.agreementTypes.length;
                        return x;
                    });
                }
                if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    places = Enumerable.From(places)
                        .Where(function (x) {
                        return continentCode == 'none'
                            ? !x.id
                            : x.continentCode == continentCode;
                    })
                        .ToArray();
                }
                if (!placeType) {
                    var countryCode = this.countryCode();
                    places = Enumerable.From(places)
                        .Where(function (x) {
                        return countryCode == 'none'
                            ? !x.countryId
                            : x.countryCode == countryCode;
                    })
                        .ToArray();
                }
                this._updateStatus(placeType, places);
                this._plotMarkers(placeType, places);
                var viewportSettings = this._getMapViewportSettings(placeType, places);
                if (this._scopeHistory().length + this.loadViewport > 1) {
                    this._map.setViewport(viewportSettings).then(function () {
                    });
                    this._updateRoute();
                }
            };
            SearchMap.prototype._plotMarkers = function (placeType, places) {
                var _this = this;
                var scaler = placeType == 'countries'
                    ? this._getMarkerIconScaler(placeType, this._countriesResponse())
                    : this._getMarkerIconScaler(placeType, places);
                var continentCode = this.continentCode();
                if (placeType == 'countries' && !places.length && continentCode != 'none') {
                    var continent = Enumerable.From(this._continentsResponse())
                        .SingleOrDefault(undefined, function (x) {
                        return x.continentCode == continentCode;
                    });
                    if (continent) {
                        places = [continent];
                    }
                }
                var countryCode = this.countryCode();
                if (!placeType && !places.length && countryCode != 'none') {
                    var country = Enumerable.From(this.countryOptions())
                        .SingleOrDefault(undefined, function (x) {
                        return x.code == countryCode;
                    });
                    if (country) {
                        places = [{
                                id: country.id,
                                agreementCount: 0,
                                agreementTypes: [],
                                name: country.name,
                                center: country.center,
                                boundingBox: country.box,
                                isCountry: true,
                                countryCode: country.code,
                                continentCode: country.continentCode,
                            }];
                    }
                }
                var markers = [];
                $.each(places, function (i, place) {
                    if (!place.agreementCount)
                        return;
                    var title = '{0} - {1} agreement{2}\r\nClick for more information'
                        .format(place.name, place.agreementCount, place.agreementCount == 1 ? '' : 's');
                    if (!placeType)
                        title = '{0} agreement{1}\r\nClick for more information'
                            .format(place.agreementCount, place.agreementCount == 1 ? '' : 's');
                    var options = {
                        position: Places.Utils.convertToLatLng(place.center),
                        title: title,
                        clickable: place.agreementCount > 0,
                        cursor: 'pointer',
                    };
                    _this._setMarkerIcon(options, place.agreementCount.toString(), scaler);
                    var marker = new google.maps.Marker(options);
                    markers.push(marker);
                    if (place.agreementCount == 1) {
                        marker.set('ucosmic_agreement_id', place.agreementIds[0]);
                    }
                    google.maps.event.addListener(marker, 'mouseover', function (e) {
                        marker.setOptions({
                            zIndex: 201,
                        });
                    });
                    google.maps.event.addListener(marker, 'mouseout', function (e) {
                        var side = marker.getIcon().size.width;
                        setTimeout(function () {
                            marker.setOptions({
                                zIndex: 200 - side,
                            });
                        }, 400);
                    });
                    if (placeType === 'continents') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.agreementCount == 1) {
                                var url = _this.settings.detailUrl.format(place.agreementIds[0]);
                                var detailPreference = _this.detailPreference();
                                if (detailPreference == '_blank') {
                                    window.open(url, detailPreference);
                                }
                                else {
                                    location.href = url;
                                }
                            }
                            else {
                                if (place.id < 1) {
                                    _this.continentCode('none');
                                }
                                else {
                                    _this.continentCode(place.continentCode);
                                    _this.countryCode('any');
                                    _this.placeId(0);
                                }
                            }
                        });
                    }
                    else if (placeType === 'countries') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.agreementCount == 1) {
                                var url = _this.settings.detailUrl.format(place.agreementIds[0]);
                                var detailPreference = _this.detailPreference();
                                if (detailPreference == '_blank') {
                                    window.open(url, detailPreference);
                                }
                                else {
                                    location.href = url;
                                }
                            }
                            else if (place.id > 0) {
                                _this.continentCode('any');
                                _this.countryCode(place.countryCode);
                                _this.placeId(0);
                            }
                        });
                    }
                    else if (!placeType) {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.agreementCount == 1) {
                                var url = _this.settings.detailUrl.format(place.agreementIds[0]);
                                var detailPreference = _this.detailPreference();
                                if (detailPreference == '_blank') {
                                    window.open(url, detailPreference);
                                }
                                else {
                                    location.href = url;
                                }
                            }
                            else if (place.id) {
                                _this.placeId(place.id);
                            }
                        });
                    }
                });
                this._map.replaceMarkers(markers);
                var singleMarkers = Enumerable.From(markers)
                    .Where(function (x) {
                    var agreementId = x.get('ucosmic_agreement_id');
                    return !isNaN(agreementId) && agreementId > 0;
                })
                    .ToArray();
                if (singleMarkers.length) {
                    var agreementIds = Enumerable.From(singleMarkers)
                        .Select(function (x) {
                        return parseInt(x.get('ucosmic_agreement_id'));
                    }).ToArray();
                    $.get(this.settings.partnersApi, { agreementIds: agreementIds, })
                        .done(function (response) {
                        $.each(singleMarkers, function (i, singleMarker) {
                            var agreementId = parseInt(singleMarker.get('ucosmic_agreement_id'));
                            var partners = Enumerable.From(response)
                                .Where(function (x) {
                                return x.agreementId == agreementId;
                            }).ToArray();
                            if (!partners.length)
                                return;
                            if (!_this.placeId()) {
                                var title = singleMarker.getTitle().replace('\r\nClick for more information', '');
                                $.each(partners, function (i, partner) {
                                    title += '\r\n{0}'.format(partner.establishmentTranslatedName);
                                });
                                singleMarker.setTitle(title);
                            }
                        });
                    });
                }
            };
            SearchMap.prototype._getMapViewportSettings = function (placeType, places) {
                var settings = {
                    bounds: new google.maps.LatLngBounds(),
                };
                if (placeType == 'continents') {
                    settings.zoom = 1;
                    settings.center = SearchMap.defaultMapCenter;
                }
                else if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    if (!places.length) {
                        if (continentCode && this._continentsResponse) {
                            var continent = Enumerable.From(this._continentsResponse())
                                .SingleOrDefault(undefined, function (x) {
                                return x.continentCode == continentCode;
                            });
                            if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                                settings.bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                            }
                        }
                    }
                    else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    }
                    else {
                        var latLngs = Enumerable.From(places)
                            .Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            settings.bounds.extend(latLng);
                        });
                    }
                }
                else {
                    var countryCode = this.countryCode();
                    if (!places.length) {
                        if (countryCode && this.countryOptions) {
                            var countryOption = Enumerable.From(this.countryOptions())
                                .SingleOrDefault(undefined, function (x) {
                                return x.code == countryCode;
                            });
                            if (countryOption && countryOption.box && countryOption.box.hasValue) {
                                settings.bounds = Places.Utils.convertToLatLngBounds(countryOption.box);
                            }
                        }
                    }
                    else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    }
                    else {
                        var latLngs = Enumerable.From(places)
                            .Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            settings.bounds.extend(latLng);
                        });
                    }
                }
                return settings;
            };
            SearchMap.prototype._updateRoute = function () {
                var isDirty = false;
                if (!this._areFloatsEqualEnough(this.lat(), this._map.lat())) {
                    this.lat(this._map.lat());
                    isDirty = true;
                }
                if (this.routeChanged) {
                    isDirty = true;
                    this.routeChanged = false;
                }
                if (!this._areFloatsEqualEnough(this.lng(), this._map.lng())) {
                    this.lng(this._map.lng());
                    isDirty = true;
                }
                if (this.zoom() != this._map.zoom()) {
                    this.zoom(this._map.zoom());
                    isDirty = true;
                }
                isDirty = isDirty || (this.settings.activationRoute
                    && this.sammy.getLocation().indexOf(this.settings.activationRoute) < 0);
                if (isDirty) {
                    this.setLocation();
                }
                this.loadViewport--;
                if (this.loadViewport < 0)
                    this.loadViewport = 0;
            };
            SearchMap.prototype._loadStatus = function (countryCode, continentCode, typeCode) {
                var _this = this;
                var url = this.settings.summaryApi, lastStatusRequestedCountLocal;
                url = url += "Map/" + countryCode + "/" + typeCode + "/" + continentCode;
                this.status.agreementCount('?');
                this.status.partnerCount('?');
                this.lastStatusRequestedCount += 1;
                lastStatusRequestedCountLocal = this.lastStatusRequestedCount;
                $.get(url)
                    .done(function (response) {
                    if (lastStatusRequestedCountLocal == _this.lastStatusRequestedCount) {
                        _this.status.agreementCount(response.agreementCount.toString());
                        _this.status.partnerCount(response.partnerCount.toString());
                    }
                    else {
                        _this.status.agreementCount('?');
                        _this.status.partnerCount('?');
                    }
                });
            };
            SearchMap.prototype._updateStatus = function (placeType, places) {
                this._loadStatus(this.countryCode(), this.continentCode(), this.typeCode());
                if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    if (continentCode == 'none') {
                        this.status.countryCount('unknown continent');
                    }
                    else {
                        var continent = Enumerable.From(this.continentOptions())
                            .SingleOrDefault(undefined, function (x) {
                            return x.code == continentCode;
                        });
                        if (continent && continent.name) {
                            this.status.countryCount(continent.name);
                        }
                    }
                }
                else if (!placeType) {
                    var countryCode = this.countryCode();
                    if (countryCode == 'none') {
                        this.status.countryCount('unknown country');
                    }
                    else {
                        var country = Enumerable.From(this.countryOptions())
                            .SingleOrDefault(undefined, function (x) {
                            return x.code == countryCode;
                        });
                        if (country && country.name) {
                            this.status.countryCount(country.name);
                        }
                    }
                }
            };
            SearchMap.prototype._getMarkerIconScaler = function (placeType, places) {
                if (!places || !places.length)
                    return new Scaler({ min: 0, max: 1, }, { min: 16, max: 16, });
                var from = {
                    min: Enumerable.From(places).Min(function (x) { return x.agreementCount; }),
                    max: Enumerable.From(places).Max(function (x) { return x.agreementCount; }),
                };
                var into = { min: 24, max: 48 };
                if (!placeType)
                    into = { min: 24, max: 32 };
                return new Scaler(from, into);
            };
            SearchMap.prototype._setMarkerIcon = function (options, text, scaler) {
                var side = isNaN(parseInt(text)) ? 24 : scaler.scale(parseInt(text));
                if (text == '0') {
                    side = 24;
                }
                var halfSide = side / 2;
                var settings = {
                    opacity: 0.7,
                    side: side,
                    text: text,
                    fillColor: 'rgb(11, 11, 11)',
                };
                var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(settings));
                var icon = {
                    url: url,
                    size: new google.maps.Size(side, side),
                    anchor: new google.maps.Point(halfSide, halfSide),
                };
                var shape = {
                    type: 'circle',
                    coords: [halfSide, halfSide, halfSide],
                };
                options.icon = icon;
                options.shape = shape;
                options.zIndex = 200 - side;
            };
            SearchMap.prototype._requestPartners = function () {
                var _this = this;
                var deferred = $.Deferred();
                if (!this._placesResponse) {
                    var placesReceived = this._requestPlaces('');
                    $.when(placesReceived).then(function () {
                        _this._requestPartners().done(function () {
                            deferred.resolve();
                        });
                    });
                }
                else {
                    var placeId = this.placeId();
                    var place = Enumerable.From(this._placesResponse())
                        .SingleOrDefault(undefined, function (x) {
                        return x.id == placeId;
                    });
                    if (!place || !place.agreementCount) {
                        this.status.agreementCount('0');
                        this.status.partnerCount('0');
                        this.status.countryCount('this area');
                        deferred.reject();
                        this.spinner.stop();
                    }
                    else {
                        $.get(this.settings.partnersApi, { agreementIds: place.agreementIds, })
                            .done(function (response) {
                            _this._partnersResponse = ko.observableArray(response);
                            deferred.resolve();
                        })
                            .fail(function (xhr) {
                            App.Failures.message(xhr, 'while trying to load agreement partner data', true);
                            deferred.reject();
                        });
                    }
                }
                return deferred;
            };
            SearchMap.prototype._receivePartners = function () {
                var _this = this;
                var allPartners = this._partnersResponse();
                var uniquePartners = Enumerable.From(allPartners)
                    .Distinct(function (x) {
                    return x.establishmentId;
                })
                    .ToArray();
                var viewportSettings = {
                    bounds: new google.maps.LatLngBounds(),
                };
                if (uniquePartners.length == 1) {
                    var partner = uniquePartners[0];
                    viewportSettings.center = Places.Utils.convertToLatLng(partner.center);
                    if (partner.googleMapZoomLevel) {
                        viewportSettings.zoom = partner.googleMapZoomLevel;
                    }
                    else if (partner.boundingBox && partner.boundingBox.hasValue) {
                        viewportSettings.bounds = Places.Utils.convertToLatLngBounds(partner.boundingBox);
                    }
                }
                else if (uniquePartners.length > 1) {
                    $.each(uniquePartners, function (i, partner) {
                        viewportSettings.bounds.extend(Places.Utils.convertToLatLng(partner.center));
                    });
                }
                else {
                    alert('Found no agreement partners for place #{0}.'.format(this.placeId()));
                }
                var markers = [];
                var scaler = this._getMarkerIconScaler('', this._placesResponse());
                $.each(uniquePartners, function (i, partner) {
                    var agreements = Enumerable.From(allPartners)
                        .Where(function (x) {
                        return x.establishmentId == partner.establishmentId;
                    })
                        .Distinct(function (x) {
                        return x.agreementId;
                    }).ToArray();
                    var options = {
                        position: Places.Utils.convertToLatLng(partner.center),
                        title: '{0} - {1} agreement{2}'
                            .format(partner.establishmentTranslatedName, agreements.length, agreements.length == 1 ? '' : 's'),
                        clickable: true,
                        cursor: 'pointer',
                    };
                    _this._setMarkerIcon(options, agreements.length.toString(), scaler);
                    var marker = new google.maps.Marker(options);
                    markers.push(marker);
                    google.maps.event.addListener(marker, 'click', function (e) {
                        if (agreements.length == 1) {
                            var url = _this.settings.detailUrl.format(partner.agreementId);
                            var detailPreference = _this.detailPreference();
                            if (detailPreference == '_blank') {
                                window.open(url, detailPreference);
                            }
                            else {
                                location.href = url;
                            }
                        }
                        else {
                            _this.infoWindowContent.partner(partner);
                            _this.infoWindowContent.agreements(Enumerable.From(agreements)
                                .OrderByDescending(function (x) {
                                return x.agreementStartsOn;
                            })
                                .ToArray());
                            var content = _this.$infoWindow.html();
                            var options = {
                                content: $.trim(content),
                            };
                            _this._map.clearInfoWindows();
                            _this._map.openInfoWindowAtMarker(options, marker);
                        }
                    });
                });
                this._map.replaceMarkers(markers);
                if (markers.length == 1) {
                    google.maps.event.trigger(markers[0], 'click');
                }
                this.status.agreementCount(Enumerable.From(allPartners)
                    .Distinct(function (x) {
                    return x.agreementId;
                }).Count().toString());
                this.status.partnerCount(uniquePartners.length.toString());
                this.status.countryCount('this area');
                if (this._scopeHistory().length + this.loadViewport > 1) {
                    this._map.setViewport(viewportSettings).then(function () {
                        _this._updateRoute();
                    });
                }
            };
            SearchMap.defaultMapCenter = new google.maps.LatLng(0, 17);
            SearchMap.ContinentSessionKey = 'AgreementSearchContinent';
            SearchMap.CountrySessionKey = 'AgreementSearchCountry2';
            SearchMap.TypeSessionKey = 'AgreementTypeSearchCountry2';
            SearchMap.PlaceIdSessionKey = 'AgreementMapSearchPlaceId';
            SearchMap.ZoomSessionKey = 'AgreementSearchZoom';
            SearchMap.LatSessionKey = 'AgreementSearchLat';
            SearchMap.LngSessionKey = 'AgreementSearchLng';
            SearchMap.DetailPrefSessionKey = 'AgreementSearchMapDetailPreference';
            return SearchMap;
        })();
        ViewModels.SearchMap = SearchMap;
        var Scaler = (function () {
            function Scaler(from, into) {
                this.from = from;
                this.into = into;
            }
            Scaler.prototype.scale = function (point) {
                var scaled = this.into.min;
                var fromRange = this.from.max - this.from.min;
                var intoRange = this.into.max - this.into.min;
                if (fromRange) {
                    var factor = (point - this.from.min) / fromRange;
                    var emphasis = Math.round(factor * intoRange);
                    scaled += emphasis;
                }
                if (scaled < this.into.min)
                    scaled = this.into.min;
                if (scaled > this.into.max)
                    scaled = this.into.max;
                return scaled;
            };
            return Scaler;
        })();
        ViewModels.Scaler = Scaler;
    })(ViewModels = Agreements.ViewModels || (Agreements.ViewModels = {}));
})(Agreements || (Agreements = {}));
