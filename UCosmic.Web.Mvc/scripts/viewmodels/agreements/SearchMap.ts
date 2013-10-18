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

        zoom: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        lat: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || 0);
        lng: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || 17);

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
            $.when(this._mapCreated).then((): void => {
                this._bindMap();
            });
            this._loadCountryOptions();
            this.sammy = this.settings.sammy || Sammy();
            this._runSammy();
        }

        ////#endregion
        //#region Country Filter Options

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
        //#region Google Map
        //#region Creation & Initialization

        private _googleMap: google.maps.Map;
        private _mapCreated: JQueryDeferred<void>;
        private _createMap(): JQueryDeferred<void> {
            var element = document.getElementById('google_map_canvas');
            var options: google.maps.MapOptions = {
            };
            this._googleMap = new google.maps.Map(element, {
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
            });
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

        private _bindMap(): void {
            var continentCode = this.continentCode();
            if (continentCode === 'any') {
                $.ajax({
                    url: this.settings.partnerPlacesApi.format('continents')
                })
                    .done((response: any[]): void => {
                        this._onContinentsResponse(response);
                    });
            }
            //else if (scope === 'countries') {
            //    $.ajax({
            //        url: this.settings.partnerPlacesApi.format(scope)
            //    })
            //        .done((response: any[]): void => {
            //            this._onCountriesResponse(response);
            //        });
            //}
        }

        //#endregion
        //#region Statistics

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
        //#region Continent Scope

        private _onContinentsResponse(response: any[]): void {
            var countRange: Range = {
                min: Enumerable.From(response).Min(function (x) { return x.agreementCount }),
                max: Enumerable.From(response).Max(function (x) { return x.agreementCount }),
            };
            var scaler = new Scaler(countRange, { min: 24, max: 48 });
            this._clearContinentMarkers();
            for (var i = 0; i < response.length; i++) {
                var continent = response[i];
                this._onContinentResponse(continent, scaler);
            }
        }

        private _onContinentResponse(continent: any, scaler: Scaler): void {
            var side = scaler.scale(continent.agreementCount);
            var halfSide = side / 2;
            var iconSettings = {
                opacity: 0.8,
                side: side,
                text: continent.agreementCount,
            };
            var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
            var icon = {
                url: url,
                size: new google.maps.Size(side, side),
                anchor: new google.maps.Point(halfSide, halfSide),
            };
            var iconShape: google.maps.MarkerShape = {
                type: 'circle',
                coords: [halfSide, halfSide, halfSide],
            };
            var isClickable = continent.agreementCount > 0 && continent.id > 0;
            isClickable = true;
            var cursor = isClickable ? 'pointer' : 'default';
            var options: google.maps.MarkerOptions = {
                map: this._googleMap,
                position: new google.maps.LatLng(continent.center.latitude, continent.center.longitude),
                title: '{0} - {1} agreement(s)'.format(continent.name, continent.agreementCount),
                clickable: true,
                cursor: cursor,
                icon: icon,
                shape: iconShape,
                optimized: false,
            };
            var marker = new google.maps.Marker(options);
            this._continentMarkers.push(marker);
            if (isClickable)
                google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                    this._onContinentClick(marker, continent, e);
                });
        }

        private _onContinentClick(marker: google.maps.Marker, continent: any, e: google.maps.MouseEvent): void {
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
            this._scopedContinentId(continent.id);
            if (continent.id != 0)
                this._bindMap();
        }

        private _scopedContinentId: KnockoutObservable<number> = ko.observable(); // TODO: ensure this
        private _continentMarkers: KnockoutObservableArray<google.maps.Marker> = ko.observableArray();

        private _clearContinentMarkers(): void {
            var markers = this._continentMarkers() || [];
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                marker.setMap(null);
            }
            this._continentMarkers([]);
        }

        //#endregion

        private _onCountriesResponse(response: any[]): void {
            this._clearContinentMarkers();
            var continentId = this._scopedContinentId();
            var countries = Enumerable.From(response)
                .Where(function (x: any): boolean {
                    return x.continentId == continentId;
                })
                .ToArray();
            var bounds = new google.maps.LatLngBounds();
            var countRange: Range = {
                min: Enumerable.From(response).Min(function (x) { return x.agreementCount }),
                max: Enumerable.From(response).Max(function (x) { return x.agreementCount }),
            };
            var scaler = new Scaler(countRange, { min: 24, max: 48 });
            for (var i = 0; i < countries.length; i++) {
                var country = countries[i];
                this._onCountryResponse(country, scaler, bounds);
            }
            if (countries.length == 1) {
                var country = countries[0];
                var northEast = new google.maps.LatLng(country.boundingBox.northEast.latitude,
                    country.boundingBox.northEast.longitude);
                var southWest = new google.maps.LatLng(country.boundingBox.southWest.latitude,
                    country.boundingBox.southWest.longitude);
                bounds = new google.maps.LatLngBounds(southWest, northEast);
            }
            this._googleMap.fitBounds(bounds);
        }

        private _onCountryResponse(country: any, scaler: Scaler, bounds: google.maps.LatLngBounds): void {
            var latLng = new google.maps.LatLng(country.center.latitude, country.center.longitude);
            bounds.extend(latLng);
            var side = scaler.scale(country.agreementCount);
            var halfSide = side / 2;
            var iconSettings = {
                opacity: 0.7,
                side: side,
                text: country.agreementCount,
            };
            var url = '{0}?{1}'.format(this.settings.graphicsCircleApi, $.param(iconSettings));
            var icon = {
                url: url,
                size: new google.maps.Size(side, side),
                anchor: new google.maps.Point(halfSide, halfSide),
            };
            var iconShape: google.maps.MarkerShape = {
                type: 'circle',
                coords: [halfSide, halfSide, halfSide],
            };
            var options: google.maps.MarkerOptions = {
                map: this._googleMap,
                position: latLng,
                title: '{0} - {1} agreement(s)'.format(country.name, country.agreementCount),
                //clickable: true,
                //cursor: cursor,
                icon: icon,
                shape: iconShape,
                optimized: false,
            };
            var marker = new google.maps.Marker(options);
            //if (isClickable)
            //    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
            //        this._onContinentClick(marker, continent, e);
            //    });
        }

        //private _getMarkerSide(countRange: Range, point: number): number {
        //    var side = 24;
        //    var range = countRange.max - countRange.min;
        //    if (range) {
        //        var factor = (point - countRange.min) / range;
        //        var emphasis = Math.round(factor * 24);
        //        side += emphasis;
        //    }
        //    if (side > 48) side = 48;
        //    if (side < 16) side = 16
        //    return side;
        //}

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