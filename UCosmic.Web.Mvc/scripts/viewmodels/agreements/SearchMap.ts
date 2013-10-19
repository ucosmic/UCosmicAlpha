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

module Agreements.ViewModels {

    export interface SearchMapSettings {
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
        sammy?: Sammy.Application;
        partnerPlacesApi: string;
        graphicsCircleApi: string;
    }

    export interface SearchMapScope {
        continentCode: string;
        countryCode: string;
    }

    export class SearchMap {
        //#region Search Filter Inputs

        // throttle keyword to reduce number API requests
        keyword: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.KeywordSessionKey) || '');
        keywordThrottled: KnockoutComputed<string> = ko.computed(this.keyword)
            .extend({ throttle: 400 });

        // instead of throttling, both this and the options are observed
        continentCode: KnockoutObservable<string> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ContinentSessionKey)) || 'any');
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');

        static _defaultMapCenter = new google.maps.LatLng(0, 17)

        zoom: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        lat: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap._defaultMapCenter.lat());
        lng: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap._defaultMapCenter.lng());

        //#endregion
        //#region Search Filter Input sessionStorage

        static KeywordSessionKey = 'AgreementSearchKeyword2';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static ContinentSessionKey = 'AgreementSearchContinent';
        static ZoomSessionKey = 'AgreementSearchZoom';
        static LatSessionKey = 'AgreementSearchLat';
        static LngSessionKey = 'AgreementSearchLng';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.continentCode() == undefined) this.continentCode('any');

            sessionStorage.setItem(SearchMap.KeywordSessionKey, this.keyword() || '');
            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchMap.ZoomSessionKey, this.zoom().toString());
            sessionStorage.setItem(SearchMap.LatSessionKey, this.lat().toString());
            sessionStorage.setItem(SearchMap.LngSessionKey, this.lng().toString());
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchMapSettings) {
            this._mapCreated = this._createMap();
            this._loadCountryOptions();
            this.sammy = this.settings.sammy || Sammy();
            this._runSammy();
        }

        //#endregion
        //#region Google Map

        private _googleMap: google.maps.Map;
        private _mapCreated: JQueryDeferred<void>;
        private _createMap(): JQueryDeferred<void> {
            google.maps.visualRefresh = true;
            var element = document.getElementById('google_map_canvas');
            var options: google.maps.MapOptions = {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: new google.maps.LatLng(this.lat(), this.lng()),
                zoom: this.zoom(), // zoom out
                draggable: true, // allow map panning
                scrollwheel: false, // prevent mouse wheel zooming
                streetViewControl: false,
                panControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                },
            };
            this._googleMap = new google.maps.Map(element, options);
            var deferred = $.Deferred();
            google.maps.event.addListenerOnce(this._googleMap, 'idle', (): void => {
                google.maps.event.addListener(this._googleMap, 'center_changed', (): void => {
                    this._onMapCenterChanged();
                })
                google.maps.event.addListener(this._googleMap, 'zoom_changed', (): void => {
                    this._onMapZoomChanged();
                })
                google.maps.event.addListener(this._googleMap, 'bounds_changed', (): void => {
                    this._onMapBoundsChanged();
                })
                google.maps.event.trigger(this._googleMap, 'center_changed');
                google.maps.event.trigger(this._googleMap, 'zoom_changed');
                google.maps.event.trigger(this._googleMap, 'bounds_changed');
                deferred.resolve();
            });
            return deferred;
        }

        north: KnockoutObservable<number> = ko.observable();
        south: KnockoutObservable<number> = ko.observable();
        east: KnockoutObservable<number> = ko.observable();
        west: KnockoutObservable<number> = ko.observable();
        latitude: KnockoutObservable<number> = ko.observable();
        longitude: KnockoutObservable<number> = ko.observable();
        mag: KnockoutObservable<number> = ko.observable();

        private _onMapZoomChanged(): void {
            this.mag(this._googleMap.getZoom());
        }

        private _onMapCenterChanged(): void {
            var center = this._googleMap.getCenter();
            this.latitude(center.lat());
            this.longitude(center.lng());
        }

        private _onMapBoundsChanged(): void {
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
        }

        //#endregion
        //#region Country & Continent Options

        // initial options show loading message
        countries: KnockoutObservableArray<Places.ApiModels.Country> = ko.observableArray();
        countryOptions = ko.computed((): Places.ApiModels.Country[]=> {
            return this._computeCountryOptions();
        });
        continentOptions = ko.computed((): any[]=> {
            return this._computeContinentOptions();
        });

        private _computeCountryOptions(): Places.ApiModels.Country[] {
            var options: Places.ApiModels.Country[] = [{
                code: this.countryCode(),
                name: '[Loading...]',
            }];
            var countries = this.countries();
            if (countries && countries.length) {
                var anyCountry: Places.ApiModels.Country = {
                    code: 'any',
                    name: '[All countries]',
                };
                var noCountry: Places.ApiModels.Country = {
                    code: 'none',
                    name: '[Without country]',
                };
                options = countries.slice(0);
                var continentCode = this.continentCode();
                if (continentCode != 'any' && continentCode != 'none') {
                    options = Enumerable.From(options)
                        .Where(function (x: Places.ApiModels.Country): boolean {
                            return x.continentCode == continentCode;
                        }).ToArray();
                }
                options = Enumerable.From([anyCountry])
                    .Concat(options)
                    .Concat([noCountry]).ToArray();
            }

            return options;
        }

        private _computeContinentOptions(): any[] {
            var options: any[] = [{
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
                    .Select(function (x: Places.ApiModels.Country): any {
                        return {
                            code: x.continentCode,
                            name: x.continentName
                        };
                    })
                    .Distinct(function (x: any): string {
                        return x.code;
                    })
                    .OrderBy(function (x: any): string {
                        return x.name;
                    })
                    .ToArray();
                options = Enumerable.From([anyContinent])
                    .Concat(options)
                    .Concat([noContinent]).ToArray();
            }

            return options;
        }

        private _loadCountryOptions(): JQueryDeferred<void> {
            // this will run once during construction
            // this will run before sammy and applyBindings...
            var deferred = $.Deferred();
            $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.ApiModels.Country[]): void => {
                    // ...but this will run after sammy and applyBindings
                    this.countries(response);
                    deferred.resolve();
                });
            return deferred;
        }

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/continent/{5}/country/{1}/zoom/{2}/latitude/{3}/longitude/{4}/'
            .format(this.settings.route).replace('{5}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            // sammy will run the first route that it matches
            var beforeRegex = new RegExp('\\{0}'.format(
                this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)')
                    .replace(/\//g, '\\/')));
            this.sammy.before(
                beforeRegex,
                function (): boolean {
                    var e: Sammy.EventContext = this;
                    return viewModel._onBeforeRoute(e);
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':continent', ':country', ':zoom', ':lat', ':lng'),
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._onRoute(e);
                });

            // activate the page route (create default hashtag parameters)
            this.sammy.get(
                this.settings.activationRoute || this.sammy.getLocation(),
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel.onBeforeActivation(e);
                });

            if (!this.settings.sammy && !this.sammy.isRunning())
                this.sammy.run();
        }

        private _onBeforeRoute(e: Sammy.EventContext): boolean {
            return true;
        }

        private _onRoute(e: Sammy.EventContext): void {
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
        }

        onBeforeActivation(e: Sammy.EventContext): void {
            this._setLocation(); // base activated route on current input filters
        }

        private _route: KnockoutComputed<string> = ko.computed((): string => {
            // this will run once during construction
            return this._computeRoute();
        });

        private _computeRoute(): string {
            // build what the route should be, based on current filter inputs
            var continentCode = this.continentCode();
            var countryCode = this.countryCode();
            var zoom = this.zoom();
            var lat = this.lat();
            var lng = this.lng();
            var route = this.routeFormat.format(continentCode, countryCode, zoom, lat, lng);
            return route;
        }

        private _setLocation(): void {
            // only set the href hashtag to trigger sammy when the current route is stale
            var route = this._route();
            if (this.sammy.getLocation().indexOf(route) < 0) {
                setTimeout((): void => {
                    this.sammy.setLocation(route);
                }, 1);
            }
        }

        //#endregion
        //#region Query Scoping

        private _scopeHistory: KnockoutObservableArray<SearchMapScope> = ko.observableArray();
        private _currentScope = ko.computed((): SearchMapScope => {
            // this will run once during construction
            return this._computeCurrentScope();
        });

        private _computeCurrentScope(): SearchMapScope {
            var scope: SearchMapScope = {
                continentCode: this.continentCode(),
                countryCode: this.countryCode(),
            };
            return scope;
        }

        private _scopeDirty = ko.computed((): void => {
            this._onScopeDirty();
        }).extend({ throttle: 1 });

        private _onScopeDirty(): void {
            if (!this._isActivated()) return;

            var scopeHistory = this._scopeHistory();
            var lastScope: SearchMapScope = scopeHistory.length
                ? Enumerable.From(scopeHistory).Last() : null;
            var thisScope = this._currentScope();

            if (!lastScope || lastScope.countryCode != thisScope.countryCode ||
                lastScope.continentCode != thisScope.continentCode) {
                this._scopeHistory.push(thisScope);
                $.when(this._mapCreated).then((): void => {
                    this._load();
                });
            }
        }

        //#endregion
        //#region Navigational Binding

        private _markers: KnockoutObservableArray<google.maps.Marker> = ko.observableArray();
        private _continentsResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _countriesResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _load(): void {
            var placeType = '';
            var continentCode = this.continentCode();
            var countryCode = this.countryCode();
            if (continentCode == 'any' && countryCode == 'any') {
                placeType = 'continents'
            }
            else if (countryCode == 'any') { // continentCode != 'any', but can be none or Antarctic
                placeType = 'countries'
            }
            var responseReceived = this._sendRequest(placeType);
            $.when(responseReceived).done((): void => {
                this._receiveResponse(placeType)
            });
        }

        private _sendRequest(placeType: string): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            // load continents before countries
            if (placeType == 'countries' && !this._continentsResponse) {
                deferred = this._sendRequest('continents');
            }

            else if ((placeType == 'continents' && !this._continentsResponse) ||
                (placeType == 'countries' && !this._countriesResponse)) {
                    $.ajax({
                        url: this.settings.partnerPlacesApi.format(placeType)
                    })
                        .done((response: ApiModels.PlaceWithAgreements[]): void => {
                            if (placeType == 'continents') {
                                this._continentsResponse = ko.observableArray(response);
                            }
                            else if (placeType == 'countries') {
                                this._countriesResponse = ko.observableArray(response);
                            }
                            deferred.resolve();
                        })
                        .fail((xhr: JQueryXHR): void => {
                            App.Failures.message(xhr, 'while trying to load agreement map data', true)
                            deferred.reject();
                        });
            }
            else {
                deferred.resolve();
            }

            return deferred;
        }

        private _receiveResponse(placeType: string): void {
            var places = placeType == 'continents'
                ? this._continentsResponse()
                : this._countriesResponse();

            if (placeType == 'countries') {
                var continentCode = this.continentCode();
                places = Enumerable.From(places)
                    .Where(function (x: any): boolean {
                        return continentCode == 'none'
                            ? x.id == 0
                            : x.continentCode == continentCode;
                    })
                    .ToArray();
            }

            this._clearMarkers();
            this._setMapViewport(placeType, places);
            this._plotMarkers(placeType, places);
            this._updateRoute();
        }

        private _clearMarkers(): void {
            var markers = this._markers() || [];
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                marker.setMap(null);
                marker = null;
            }
            this._markers([]);
        }

        private _setMapViewport(placeType: string, places: ApiModels.PlaceWithAgreements[]): void {
            // zoom map to level 1 in order to view continents
            if (placeType == 'continents' && this._googleMap.getZoom() != 1) {
                this._googleMap.setZoom(1);
                this._googleMap.setCenter(SearchMap._defaultMapCenter);
            }

            // zoom map for countries based on response length
            else if (placeType == 'countries') {
                var continentCode = this.continentCode();
                var bounds: google.maps.LatLngBounds;
                //#region zero places, try continent bounds
                if (!places.length) {
                    if (continentCode && this._continentsResponse) {
                        var continent: ApiModels.PlaceWithAgreements = Enumerable.From(this._continentsResponse())
                            .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithAgreements): boolean {
                                return x.continentCode == continentCode;
                            });
                        if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                            bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                        }
                    }
                }
                //#endregion
                //#region one place, try country bounds
                else if (places.length == 1) {
                    var country = places[0];
                    if (country && country.boundingBox && country.boundingBox.hasValue)
                        bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                }
                //#endregion
                //#region multiple places, extend bounds
                else {
                    bounds = new google.maps.LatLngBounds();
                    var latLngs = Enumerable.From(places)
                        .Select(function (x: ApiModels.PlaceWithAgreements): any {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                    $.each(latLngs, function (index: number, latLng: google.maps.LatLng): void {
                        bounds.extend(latLng);
                    });
                    this._googleMap.fitBounds(bounds);
                }
                //#endregion
                if (bounds) {
                    this._googleMap.fitBounds(bounds);
                }
                else if (this._googleMap.getZoom() != 1) {
                    this._googleMap.setZoom(1);
                    this._googleMap.setCenter(SearchMap._defaultMapCenter);
                }
            }
        }

        private _plotMarkers(placeType: string, places: ApiModels.PlaceWithAgreements[]) {
            var scaler = placeType == 'continents'
                ? this._getMarkerIconScaler(places)
                : this._getMarkerIconScaler(this._countriesResponse()); // scale based on all countries
            var continentCode = this.continentCode();
            if (placeType == 'countries' && !places.length && continentCode != 'none') {
                var continent = Enumerable.From(this._continentsResponse())
                    .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithAgreements): boolean {
                        return x.continentCode == continentCode;
                    });
                if (continent) {
                    places = [continent];
                }
            }
            $.each(places, (i: number, place: ApiModels.PlaceWithAgreements): void => {
                if (placeType == 'continents' && !place.agreementCount) return; // do not render zero on continent
                var options: google.maps.MarkerOptions = {
                    map: this._googleMap,
                    position: Places.Utils.convertToLatLng(place.center),
                    title: '{0} - {1} agreement(s)'
                        .format(place.name, place.agreementCount),
                    clickable: true,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, place.agreementCount.toString(), scaler);
                var marker = new google.maps.Marker(options);
                this._markers.push(marker);
                if (placeType === 'continents') {
                    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                        this._googleMap.fitBounds(Places.Utils.convertToLatLngBounds(place.boundingBox));
                        if (place.id < 1) {
                            this.continentCode('none'); // select none in continents dropdown menu
                        } else {
                            this.continentCode(place.continentCode);
                        }
                    });
                }
            });
        }

        private _updateRoute(): void {
            this.lat(this.latitude());
            this.lng(this.longitude());
            this.zoom(this.mag());
            this._setLocation();
        }

        private _getMarkerIconScaler(places: ApiModels.PlaceWithAgreements[]): Scaler {
            var from: Range = { // scale based on the smallest & largest agreement counts
                min: Enumerable.From(places).Min(function (x) { return x.agreementCount }),
                max: Enumerable.From(places).Max(function (x) { return x.agreementCount }),
            };
            var into: Range = { min: 24, max: 48 }; // smallest & largest placemarker circles
            return new Scaler(from, into);
        }

        private _setMarkerIcon(options: google.maps.MarkerOptions, text: string, scaler: Scaler): void {
            var side = isNaN(parseInt(text)) ? 24 : scaler.scale(parseInt(text));
            if (text == '0') {
                side = 16;
            }
            var halfSide = side / 2;
            var settings = {
                opacity: 0.75,
                side: side,
                text: text,
            };
            var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(settings));
            var icon = {
                url: url,
                size: new google.maps.Size(side, side),
                anchor: new google.maps.Point(halfSide, halfSide),
            };
            var shape: google.maps.MarkerShape = {
                type: 'circle',
                coords: [halfSide, halfSide, halfSide],
            };
            options.icon = icon;
            options.shape = shape;
        }

        //#region Old Continent Scope

        //private _onContinentsResponse(response: any[]): void {

        //    this._clearMarkers();
        //    var countRange: Range = {
        //        min: Enumerable.From(response).Min(function (x) { return x.agreementCount }),
        //        max: Enumerable.From(response).Max(function (x) { return x.agreementCount }),
        //    };
        //    var scaler = new Scaler(countRange, { min: 24, max: 48 });
        //    for (var i = 0; i < response.length; i++) {
        //        var continent = response[i];
        //        this._onContinentResponse(continent, scaler);
        //    }

        //    this._googleMap.setZoom(1);
        //    this._googleMap.setCenter(SearchMap._defaultMapCenter);
        //}

        //private _onContinentResponse(continent: any, scaler: Scaler): void {
        //    var side = scaler.scale(continent.agreementCount);
        //    var halfSide = side / 2;
        //    var iconSettings = {
        //        opacity: 0.8,
        //        side: side,
        //        text: continent.agreementCount,
        //    };
        //    var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
        //    var icon = {
        //        url: url,
        //        size: new google.maps.Size(side, side),
        //        anchor: new google.maps.Point(halfSide, halfSide),
        //    };
        //    var iconShape: google.maps.MarkerShape = {
        //        type: 'circle',
        //        coords: [halfSide, halfSide, halfSide],
        //    };
        //    var isClickable = continent.agreementCount > 0 && continent.id > 0;
        //    isClickable = true;
        //    var cursor = isClickable ? 'pointer' : 'default';
        //    var options: google.maps.MarkerOptions = {
        //        map: this._googleMap,
        //        position: new google.maps.LatLng(continent.center.latitude, continent.center.longitude),
        //        title: '{0} - {1} agreement(s)\r\nClick for more information'
        //            .format(continent.name, continent.agreementCount),
        //        clickable: true,
        //        cursor: cursor,
        //        icon: icon,
        //        shape: iconShape,
        //        //optimized: false, // causes icons to sometimes not render
        //    };
        //    var marker = new google.maps.Marker(options);
        //    this._markers.push(marker);
        //    if (isClickable)
        //        google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
        //            this._onContinentClick(marker, continent, e);
        //        });
        //}

        //private _onContinentClick(marker: google.maps.Marker, continent: any, e: google.maps.MouseEvent): void {
        //    var north = continent.boundingBox.northEast.latitude;
        //    var south = continent.boundingBox.southWest.latitude;
        //    var east = continent.boundingBox.northEast.longitude;
        //    var west = continent.boundingBox.southWest.longitude;
        //    var southWest = new google.maps.LatLng(south, west);
        //    var northEast = new google.maps.LatLng(north, east);
        //    var bounds = new google.maps.LatLngBounds(southWest, northEast);
        //    this._googleMap.fitBounds(bounds);
        //    this.continentCode(continent.continentCode);
        //}

        //#endregion
        //#region Old Country Scope
        //private _onCountriesResponse(response: any[]): void {
        //    //#region collapse
        //    this._clearMarkers();
        //    var continentCode = this.continentCode();
        //    var countries = Enumerable.From(response)
        //        .Where(function (x: any): boolean {
        //            return x.continentCode == continentCode;
        //        })
        //        .ToArray();
        //    var bounds = new google.maps.LatLngBounds();
        //    if (countries.length == 1) {
        //        var country = countries[0];
        //        var northEast = new google.maps.LatLng(country.boundingBox.northEast.latitude,
        //            country.boundingBox.northEast.longitude);
        //        var southWest = new google.maps.LatLng(country.boundingBox.southWest.latitude,
        //            country.boundingBox.southWest.longitude);
        //        bounds = new google.maps.LatLngBounds(southWest, northEast);
        //        this._googleMap.fitBounds(bounds);
        //    }
        //    else if (countries.length > 1) {
        //        var latLngs = Enumerable.From(countries)
        //            .Select(function (x: any): any {
        //                return new google.maps.LatLng(x.center.latitude, x.center.longitude);
        //            }).ToArray();
        //        $.each(latLngs, function (index: number, latLng: google.maps.LatLng): void {
        //            bounds.extend(latLng);
        //        });
        //        this._googleMap.fitBounds(bounds);
        //    }
        //    else {
        //        this._googleMap.setCenter(SearchMap._defaultMapCenter);
        //        this._googleMap.setZoom(1);
        //        if (continentCode != 'any') {
        //            var continent = Enumerable.From(this.continentOptions())
        //                .Single(function (x: any): boolean {
        //                    return x.code == continentCode;
        //                });
        //            alert('No agreements found in {0}. Click your back button or select a different continent or country.'.format(continent.name));
        //            //setTimeout(function (): void { history.back(); }, 100);
        //        }
        //        else {
        //            alert('No agreements found. Click your back button or select a different continent or country.');
        //        }
        //        //return;
        //    }

        //    //#endregion
        //    google.maps.event.addListenerOnce(this._googleMap, 'idle', (): void => {
        //        var continentCode = this.continentCode();
        //        var countRange: Range = {
        //            min: Enumerable.From(response).Min(function (x) { return x.agreementCount }),
        //            max: Enumerable.From(response).Max(function (x) { return x.agreementCount }),
        //        };
        //        var scaler = new Scaler(countRange, { min: 24, max: 48 });
        //        for (var i = 0; i < countries.length; i++) {
        //            var country = countries[i];
        //            this._onCountryResponse(country, scaler, new google.maps.LatLngBounds());
        //        }
        //        this.lat(this.latitude());
        //        this.lng(this.longitude());
        //        this.zoom(this.mag());
        //        this._setLocation();
        //    });
        //}

        //private _onCountryResponse(country: any, scaler: Scaler, bounds: google.maps.LatLngBounds): void {
        //    var latLng = new google.maps.LatLng(country.center.latitude, country.center.longitude);
        //    var side = scaler.scale(country.agreementCount);
        //    var halfSide = side / 2;
        //    var iconSettings = {
        //        opacity: 1,
        //        side: side,
        //        text: country.agreementCount,
        //    };
        //    var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
        //    var icon = {
        //        url: url,
        //        size: new google.maps.Size(side, side),
        //        origin: new google.maps.Point(0, 0),
        //        anchor: new google.maps.Point(halfSide, halfSide),
        //    };
        //    var iconShape: google.maps.MarkerShape = {
        //        type: 'circle',
        //        coords: [halfSide, halfSide, halfSide],
        //    };
        //    var options: google.maps.MarkerOptions = {
        //        map: this._googleMap,
        //        position: latLng,
        //        title: '{0} - {1} agreement(s)\r\nClick for more information.'
        //            .format(country.name, country.agreementCount),
        //        clickable: true,
        //        cursor: 'pointer',
        //        icon: icon,
        //        shape: iconShape,
        //        //optimized: false, // this causes icons to not be rendered after some pans.
        //    };
        //    var marker = new google.maps.Marker(options);
        //    this._markers.push(marker);
        //    //if (isClickable)
        //    //    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
        //    //        this._onContinentClick(marker, continent, e);
        //    //    });
        //}

        //#endregion
        //#endregion
    }

    export interface Range {
        min: number;
        max: number;
    }

    export class Scaler {
        constructor(public from: Range, public into: Range) {
        }
        scale(point: number) {
            var scaled = this.into.min; // start with min value then add emphasis
            var fromRange = this.from.max - this.from.min;
            var intoRange = this.into.max - this.into.min;
            if (fromRange) { // do not divide by zero
                // compute the percentage above min for the point
                var factor = (point - this.from.min) / fromRange;
                // multiply the percentage by the range going into
                var emphasis = Math.round(factor * intoRange);
                scaled += emphasis; // scale up from min to min + emphasis
            }
            if (scaled < this.into.min) scaled = this.into.min;
            if (scaled > this.into.max) scaled = this.into.max;
            return scaled;
        }
    }
}