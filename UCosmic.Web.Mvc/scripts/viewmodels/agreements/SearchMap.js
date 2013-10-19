var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/linq/linq.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../../app/Pagination.d.ts" />
    /// <reference path="../../app/Pager.ts" />
    /// <reference path="ApiModels.d.ts" />
    /// <reference path="../places/ApiModels.d.ts" />
    /// <reference path="../places/Utils.ts" />
    (function (ViewModels) {
        var SearchMap = (function () {
            //#endregion
            //#region Construction & Initialization
            function SearchMap(settings) {
                var _this = this;
                this.settings = settings;
                //#region Search Filter Inputs
                // throttle keyword to reduce number API requests
                this.keyword = ko.observable(sessionStorage.getItem(SearchMap.KeywordSessionKey) || '');
                this.keywordThrottled = ko.computed(this.keyword).extend({ throttle: 400 });
                // instead of throttling, both this and the options are observed
                this.continentCode = ko.observable(parseInt(sessionStorage.getItem(SearchMap.ContinentSessionKey)) || 'any');
                this.countryCode = ko.observable(sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
                this.zoom = ko.observable(parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
                this.lat = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap._defaultMapCenter.lat());
                this.lng = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap._defaultMapCenter.lng());
                // automatically save the search inputs to session when they change
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');
                    if (_this.continentCode() == undefined)
                        _this.continentCode('any');

                    sessionStorage.setItem(SearchMap.KeywordSessionKey, _this.keyword() || '');
                    sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                    sessionStorage.setItem(SearchMap.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchMap.ZoomSessionKey, _this.zoom().toString());
                    sessionStorage.setItem(SearchMap.LatSessionKey, _this.lat().toString());
                    sessionStorage.setItem(SearchMap.LngSessionKey, _this.lng().toString());
                }).extend({ throttle: 0 });
                this.north = ko.observable();
                this.south = ko.observable();
                this.east = ko.observable();
                this.west = ko.observable();
                this.latitude = ko.observable();
                this.longitude = ko.observable();
                this.mag = ko.observable();
                //private mapViewportChanged = ko.computed((): void => { this._onMapViewportChanged(); }).extend({ throttle: 500 });
                //private _onMapViewportChanged(): void {
                //    var mag = this.mag();
                //    var lat = this.latitude();
                //    var lng = this.longitude();
                //    if (this._isActivated && this._isActivated() && mag != this.zoom()) {
                //        google.maps.event.addListenerOnce(this._googleMap, 'idle', (): void => {
                //            this.zoom(mag);
                //            this.lat(lat);
                //            this.lng(lng);
                //            this._setLocation();
                //        });
                //    }
                //}
                //#endregion
                //#region Country & Continent Options
                // initial options show loading message
                this.countries = ko.observableArray();
                this.countryOptions = ko.computed(function () {
                    return _this._computeCountryOptions();
                });
                this.continentOptions = ko.computed(function () {
                    return _this._computeContinentOptions();
                });
                this.routeFormat = '#/{0}/continent/{5}/country/{1}/zoom/{2}/latitude/{3}/longitude/{4}/'.format(this.settings.route).replace('{5}', '{0}');
                this._isActivated = ko.observable(false);
                this._route = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeRoute();
                });
                //#endregion
                //#region Query Scoping
                this._scopeHistory = ko.observableArray();
                this._currentScope = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeCurrentScope();
                });
                this._scopeDirty = ko.computed(function () {
                    _this._onScopeDirty();
                }).extend({ throttle: 1 });
                //#endregion
                //#region Navigational Binding
                this._markers = ko.observableArray();
                this._mapCreated = this._createMap();
                this._loadCountryOptions();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
            }
            SearchMap.prototype._createMap = function () {
                var _this = this;
                google.maps.visualRefresh = true;
                var element = document.getElementById('google_map_canvas');
                var options = {
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: new google.maps.LatLng(this.lat(), this.lng()),
                    zoom: this.zoom(),
                    draggable: true,
                    scrollwheel: false,
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL
                    }
                };
                this._googleMap = new google.maps.Map(element, options);
                var deferred = $.Deferred();
                google.maps.event.addListenerOnce(this._googleMap, 'idle', function () {
                    google.maps.event.addListener(_this._googleMap, 'center_changed', function () {
                        _this._onMapCenterChanged();
                    });
                    google.maps.event.addListener(_this._googleMap, 'zoom_changed', function () {
                        _this._onMapZoomChanged();
                    });
                    google.maps.event.addListener(_this._googleMap, 'bounds_changed', function () {
                        _this._onMapBoundsChanged();
                    });
                    google.maps.event.trigger(_this._googleMap, 'center_changed');
                    google.maps.event.trigger(_this._googleMap, 'zoom_changed');
                    google.maps.event.trigger(_this._googleMap, 'bounds_changed');
                    deferred.resolve();
                });
                return deferred;
            };

            SearchMap.prototype._onMapZoomChanged = function () {
                this.mag(this._googleMap.getZoom());
            };

            SearchMap.prototype._onMapCenterChanged = function () {
                var center = this._googleMap.getCenter();
                this.latitude(center.lat());
                this.longitude(center.lng());
            };

            SearchMap.prototype._onMapBoundsChanged = function () {
                var bounds = this._googleMap.getBounds();
                var north = bounds.getNorthEast().lat();
                var south = bounds.getSouthWest().lat();
                var east = bounds.getNorthEast().lng();
                var west = bounds.getSouthWest().lng();
                var maxLength = 11;
                this.north(Number(north.toString().substring(0, maxLength)));
                this.south(Number(south.toString().substring(0, maxLength)));
                this.east(Number(east.toString().substring(0, maxLength)));
                this.west(Number(west.toString().substring(0, maxLength)));
            };

            SearchMap.prototype._computeCountryOptions = function () {
                var options = [
                    {
                        code: this.countryCode(),
                        name: '[Loading...]'
                    }
                ];
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
                var options = [
                    {
                        code: this.continentCode(),
                        name: '[Loading...]'
                    }
                ];
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
                // this will run once during construction
                // this will run before sammy and applyBindings...
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                    // ...but this will run after sammy and applyBindings
                    _this.countries(response);
                    deferred.resolve();
                });
                return deferred;
            };

            SearchMap.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                // sammy will run the first route that it matches
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;
                    return viewModel._onBeforeRoute(e);
                });

                // do this when we already have hashtag parameters in the page
                this.sammy.get(this.routeFormat.format(':continent', ':country', ':zoom', ':lat', ':lng'), function () {
                    var e = this;
                    viewModel._onRoute(e);
                });

                // activate the page route (create default hashtag parameters)
                this.sammy.get(this.settings.activationRoute || this.sammy.getLocation(), function () {
                    var e = this;
                    viewModel.onBeforeActivation(e);
                });

                if (!this.settings.sammy && !this.sammy.isRunning())
                    this.sammy.run();
            };

            SearchMap.prototype._onBeforeRoute = function (e) {
                return true;
            };

            SearchMap.prototype._onRoute = function (e) {
                var continent = e.params['continent'];
                var country = e.params['country'];
                var zoom = e.params['zoom'];
                var lat = e.params['lat'];
                var lng = e.params['lng'];

                this.continentCode(continent);
                this.countryCode(country);
                this.zoom(parseInt(zoom));
                this.lat(parseFloat(lat));
                this.lng(parseFloat(lng));

                if (!this._isActivated())
                    this._isActivated(true);
            };

            SearchMap.prototype.onBeforeActivation = function (e) {
                this._setLocation();
            };

            SearchMap.prototype._computeRoute = function () {
                // build what the route should be, based on current filter inputs
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                var zoom = this.zoom();
                var lat = this.lat();
                var lng = this.lng();
                var route = this.routeFormat.format(continentCode, countryCode, zoom, lat, lng);
                return route;
            };

            SearchMap.prototype._setLocation = function () {
                var _this = this;
                // only set the href hashtag to trigger sammy when the current route is stale
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    setTimeout(function () {
                        _this.sammy.setLocation(route);
                    }, 1);
                }
            };

            SearchMap.prototype._computeCurrentScope = function () {
                var scope = {
                    continentCode: this.continentCode(),
                    countryCode: this.countryCode()
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

                if (!lastScope || lastScope.countryCode != thisScope.countryCode || lastScope.continentCode != thisScope.continentCode) {
                    this._scopeHistory.push(thisScope);
                    $.when(this._mapCreated).then(function () {
                        _this._load();
                    });
                }
            };

            SearchMap.prototype._load = function () {
                var _this = this;
                var placeType = '';
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                if (continentCode == 'any' && countryCode == 'any') {
                    placeType = 'continents';
                } else if (countryCode == 'any') {
                    placeType = 'countries';
                }
                var responseReceived = this._sendRequest(placeType);
                $.when(responseReceived).done(function () {
                    _this._receiveResponse(placeType);
                });
            };

            SearchMap.prototype._sendRequest = function (placeType) {
                var _this = this;
                var deferred = $.Deferred();

                if (placeType == 'countries' && !this._continentsResponse) {
                    var continentsReceived = this._sendRequest('continents');
                    $.when(continentsReceived).then(function () {
                        _this._sendRequest('countries').done(function () {
                            deferred.resolve();
                        });
                    });
                } else if ((placeType == 'continents' && !this._continentsResponse) || (placeType == 'countries' && !this._countriesResponse) || !placeType) {
                    $.ajax({
                        url: this.settings.partnerPlacesApi.format(placeType)
                    }).done(function (response) {
                        if (placeType == 'continents') {
                            _this._continentsResponse = ko.observableArray(response);
                        } else if (placeType == 'countries') {
                            _this._countriesResponse = ko.observableArray(response);
                        } else {
                            _this._partnersResponse = ko.observableArray(response);
                        }
                        deferred.resolve();
                    }).fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to load agreement map data', true);
                        deferred.reject();
                    });
                } else {
                    deferred.resolve();
                }

                return deferred;
            };

            SearchMap.prototype._receiveResponse = function (placeType) {
                var places = placeType == 'continents' ? this._continentsResponse() : placeType == 'countries' ? this._countriesResponse() : this._partnersResponse();

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

                this._clearMarkers();
                this._setMapViewport(placeType, places);
                this._plotMarkers(placeType, places);
                this._updateRoute();
            };

            SearchMap.prototype._clearMarkers = function () {
                var markers = this._markers() || [];
                for (var i = 0; i < markers.length; i++) {
                    var marker = markers[i];
                    marker.setMap(null);
                    marker = null;
                }
                this._markers([]);
            };

            SearchMap.prototype._setMapViewport = function (placeType, places) {
                if (placeType == 'continents') {
                    if (this._googleMap.getZoom() != 1) {
                        this._googleMap.setZoom(1);
                        this._googleMap.setCenter(SearchMap._defaultMapCenter);
                    }
                } else if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    var bounds;

                    if (!places.length) {
                        if (continentCode && this._continentsResponse) {
                            var continent = Enumerable.From(this._continentsResponse()).SingleOrDefault(undefined, function (x) {
                                return x.continentCode == continentCode;
                            });
                            if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                                bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                            }
                        }
                    } else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    } else {
                        bounds = new google.maps.LatLngBounds();
                        var latLngs = Enumerable.From(places).Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            bounds.extend(latLng);
                        });
                        this._googleMap.fitBounds(bounds);
                    }

                    if (bounds) {
                        this._googleMap.fitBounds(bounds);
                    } else if (this._googleMap.getZoom() != 1) {
                        this._googleMap.setZoom(1);
                        this._googleMap.setCenter(SearchMap._defaultMapCenter);
                    }
                } else {
                    var countryCode = this.countryCode();
                    var bounds;

                    if (!places.length) {
                        if (continentCode && this._continentsResponse) {
                            var continent = Enumerable.From(this._continentsResponse()).SingleOrDefault(undefined, function (x) {
                                return x.continentCode == continentCode;
                            });
                            if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                                bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                            }
                        }
                    } else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    } else {
                        bounds = new google.maps.LatLngBounds();
                        var latLngs = Enumerable.From(places).Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            bounds.extend(latLng);
                        });
                        this._googleMap.fitBounds(bounds);
                    }

                    if (bounds) {
                        this._googleMap.fitBounds(bounds);
                    } else if (this._googleMap.getZoom() != 1) {
                        this._googleMap.setZoom(1);
                        this._googleMap.setCenter(SearchMap._defaultMapCenter);
                    }
                }
            };

            SearchMap.prototype._plotMarkers = function (placeType, places) {
                var _this = this;
                var scaler = placeType == 'countries' ? this._getMarkerIconScaler(placeType, this._countriesResponse()) : this._getMarkerIconScaler(placeType, places);
                var continentCode = this.continentCode();
                if (placeType == 'countries' && !places.length && continentCode != 'none') {
                    var continent = Enumerable.From(this._continentsResponse()).SingleOrDefault(undefined, function (x) {
                        return x.continentCode == continentCode;
                    });
                    if (continent) {
                        places = [continent];
                    }
                }
                $.each(places, function (i, place) {
                    if (placeType == 'continents' && !place.agreementCount)
                        return;
                    var options = {
                        map: _this._googleMap,
                        position: Places.Utils.convertToLatLng(place.center),
                        title: '{0} - {1} agreement(s)'.format(place.name, place.agreementCount),
                        clickable: true,
                        cursor: 'pointer'
                    };
                    _this._setMarkerIcon(options, place.agreementCount.toString(), scaler);
                    var marker = new google.maps.Marker(options);
                    _this._markers.push(marker);
                    google.maps.event.addListener(marker, 'mouseover', function (e) {
                        marker.setOptions({
                            zIndex: 1000
                        });
                    });
                    if (placeType === 'continents') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            _this._googleMap.fitBounds(Places.Utils.convertToLatLngBounds(place.boundingBox));
                            if (place.id < 1) {
                                _this.continentCode('none');
                            } else {
                                _this.continentCode(place.continentCode);
                            }
                        });
                    } else if (placeType === 'countries') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.id > 0)
                                _this.countryCode(place.countryCode);
                        });
                    }
                });
            };

            SearchMap.prototype._updateRoute = function () {
                this.lat(this.latitude());
                this.lng(this.longitude());
                this.zoom(this.mag());
                this._setLocation();
            };

            SearchMap.prototype._getMarkerIconScaler = function (placeType, places) {
                var from = {
                    min: Enumerable.From(places).Min(function (x) {
                        return x.agreementCount;
                    }),
                    max: Enumerable.From(places).Max(function (x) {
                        return x.agreementCount;
                    })
                };
                var into = { min: 24, max: 48 };
                if (!placeType)
                    into = { min: 16, max: 24 };

                return new Scaler(from, into);
            };

            SearchMap.prototype._setMarkerIcon = function (options, text, scaler) {
                var side = isNaN(parseInt(text)) ? 24 : scaler.scale(parseInt(text));
                if (text == '0') {
                    side = 16;
                }
                var halfSide = side / 2;
                var settings = {
                    opacity: 0.75,
                    side: side,
                    text: text
                };
                var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(settings));
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
            };
            SearchMap._defaultMapCenter = new google.maps.LatLng(0, 17);

            SearchMap.KeywordSessionKey = 'AgreementSearchKeyword2';
            SearchMap.CountrySessionKey = 'AgreementSearchCountry2';
            SearchMap.ContinentSessionKey = 'AgreementSearchContinent';
            SearchMap.ZoomSessionKey = 'AgreementSearchZoom';
            SearchMap.LatSessionKey = 'AgreementSearchLat';
            SearchMap.LngSessionKey = 'AgreementSearchLng';
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
                    // compute the percentage above min for the point
                    var factor = (point - this.from.min) / fromRange;

                    // multiply the percentage by the range going into
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
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
