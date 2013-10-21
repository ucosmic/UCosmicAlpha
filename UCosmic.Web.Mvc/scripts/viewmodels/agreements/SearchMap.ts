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
        partnersApi: string;
        graphicsCircleApi: string;
        summaryApi: string;
    }

    export interface SearchMapScope {
        continentCode: string;
        countryCode: string;
        placeId: number;
    }

    export class SearchMap {
        //#region Search Filter Inputs

        // instead of throttling, both this and the options are observed
        continentCode: KnockoutObservable<string> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ContinentSessionKey)) || 'any');
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
        placeId: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.PlaceIdSessionKey) || 0));

        static _defaultMapCenter = new google.maps.LatLng(0, 17)

        zoom: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        lat: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap._defaultMapCenter.lat());
        lng: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap._defaultMapCenter.lng());
        detailPreference: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.DetailPrefSessionKey));
        detailPreferenceChecked: KnockoutComputed<boolean> = ko.computed({
            read: (): boolean => { return this.detailPreference() == '_blank' },
            write: (value: boolean): void => { this.detailPreference(value ? '_blank' : ''); },
        });

        //#endregion
        //#region Search Filter Input sessionStorage

        static ContinentSessionKey = 'AgreementSearchContinent';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static PlaceIdSessionKey = 'AgreementMapSearchPlaceId';
        static ZoomSessionKey = 'AgreementSearchZoom';
        static LatSessionKey = 'AgreementSearchLat';
        static LngSessionKey = 'AgreementSearchLng';
        static DetailPrefSessionKey = 'AgreementSearchMapDetailPreference';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.continentCode() == undefined) this.continentCode('any');

            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchMap.PlaceIdSessionKey, this.placeId().toString());
            sessionStorage.setItem(SearchMap.ZoomSessionKey, this.zoom().toString());
            sessionStorage.setItem(SearchMap.LatSessionKey, this.lat().toString());
            sessionStorage.setItem(SearchMap.LngSessionKey, this.lng().toString());
            sessionStorage.setItem(SearchMap.DetailPrefSessionKey, this.detailPreference() || '');
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchMapSettings) {
            this._loadSummary();
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
        //#region Summary

        status: KoModels.Summary = {
            agreementCount: ko.observable('?'),
            partnerCount: ko.observable('?'),
            countryCount: ko.observable('?'),
        };
        summary: KoModels.Summary = {
            agreementCount: ko.observable('?'),
            partnerCount: ko.observable('?'),
            countryCount: ko.observable('?'),
        };
        private _loadSummary(): void {
            $.get(this.settings.summaryApi)
                .done((response: ApiModels.Summary): void => {
                    ko.mapping.fromJS(response, {}, this.summary);
                });
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

        continentSelected(): void {
            this.placeId(0);
        }

        countrySelected(): void {
            this.placeId(0);
        }

        //private _countryChanged = ko.computed((): void => { this._onCountryChanged(); });
        //private _onCountryChanged(): void {
        //    var countryCode = this.countryCode();
        //    var continentCode = this.continentCode();
        //    var countryOptions = this.countryOptions();
        //    if (countryCode != 'any' && countryCode != 'none') {
        //        var country: Places.ApiModels.Country = Enumerable.From(countryOptions)
        //            .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
        //                return x.code == countryCode;
        //            });
        //        if (country && country.continentCode != continentCode) {
        //            this.continentCode(country.continentCode);
        //        }
        //    }
        //} bugs with route when country changes continent

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/continent/{6}/country/{1}/place/{2}/zoom/{3}/latitude/{4}/longitude/{5}/'
            .format(this.settings.route).replace('{6}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            // sammy will run the first route that it matches
            var beforeRegex = new RegExp('\\{0}'.format(
                this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)')
                    .replace(/\//g, '\\/')));
            this.sammy.before(
                beforeRegex,
                function (): boolean {
                    var e: Sammy.EventContext = this;
                    return viewModel._onBeforeRoute(e);
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':continent', ':country', ':place', ':zoom', ':lat', ':lng'),
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
            var placeId = this.placeId();
            var zoom = this.zoom();
            var lat = this.lat();
            var lng = this.lng();
            var route = this.routeFormat.format(continentCode, countryCode, placeId, zoom, lat, lng);
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
                placeId: this.placeId(),
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
                lastScope.continentCode != thisScope.continentCode ||
                lastScope.placeId != thisScope.placeId) {
                this._scopeHistory.push(thisScope);
                $.when(this._mapCreated).then((): void => {
                    this._load();
                });
            }
        }

        //#endregion
        //#region Navigational Binding

        private _continentsResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _countriesResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _placesResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _partnersResponse: KnockoutObservableArray<ApiModels.Participant>;
        private _markers: KnockoutObservableArray<google.maps.Marker> = ko.observableArray();
        spinner = new App.Spinner(new App.SpinnerOptions(400, false));

        private _load(): void {
            if (!this.placeId()) {
                var placeType = '';
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                if (continentCode == 'any' && countryCode == 'any') {
                    placeType = 'continents';
                }
                else if (countryCode == 'any') { // continentCode != 'any', but can be none or Antarctic
                    placeType = 'countries';
                }
                this.spinner.start();
                var placesReceived = this._requestPlaces(placeType);
                $.when(placesReceived).done((): void => {
                    this._receivePlaces(placeType);
                    this.spinner.stop();
                    setTimeout((): void => { // pre-load the other data sets
                        this._requestPlaces('continents');
                        this._requestPlaces('countries');
                        this._requestPlaces('');
                    }, 0);
                });
            }
            else {
                this.spinner.start();
                var partnersReceived = this._requestPartners();
                $.when(partnersReceived).done((): void => {
                    this._receivePartners();
                    this.spinner.stop();
                });
            }
        }

        private _requestPlaces(placeType: string): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            // load continents before countries
            if (placeType == 'countries' && !this._continentsResponse) {
                var continentsReceived = this._requestPlaces('continents');
                $.when(continentsReceived).then((): void => {
                    this._requestPlaces('countries').done((): void => {
                        deferred.resolve();
                    });
                });
            }

            else if ((placeType == 'continents' && !this._continentsResponse) ||
                (placeType == 'countries' && !this._countriesResponse) ||
                (!placeType && !this._placesResponse)) {

                $.get(this.settings.partnerPlacesApi.format(placeType))
                    .done((response: ApiModels.PlaceWithAgreements[]): void => {
                        if (placeType == 'continents') {
                            this._continentsResponse = ko.observableArray(response);
                        }
                        else if (placeType == 'countries') {
                            this._countriesResponse = ko.observableArray(response);
                        }
                        else {
                            this._placesResponse = ko.observableArray(response);
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

        private _receivePlaces(placeType: string): void {
            var places = placeType == 'continents'
                ? this._continentsResponse()
                : placeType == 'countries'
                ? this._countriesResponse()
                : this._placesResponse();

            if (placeType == 'countries') {
                var continentCode = this.continentCode();
                places = Enumerable.From(places)
                    .Where(function (x: ApiModels.PlaceWithAgreements): boolean {
                        return continentCode == 'none'
                            ? !x.id
                            : x.continentCode == continentCode;
                    })
                    .ToArray();
            }

            if (!placeType) {
                var countryCode = this.countryCode();
                places = Enumerable.From(places)
                    .Where(function (x: ApiModels.PlaceWithAgreements): boolean {
                        return countryCode == 'none'
                            ? !x.countryId
                            : x.countryCode == countryCode;
                    })
                    .ToArray();
            }

            this._updateStatus(placeType, places);
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
            if (placeType == 'continents') {
                if (this._googleMap.getZoom() != 1) {
                    this._googleMap.setZoom(1);
                    this._googleMap.setCenter(SearchMap._defaultMapCenter);
                }
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
            else {
                var countryCode = this.countryCode();
                var bounds: google.maps.LatLngBounds;
                //#region zero places, try country bounds
                if (!places.length) {
                    if (countryCode && this.countryOptions) {
                        var countryOption: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
                            .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
                                return x.code == countryCode;
                            });
                        if (countryOption && countryOption.box && countryOption.box.hasValue) {
                            bounds = Places.Utils.convertToLatLngBounds(countryOption.box);
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
            var scaler = placeType == 'countries'
                ? this._getMarkerIconScaler(placeType, this._countriesResponse()) // scale based on all countries
                : this._getMarkerIconScaler(placeType, places);
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
            var countryCode = this.countryCode();
            if (!placeType && !places.length && countryCode != 'none') {
                var country: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
                    .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
                        return x.code == countryCode;
                    });
                if (country) {
                    places = [{
                        id: country.id,
                        agreementCount: 0,
                        name: country.name,
                        center: country.center,
                        boundingBox: country.box,
                        isCountry: true,
                        countryCode: country.code,
                        continentCode: country.continentCode,
                    }];
                }
            }
            $.each(places, (i: number, place: ApiModels.PlaceWithAgreements): void => {
                if (placeType == 'continents' && !place.agreementCount) return; // do not render zero on continent
                var title = '{0} - {1} agreement{2}'
                    .format(place.name, place.agreementCount, place.agreementCount == 1 ? '' : 's');
                if (!placeType)
                    title = '{0} agreement{1}\r\nClick for more information'
                        .format(place.agreementCount, place.agreementCount == 1 ? '' : 's');
                var options: google.maps.MarkerOptions = {
                    map: this._googleMap,
                    position: Places.Utils.convertToLatLng(place.center),
                    title: title,
                    clickable: true,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, place.agreementCount.toString(), scaler);
                var marker = new google.maps.Marker(options);
                this._markers.push(marker);
                google.maps.event.addListener(marker, 'mouseover', (e: google.maps.MouseEvent): void => {
                    marker.setOptions({
                        zIndex: 201,
                    });
                });
                google.maps.event.addListener(marker, 'mouseout', (e: google.maps.MouseEvent): void => {
                    var side = marker.getIcon().size.width;
                    setTimeout((): void => {
                        marker.setOptions({
                            zIndex: 200 - side,
                        });
                    }, 400);
                });
                if (placeType === 'continents') {
                    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                        if (place.agreementCount == 1) {
                            var url = this.settings.detailUrl.format(place.agreementIds[0]);
                            var detailPreference = this.detailPreference();
                            if (detailPreference == '_blank') {
                                window.open(url, detailPreference);
                            }
                            else {
                                location.href = url;
                            }
                        }
                        else {
                            this._googleMap.fitBounds(Places.Utils.convertToLatLngBounds(place.boundingBox));
                            if (place.id < 1) {
                                this.continentCode('none'); // select none in continents dropdown menu
                            } else {
                                this.continentCode(place.continentCode);
                                this.countryCode('any');
                                this.placeId(0);
                            }
                        }
                    });
                }
                else if (placeType === 'countries') {
                    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                        if (place.agreementCount == 1) {
                            var url = this.settings.detailUrl.format(place.agreementIds[0]);
                            var detailPreference = this.detailPreference();
                            if (detailPreference == '_blank') {
                                window.open(url, detailPreference);
                            }
                            else {
                                location.href = url;
                            }
                        }
                        else if (place.id > 0) {
                            this.continentCode('any');
                            this.countryCode(place.countryCode);
                            this.placeId(0);
                        }
                    });
                }
                else if (!placeType) {
                    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                        if (place.agreementCount == 1) {
                            var url = this.settings.detailUrl.format(place.agreementIds[0]);
                            var detailPreference = this.detailPreference();
                            if (detailPreference == '_blank') {
                                window.open(url, detailPreference);
                            }
                            else {
                                location.href = url;
                            }
                        }
                        else if (place.id) {
                            this.placeId(place.id);
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

        private _updateStatus(placeType: string, places: ApiModels.PlaceWithAgreements[]) {
            if (places && places.length) {
                this.status.agreementCount(Enumerable.From(places)
                    .Sum(function (x: ApiModels.PlaceWithAgreements): number {
                        return x.agreementCount;
                    }).toString());
                this.status.partnerCount(Enumerable.From(places)
                    .Sum(function (x: ApiModels.PlaceWithAgreements): number {
                        return x.partnerCount;
                    }).toString());
            }
            if (placeType == 'countries') {
                var continentCode = this.continentCode();
                if (continentCode == 'none') {
                    this.status.countryCount('unknown continent');
                }
                else {
                    var continent = Enumerable.From(this.continentOptions())
                        .SingleOrDefault(undefined, function (x: any): boolean {
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
                    var country: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
                        .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
                            return x.code == countryCode;
                        });
                    if (country && country.name) {
                        this.status.countryCount(country.name);
                    }
                }
            }
        }

        private _getMarkerIconScaler(placeType: string, places: ApiModels.PlaceWithAgreements[]): Scaler {
            if (!places || !places.length)
                return new Scaler({ min: 0, max: 1, }, { min: 16, max: 16, });
            var from: Range = { // scale based on the smallest & largest agreement counts
                min: Enumerable.From(places).Min(function (x) { return x.agreementCount }),
                max: Enumerable.From(places).Max(function (x) { return x.agreementCount }),
            };
            var into: Range = { min: 24, max: 48 }; // smallest & largest placemarker circles
            if (!placeType) into = { min: 24, max: 32 };

            return new Scaler(from, into);
        }

        private _setMarkerIcon(options: google.maps.MarkerOptions, text: string, scaler: Scaler): void {
            var side = isNaN(parseInt(text)) ? 24 : scaler.scale(parseInt(text));
            if (text == '0') {
                side = 16;
            }
            var halfSide = side / 2;
            var settings = {
                opacity: 0.7,
                side: side,
                text: text,
                fillColor: 'rgb(11, 11, 11)',
                //stroke: false,
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
            options.zIndex = 200 - side;
        }

        private _requestPartners(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<ApiModels.PlaceWithAgreements> = $.Deferred();

            // need to make sure we have places before we can get partners
            if (!this._placesResponse) {
                var placesReceived = this._requestPlaces('');
                $.when(placesReceived).then((): void => {
                    this._requestPartners().done((): void => {
                        deferred.resolve();
                    });
                });
            }
            else {
                // need to request the agreementIds for the current place
                var placeId = this.placeId();
                var place: ApiModels.PlaceWithAgreements = Enumerable.From(this._placesResponse())
                    .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithAgreements): boolean {
                        return x.id == placeId;
                    });
                if (!place || !place.agreementCount) {
                    alert('There are no agreements for place #{0}.'.format(placeId));
                    deferred.reject();
                }
                else {
                    // load the partners
                    $.get(this.settings.partnersApi, { agreementIds: place.agreementIds, })
                        .done((response: ApiModels.Participant[]): void => {
                            this._partnersResponse = ko.observableArray(response);
                            deferred.resolve();
                        })
                        .fail((xhr: JQueryXHR): void => {
                            App.Failures.message(xhr, 'while trying to load agreement partner data', true)
                            deferred.reject();
                        });
                }
            }

            return deferred;
        }

        private _receivePartners(): void {

            var allPartners = this._partnersResponse();

            // how many different partners are there?
            var uniquePartners: ApiModels.Participant[] = Enumerable.From(allPartners)
                .Distinct(function (x: ApiModels.Participant): number {
                    return x.establishmentId;
                })
                .ToArray();

            // set map viewport
            if (uniquePartners.length == 1) {
                // try zoom first
                var partner = uniquePartners[0];
                if (partner.googleMapZoomLevel) {
                    this._googleMap.setZoom(partner.googleMapZoomLevel);
                }
                else if (partner.boundingBox && partner.boundingBox.hasValue) {
                    this._googleMap.fitBounds(Places.Utils.convertToLatLngBounds(partner.boundingBox));
                }
                this._googleMap.setCenter(Places.Utils.convertToLatLng(partner.center));
            }
            else if (uniquePartners.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                $.each(uniquePartners, (i: number, partner: ApiModels.Participant): void => {
                    bounds.extend(Places.Utils.convertToLatLng(partner.center));
                });
                this._googleMap.fitBounds(bounds);
            }
            else {
                alert('Found no agreement partners for place #{0}.'.format(this.placeId()));
            }

            // plot the markers
            this._clearMarkers();
            var scaler = this._getMarkerIconScaler('', this._placesResponse());
            $.each(uniquePartners, (i: number, partner: ApiModels.Participant): void => {
                // how many agreements for this partner?
                var agreements: ApiModels.Participant[] = Enumerable.From(allPartners)
                    .Where(function (x: ApiModels.Participant): boolean {
                        return x.establishmentId == partner.establishmentId;
                    })
                    .Distinct(function (x: ApiModels.Participant): number {
                        return x.agreementId;
                    }).ToArray();

                var options: google.maps.MarkerOptions = {
                    map: this._googleMap,
                    position: Places.Utils.convertToLatLng(partner.center),
                    title: '{0} - {1} agreement{2}'
                        .format(partner.establishmentTranslatedName, agreements.length, agreements.length == 1 ? '' : 's'),
                    clickable: true,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, agreements.length.toString(), scaler);
                var marker = new google.maps.Marker(options);
                this._markers.push(marker);
                google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                    if (agreements.length == 1) {
                        var url = this.settings.detailUrl.format(partner.agreementId);
                        var detailPreference = this.detailPreference();
                        if (detailPreference == '_blank') {
                            window.open(url, detailPreference);
                        }
                        else {
                            location.href = url;
                        }
                    }
                    else {
                        this.infoWindowContent.partner(partner);
                        this.infoWindowContent.agreements(Enumerable.From(agreements)
                            .OrderByDescending(function (x: ApiModels.Participant): string {
                                return x.agreementStartsOn;
                            })
                            .ToArray());
                        var content = this.$infoWindow.html();
                        var options: google.maps.InfoWindowOptions = {
                            content: $.trim(content),
                            //maxWidth: 600,
                        };
                        var infoWindow = new google.maps.InfoWindow(options);
                        this._clearInfoWindows();
                        this._infoWindows.push(infoWindow);
                        infoWindow.open(this._googleMap, marker);
                    }
                });
            });

            var markers = this._markers();
            if (markers.length == 1) {
                google.maps.event.trigger(markers[0], 'click');
            }


            // update the status
            this.status.agreementCount(Enumerable.From(allPartners)
                .Distinct(function (x: ApiModels.Participant): number {
                    return x.agreementId;
                }).Count().toString());
            this.status.partnerCount(uniquePartners.length.toString());
            this.status.countryCount('this area');

            this._updateRoute();
        }

        private _clearInfoWindows(): void {
            var infoWindows = this._infoWindows();
            $.each(infoWindows, (i: number, infoWindow: google.maps.InfoWindow): void => {
                infoWindow.close();
                infoWindow = null;
            });
            this._infoWindows([]);
        }

        private _infoWindows: KnockoutObservableArray<google.maps.InfoWindow> = ko.observableArray();
        $infoWindow: JQuery;
        infoWindowContent: any = {
            partner: ko.observable({}),
            agreements: ko.observableArray([]),
        };

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