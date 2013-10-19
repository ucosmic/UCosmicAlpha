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
    /// <reference path="../places/ApiModels.d.ts" />
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
                ////#endregion
                //#region Country Filter Options
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
                //#region Query Changes
                this._scopeHistory = ko.observableArray();
                this._currentScope = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeCurrentScope();
                });
                this._scopeDirty = ko.computed(function () {
                    _this._onScopeDirty();
                }).extend({ throttle: 1 });
                this._markers = ko.observableArray();
                //#endregion
                //#region Statistics
                this.north = ko.observable();
                this.south = ko.observable();
                this.east = ko.observable();
                this.west = ko.observable();
                this.latitude = ko.observable();
                this.longitude = ko.observable();
                this.mag = ko.observable();
                this._mapCreated = this._createMap();
                this._loadCountryOptions();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
            }
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
                this.lat(parseInt(lat));
                this.lng(parseInt(lng));

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
                        _this._bindMap();
                    });
                }
            };

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

            SearchMap.prototype._bindMap = function () {
                var _this = this;
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                if (continentCode == 'any' && countryCode == 'any') {
                    $.ajax({
                        url: this.settings.partnerPlacesApi.format('continents')
                    }).done(function (response) {
                        _this._onContinentsResponse(response);
                        _this.lat(_this.latitude());
                        _this.lng(_this.longitude());
                        _this.zoom(_this.mag());
                        _this._setLocation();
                    });
                } else if (continentCode != 'none' && countryCode == 'any') {
                    $.ajax({
                        url: this.settings.partnerPlacesApi.format('countries')
                    }).done(function (response) {
                        _this._onCountriesResponse(response);
                    });
                }
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

            //#endregion
            //#region Continent Scope
            SearchMap.prototype._onContinentsResponse = function (response) {
                this._clearMarkers();
                var countRange = {
                    min: Enumerable.From(response).Min(function (x) {
                        return x.agreementCount;
                    }),
                    max: Enumerable.From(response).Max(function (x) {
                        return x.agreementCount;
                    })
                };
                var scaler = new Scaler(countRange, { min: 24, max: 48 });
                for (var i = 0; i < response.length; i++) {
                    var continent = response[i];
                    this._onContinentResponse(continent, scaler);
                }
                this._googleMap.setZoom(1);
                this._googleMap.setCenter(SearchMap._defaultMapCenter);
            };

            SearchMap.prototype._onContinentResponse = function (continent, scaler) {
                var _this = this;
                var side = scaler.scale(continent.agreementCount);
                var halfSide = side / 2;
                var iconSettings = {
                    opacity: 0.8,
                    side: side,
                    text: continent.agreementCount
                };
                var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
                var icon = {
                    url: url,
                    size: new google.maps.Size(side, side),
                    anchor: new google.maps.Point(halfSide, halfSide)
                };
                var iconShape = {
                    type: 'circle',
                    coords: [halfSide, halfSide, halfSide]
                };
                var isClickable = continent.agreementCount > 0 && continent.id > 0;
                isClickable = true;
                var cursor = isClickable ? 'pointer' : 'default';
                var options = {
                    map: this._googleMap,
                    position: new google.maps.LatLng(continent.center.latitude, continent.center.longitude),
                    title: '{0} - {1} agreement(s)\r\nClick for more information'.format(continent.name, continent.agreementCount),
                    clickable: true,
                    cursor: cursor,
                    icon: icon,
                    shape: iconShape,
                    optimized: false
                };
                var marker = new google.maps.Marker(options);
                this._markers.push(marker);
                if (isClickable)
                    google.maps.event.addListener(marker, 'click', function (e) {
                        _this._onContinentClick(marker, continent, e);
                    });
            };

            SearchMap.prototype._onContinentClick = function (marker, continent, e) {
                var north = continent.boundingBox.northEast.latitude;
                var south = continent.boundingBox.southWest.latitude;
                var east = continent.boundingBox.northEast.longitude;
                var west = continent.boundingBox.southWest.longitude;
                var southWest = new google.maps.LatLng(south, west);
                var northEast = new google.maps.LatLng(north, east);
                var bounds = new google.maps.LatLngBounds(southWest, northEast);
                this._googleMap.fitBounds(bounds);

                //this._onMapCenterChanged();
                //this._onMapZoomChanged();
                //this.zoom(this.mag());
                //this.lat(this.latitude());
                //this.lng(this.longitude());
                //this._setLocation();
                // run query for country scope
                //this.scope('countries');
                this.continentCode(continent.continentCode);
                //this._scopedContinentId(continent.id);
                //if (continent.id != 0)
                //    this._bindMap();
            };

            //#endregion
            SearchMap.prototype._onCountriesResponse = function (response) {
                var _this = this;
                this._clearMarkers();
                var setUp = function () {
                    var continentCode = _this.continentCode();
                    var countries = Enumerable.From(response).Where(function (x) {
                        return x.continentCode == continentCode;
                    }).ToArray();
                    var bounds = new google.maps.LatLngBounds();
                    if (countries.length == 1) {
                        var country = countries[0];
                        var northEast = new google.maps.LatLng(country.boundingBox.northEast.latitude, country.boundingBox.northEast.longitude);
                        var southWest = new google.maps.LatLng(country.boundingBox.southWest.latitude, country.boundingBox.southWest.longitude);
                        bounds = new google.maps.LatLngBounds(southWest, northEast);
                        _this._googleMap.fitBounds(bounds);
                    } else if (countries.length > 1) {
                        var latLngs = Enumerable.From(countries).Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            bounds.extend(latLng);
                        });
                        _this._googleMap.fitBounds(bounds);
                    } else {
                        _this._googleMap.setCenter(SearchMap._defaultMapCenter);
                        _this._googleMap.setZoom(1);
                        if (continentCode != 'any') {
                            var continent = Enumerable.From(_this.continentOptions()).Single(function (x) {
                                return x.code == continentCode;
                            });
                            alert('No agreements found in {0}. Click your back button or select a different continent or country.'.format(continent.name));
                            //setTimeout(function (): void { history.back(); }, 100);
                        } else {
                            alert('No agreements found. Click your back button or select a different continent or country.');
                        }
                        //return;
                    }

                    google.maps.event.addListenerOnce(_this._googleMap, 'idle', function () {
                        var continentCode = _this.continentCode();
                        var countRange = {
                            min: Enumerable.From(response).Min(function (x) {
                                return x.agreementCount;
                            }),
                            max: Enumerable.From(response).Max(function (x) {
                                return x.agreementCount;
                            })
                        };
                        var scaler = new Scaler(countRange, { min: 24, max: 48 });
                        for (var i = 0; i < countries.length; i++) {
                            var country = countries[i];
                            _this._onCountryResponse(country, scaler, new google.maps.LatLngBounds());
                        }
                        _this.lat(_this.latitude());
                        _this.lng(_this.longitude());
                        _this.zoom(_this.mag());
                        _this._setLocation();
                    });
                };

                var zoom = this._googleMap.getZoom();
                if (zoom == 1) {
                    setUp();
                } else {
                    this._googleMap.setCenter(SearchMap._defaultMapCenter);
                    this._googleMap.setZoom(1);
                    google.maps.event.addListenerOnce(this._googleMap, 'idle', function () {
                        setUp();
                    });
                }
            };

            SearchMap.prototype._onCountryResponse = function (country, scaler, bounds) {
                var latLng = new google.maps.LatLng(country.center.latitude, country.center.longitude);
                var side = scaler.scale(country.agreementCount);
                var halfSide = side / 2;
                var iconSettings = {
                    opacity: 1,
                    side: side,
                    text: country.agreementCount
                };
                var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
                var icon = {
                    url: url,
                    size: new google.maps.Size(side, side),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(halfSide, halfSide)
                };
                var iconShape = {
                    type: 'circle',
                    coords: [halfSide, halfSide, halfSide]
                };
                var options = {
                    map: this._googleMap,
                    position: latLng,
                    title: '{0} - {1} agreement(s)\r\nClick for more information.'.format(country.name, country.agreementCount),
                    clickable: true,
                    cursor: 'pointer',
                    icon: icon,
                    shape: iconShape,
                    optimized: false
                };
                var marker = new google.maps.Marker(options);
                this._markers.push(marker);
                //if (isClickable)
                //    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                //        this._onContinentClick(marker, continent, e);
                //    });
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
