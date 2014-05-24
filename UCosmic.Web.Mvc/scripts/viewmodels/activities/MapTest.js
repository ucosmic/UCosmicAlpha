var Activities;
(function (Activities) {
    (function (ViewModels) {
        var SearchMap = (function () {
            function SearchMap(output, parentObject) {
                var _this = this;
                this.continentCode = ko.observable(sessionStorage.getItem(SearchMap.ContinentSessionKey) || 'any');
                this.countryCode = ko.observable(sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
                this.placeId = ko.observable(parseInt(sessionStorage.getItem(SearchMap.PlaceIdSessionKey) || 0));
                this.continentName = ko.observable(sessionStorage.getItem('continentName') || '');
                this.zoom = ko.observable(parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
                this.lat = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap.defaultMapCenter.lat());
                this.lng = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap.defaultMapCenter.lng());
                this.detailPreference = ko.observable(sessionStorage.getItem(SearchMap.DetailPrefSessionKey));
                this.detailPreferenceChecked = ko.computed({
                    read: function () {
                        return _this.detailPreference() == '_blank';
                    },
                    write: function (value) {
                        _this.detailPreference(value ? '_blank' : '');
                    }
                });
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');
                    if (_this.continentCode() == undefined)
                        _this.continentCode('any');

                    sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                    sessionStorage.setItem(SearchMap.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchMap.PlaceIdSessionKey, _this.placeId().toString());
                    sessionStorage.setItem(SearchMap.ZoomSessionKey, _this.zoom().toString());
                    sessionStorage.setItem(SearchMap.LatSessionKey, _this.lat().toString());
                    sessionStorage.setItem(SearchMap.LngSessionKey, _this.lng().toString());
                    sessionStorage.setItem(SearchMap.DetailPrefSessionKey, _this.detailPreference() || '');
                }).extend({ throttle: 0 });
                this._map = new App.GoogleMaps.Map('google_map_canvas', {
                    center: new google.maps.LatLng(this.lat(), this.lng()),
                    zoom: this.zoom(),
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL
                    }
                }, {
                    maxPrecision: 8
                });
                this.countries = ko.observableArray();
                this.countryOptions = ko.computed(function () {
                    return _this._computeCountryOptions();
                });
                this.continentOptions = ko.computed(function () {
                    return _this._computeContinentOptions();
                });
                this._isActivated = ko.observable(false);
                this.loadViewport = 0;
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
                this.spinner = new App.Spinner({ delay: 400 });
                this.infoWindowContent = {
                    partner: ko.observable({}),
                    agreements: ko.observableArray([])
                };
                this.parentObject = parentObject;
                var stringActivityMapData;
                var activityMapData;
                var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
                var ancestorId = output.input.ancestorId ? output.input.ancestorId : "null";
                var keyword = output.input.keyword ? output.input.keyword : "null";

                if (stringActivityMapDataSearch == ancestorId + keyword) {
                    stringActivityMapData = sessionStorage.getItem('activityMapData');
                    activityMapData = $.parseJSON(stringActivityMapData);
                }

                if (activityMapData && activityMapData.length) {
                    this._loadInMapData(activityMapData);
                } else {
                    var settings = settings || {};

                    var url = '/api/usf.edu/employees/maptest/?ancestorid=' + ancestorId;
                    if (output.input.keyword) {
                        url += '&keyword=' + keyword;
                    }
                    settings.url = url;

                    this.parentObject.loadingSpinner.start();
                    $.ajax(settings).done(function (response) {
                        _this.parentObject.loadingSpinner.stop();

                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', ancestorId + keyword);
                        _this._loadInMapData(response);
                    }).fail(function (xhr) {
                    });
                }
            }
            SearchMap.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
            };

            SearchMap.prototype._loadInMapData = function (data) {
                var _this = this;
                var continents = Enumerable.From(data).GroupBy("$.continents.continentCode", "", "k, e => {" + "continentCode: k," + "boundingBox: e.Select($.place).FirstOrDefault().boundingBox," + "center: e.Select($.place).FirstOrDefault().center," + "name: e.Select($.place).FirstOrDefault().continentName," + "countryCode: null," + "isContinent: true," + "isCountry: false," + "isEarth: false," + "type: 'Continent'," + "count: e.Count()}").ToArray();

                var countries = Enumerable.From(data).GroupBy("$.countryCode", "", "k, e => {" + "countryCode: k," + "boundingBox: e.Select($.place).FirstOrDefault().boundingBox," + "center: e.Select($.place).FirstOrDefault().centerCountry," + "continentCode: e.Select($.place).FirstOrDefault().continentCode," + "name: e.Select($.place).FirstOrDefault().countryName," + "isContinent: false," + "isCountry: true," + "isEarth: false," + "type: 'Continent'," + "count: e.Count()}").ToArray();
                this.countries(continents);
                this._countriesResponse = ko.observableArray(countries);
                this._continentsResponse = ko.observableArray(continents);

                this.output = countries;

                this._map.ready().done(function () {
                    _this._map.onIdle(function () {
                        var idles = _this._map.idles();
                        setTimeout(function () {
                            if (idles == _this._map.idles() && !_this._map.isDragging() && _this._isActivated()) {
                                if (_this.zoom() != _this._map.zoom() || !SearchMap._areCoordinatesEqualEnough(_this.lat(), _this._map.lat()) || !SearchMap._areCoordinatesEqualEnough(_this.lng(), _this._map.lng())) {
                                    _this.lat(_this._map.lat());
                                    _this.lng(_this._map.lng());
                                    _this.zoom(_this._map.zoom());
                                }
                            }
                        }, 1000);
                    });
                    _this._load();
                });
            };

            SearchMap.prototype.triggerMapResize = function () {
                return this._map.triggerResize();
            };

            SearchMap._areCoordinatesEqualEnough = function (coord1, coord2) {
                var diff = Math.abs(coord1 - coord2);
                return diff < 0.000001;
            };

            SearchMap.prototype.serializeObject = function (object) {
                var o = {};
                var a = object.serializeArray();
                $.each(a, function () {
                    if (o[this.name] !== undefined) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            };

            SearchMap.prototype.reloadData = function (form) {
                var _this = this;
                if (this.parentObject.loadingSpinner.isVisible())
                    return;
                var stringActivityMapData;
                var activityMapData;
                var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
                var input = this.serializeObject($('form'));
                var ancestorId = input.ancestorId ? input.ancestorId : "null";
                var keyword = input.keyword ? input.keyword : "null";

                if (stringActivityMapDataSearch == ancestorId + keyword) {
                    stringActivityMapData = sessionStorage.getItem('activityMapData');
                    activityMapData = $.parseJSON(stringActivityMapData);
                }

                if (activityMapData && activityMapData.length) {
                    this._loadInMapData(activityMapData);
                } else {
                    this.parentObject.loadingSpinner.start();

                    var settings = settings || {};
                    var url = '{0}?{1}'.format('/api/usf.edu/employees/maptest/', $.param(input));
                    settings.url = url;

                    $.ajax(settings).done(function (response) {
                        _this.parentObject.loadingSpinner.stop();

                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', ancestorId + keyword);
                        _this._loadInMapData(response);
                    }).fail(function (xhr) {
                    });
                }
            };

            SearchMap.prototype.clearFilter = function () {
                this._receivePlaces('continents');
                sessionStorage.setItem('continentName', null);
                if (this.placeId())
                    this.placeId(0);
                else if (this.countryCode() != 'any')
                    this.countryCode('any');
                else if (this.continentCode() != 'any')
                    this.continentCode('any');
                this._receivePlaces('continents');
            };

            SearchMap.prototype._computeCountryOptions = function () {
                var options = [{
                        code: this.countryCode(),
                        name: '[Loading...]'
                    }];
                var countries = this.countries();
                if (countries && countries.length) {
                    var anyCountry = {
                        code: 'any',
                        name: '[All countries]'
                    };
                    var noCountry = {
                        code: 'none',
                        name: '[Without country]'
                    };
                    options = countries.slice(0);
                    var continentCode = this.continentCode();
                    if (continentCode != 'any' && continentCode != 'none') {
                        options = Enumerable.From(options).Where(function (x) {
                            return x.continentCode == continentCode;
                        }).ToArray();
                    }
                    options = Enumerable.From([anyCountry]).Concat(options).Concat([noCountry]).ToArray();
                }

                return options;
            };

            SearchMap.prototype._computeContinentOptions = function () {
                var options = [{
                        code: this.continentCode(),
                        name: '[Loading...]'
                    }];
                var countries = this.countries();
                if (countries && countries.length) {
                    var anyContinent = {
                        code: 'any',
                        name: '[All continents]'
                    };
                    var noContinent = {
                        code: 'none',
                        name: '[Without continent]'
                    };
                    options = Enumerable.From(countries).Select(function (x) {
                        return {
                            code: x.continentCode,
                            name: x.continentName
                        };
                    }).Distinct(function (x) {
                        return x.code;
                    }).OrderBy(function (x) {
                        return x.name;
                    }).ToArray();
                    options = Enumerable.From([anyContinent]).Concat(options).Concat([noContinent]).ToArray();
                }

                return options;
            };

            SearchMap.prototype._loadCountryOptions = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                    _this.countries(response);
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

            SearchMap.prototype._onBeforeRoute = function (e) {
                var newLat = e.params['lat'];
                var newLng = e.params['lng'];
                var oldLat = this.lat();
                var oldLng = this.lng();
                var allowRoute = true;

                if (this._scopeHistory().length > 1 && parseInt(e.params['zoom']) == this.zoom() && this._areFloatsEqualEnough(parseFloat(newLat), oldLat) && this._areFloatsEqualEnough(parseFloat(newLng), oldLng)) {
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
                var placeId = e.params['place'];
                var zoom = e.params['zoom'];
                var lat = e.params['lat'];
                var lng = e.params['lng'];

                this.continentCode(continent);
                this.countryCode(country);
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

            SearchMap.prototype._computeCurrentScope = function () {
                var scope = {
                    continentCode: this.continentCode(),
                    countryCode: this.countryCode(),
                    placeId: this.placeId()
                };
                return scope;
            };

            SearchMap.prototype._onScopeDirty = function () {
                var _this = this;
                if (!this._isActivated())
                    return;

                var scopeHistory = this._scopeHistory();
                var lastScope = scopeHistory.length ? Enumerable.From(scopeHistory).Last() : null;
                var thisScope = this._currentScope();

                if (!lastScope || lastScope.countryCode != thisScope.countryCode || lastScope.continentCode != thisScope.continentCode || lastScope.placeId != thisScope.placeId) {
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
                    center: new google.maps.LatLng(this.lat(), this.lng())
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
                var lastViewport = viewportHistory.length ? Enumerable.From(viewportHistory).Last() : null;
                var thisViewport = this._currentViewport();

                if (!lastViewport || lastViewport.zoom != thisViewport.zoom || !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lat(), thisViewport.center.lat()) || !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lng(), thisViewport.center.lng())) {
                    this._viewportHistory.push(thisViewport);
                    $.when(this._map.ready()).then(function () {
                        _this._map.setViewport(thisViewport).then(function () {
                        });
                    });
                }
            };

            SearchMap.prototype._load = function () {
                if (!this.placeId()) {
                    var placeType = '';
                    var continentCode = this.continentCode();
                    var countryCode = this.countryCode();
                    if (continentCode == 'any' && countryCode == 'any') {
                        placeType = 'continents';
                    } else if (countryCode == 'any') {
                        placeType = 'countries';
                    }
                    var placesReceived = this._requestPlaces(placeType);
                    this._requestPlaces('continents');
                    this._requestPlaces('countries');
                    this._requestPlaces('');
                    this._receivePlaces(placeType);
                } else {
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
                } else {
                    deferred.resolve();
                }

                return deferred;
            };

            SearchMap.prototype._receivePlaces = function (placeType) {
                var places = placeType == 'continents' ? this._continentsResponse() : this._countriesResponse();

                if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    places = Enumerable.From(places).Where(function (x) {
                        return continentCode == 'none' ? !x.id : x.continentCode == continentCode;
                    }).ToArray();
                }

                if (!placeType) {
                    var countryCode = this.countryCode();
                    places = Enumerable.From(places).Where(function (x) {
                        return countryCode == 'none' ? !x.countryId : x.countryCode == countryCode;
                    }).ToArray();
                }

                this._plotMarkers(placeType, places);

                var viewportSettings = this._getMapViewportSettings(placeType, places);

                this._map.setViewport(viewportSettings).then(function () {
                });
            };

            SearchMap.prototype._plotMarkers = function (placeType, places) {
                var _this = this;
                var scaler = placeType == 'countries' ? this._getMarkerIconScaler(placeType, this._countriesResponse()) : this._getMarkerIconScaler(placeType, this._continentsResponse());
                var continentCode = this.continentCode();
                if (placeType == 'countries' && !places.length && continentCode != 'none') {
                    var continent = Enumerable.From(this._continentsResponse()).SingleOrDefault(undefined, function (x) {
                        return x.continentCode == continentCode;
                    });
                    if (continent) {
                        places = [continent];
                    }
                }
                var countryCode = this.countryCode();
                if (!placeType && !places.length && countryCode != 'none') {
                    var country = Enumerable.From(this.countryOptions()).SingleOrDefault(undefined, function (x) {
                        return x.code == countryCode;
                    });
                    if (country) {
                        places = [{
                                id: country.id,
                                count: 0,
                                name: country.name,
                                center: country.center,
                                boundingBox: country.box,
                                isCountry: true,
                                countryCode: country.code,
                                continentCode: country.continentCode
                            }];
                    }
                }
                var markers = [];
                $.each(places, function (i, place) {
                    if (placeType == 'continents' && !place.count)
                        return;
                    var title = '{0} - {1} activit{2}\r\nClick for more information'.format(place.name, place.count, place.count == 1 ? 'y' : 'ies');
                    if (!placeType)
                        title = '{0} activit{1}\r\nClick for more information'.format(place.count, place.count == 1 ? 'y' : 'ies');
                    var options = {
                        position: Places.Utils.convertToLatLng(place.center),
                        title: title,
                        clickable: place.count > 0,
                        cursor: 'pointer'
                    };
                    _this._setMarkerIcon(options, place.count.toString(), scaler);
                    var marker = new google.maps.Marker(options);
                    markers.push(marker);

                    google.maps.event.addListener(marker, 'mouseover', function (e) {
                        marker.setOptions({
                            zIndex: 201
                        });
                    });
                    google.maps.event.addListener(marker, 'mouseout', function (e) {
                        var side = marker.getIcon().size.width;
                        setTimeout(function () {
                            marker.setOptions({
                                zIndex: 200 - side
                            });
                        }, 400);
                    });
                    if (placeType === 'continents') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                            _this.continentCode(place.continentCode);
                            _this.countryCode('any');
                            _this.continentName(place.name);
                            sessionStorage.setItem('continentName', _this.continentName());
                            _this.placeId(0);
                            _this.loadViewport++;
                            _this._receivePlaces('countries');
                        });
                    } else if (placeType === 'countries') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            var x = place;
                        });
                    }
                });
                this._map.replaceMarkers(markers);
            };

            SearchMap.prototype._getMapViewportSettings = function (placeType, places) {
                var settings = {
                    bounds: new google.maps.LatLngBounds()
                };

                if (placeType == 'continents') {
                    settings.zoom = 1;
                    settings.center = SearchMap.defaultMapCenter;
                } else if (placeType == 'countries') {
                    var continentCode = this.continentCode();

                    if (!places.length) {
                        if (continentCode && this._continentsResponse) {
                            var continent = Enumerable.From(this._continentsResponse()).SingleOrDefault(undefined, function (x) {
                                return x.continentCode == continentCode;
                            });
                            if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                                settings.bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                            }
                        }
                    } else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    } else {
                        var latLngs = Enumerable.From(places).Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            settings.bounds.extend(latLng);
                        });
                    }
                } else {
                    var countryCode = this.countryCode();

                    if (!places.length) {
                        if (countryCode && this.countryOptions) {
                            var countryOption = Enumerable.From(this.countryOptions()).SingleOrDefault(undefined, function (x) {
                                return x.code == countryCode;
                            });
                            if (countryOption && countryOption.box && countryOption.box.hasValue) {
                                settings.bounds = Places.Utils.convertToLatLngBounds(countryOption.box);
                            }
                        }
                    } else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    } else {
                        var latLngs = Enumerable.From(places).Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            settings.bounds.extend(latLng);
                        });
                    }
                }

                return settings;
            };

            SearchMap.prototype._getMarkerIconScaler = function (placeType, places) {
                if (!places || !places.length)
                    return new Scaler({ min: 0, max: 1 }, { min: 16, max: 16 });
                var from = {
                    min: Enumerable.From(places).Min(function (x) {
                        return x.count;
                    }),
                    max: Enumerable.From(places).Max(function (x) {
                        return x.count;
                    })
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
                    fillColor: 'rgb(11, 11, 11)'
                };
                var url = '{0}?{1}'.format("/api/graphics/circle", $.param(settings));
                var icon = {
                    url: url,
                    size: new google.maps.Size(side, side),
                    anchor: new google.maps.Point(halfSide, halfSide)
                };
                var shape = {
                    type: 'circle',
                    coords: [halfSide, halfSide, halfSide]
                };
                options.icon = icon;
                options.shape = shape;
                options.zIndex = 200 - side;
            };
            SearchMap.defaultMapCenter = new google.maps.LatLng(0, 17);

            SearchMap.ContinentSessionKey = 'AgreementSearchContinent';
            SearchMap.CountrySessionKey = 'AgreementSearchCountry2';
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
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
