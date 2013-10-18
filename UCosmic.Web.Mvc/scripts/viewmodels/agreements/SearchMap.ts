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
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');

        zoom: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        lat: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || 0);
        lng: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || 17);
        scope: KnockoutObservable<string> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ScopeSessionKey)) || 'continents');

        //#endregion
        //#region Search Filter Input sessionStorage

        static KeywordSessionKey = 'AgreementSearchKeyword2';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static ZoomSessionKey = 'AgreementSearchZoom';
        static LatSessionKey = 'AgreementSearchLat';
        static LngSessionKey = 'AgreementSearchLng';
        static ScopeSessionKey = 'AgreementSearchScope';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');

            sessionStorage.setItem(SearchMap.KeywordSessionKey, this.keyword() || '');
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchMap.ZoomSessionKey, this.zoom().toString());
            sessionStorage.setItem(SearchMap.LatSessionKey, this.lat().toString());
            sessionStorage.setItem(SearchMap.LngSessionKey, this.lng().toString());
            sessionStorage.setItem(SearchMap.ScopeSessionKey, this.scope());
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
        countryOptions: KnockoutObservableArray<Places.ApiModels.Country> = ko.observableArray(
            [{ code: 'any', name: '[Loading...]' }]);

        private _countryChanged: KnockoutComputed<void> = ko.computed((): void => {
            this._onCountryChanged();
        });

        private _onCountryChanged(): void {
            // changes when applyBindings happens and after options data is loaded
            var countryCode = this.countryCode();
            var options = this.countryOptions();
            // keep countryCode as an option so that we don't lose it when options change
            if (options.length == 1 && options[0].code != countryCode)
                options[0].code = countryCode;
        }

        private _loadCountryOptions(): JQueryDeferred<void> {
            // this will run once during construction
            // this will run before sammy and applyBindings...
            var deferred = $.Deferred();
            $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.ApiModels.Country[]): void => {
                    // ...but this will run after sammy and applyBindings
                    var options = response.slice(0);
                    // customize options
                    var any: Places.ApiModels.Country = {
                        code: 'any',
                        name: '[All countries]'
                    };
                    var none: Places.ApiModels.Country = {
                        code: 'none',
                        name: '[Without country]'
                    };
                    options = Enumerable.From([any]).Concat(options).Concat([none]).ToArray();

                    this.countryOptions(options); // push into observable array
                    deferred.resolve();
                });
            return deferred;
        }

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/country/{4}/zoom/{1}/latitude/{2}/longitude/{3}/'
            .format(this.settings.route).replace('{4}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            // sammy will run the first route that it matches
            var beforeRegex = new RegExp('\\{0}'.format(
                this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
            this.sammy.before(
                beforeRegex,
                function (): boolean {
                    var e: Sammy.EventContext = this;
                    return viewModel._onBeforeRoute(e);
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':country', ':zoom', ':lat', ':lng'),
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
            var country = e.params['country'];
            var zoom = e.params['zoom'];
            var lat = e.params['lat'];
            var lng = e.params['lng'];

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
            var countryCode = this.countryCode();
            var zoom = this.zoom();
            var lat = this.lat();
            var lng = this.lng();
            var route = this.routeFormat.format(countryCode,
                zoom, lat, lng);
            return route;
        }

        private _setLocation(): void {
            // only set the href hashtag to trigger sammy when the current route is stale
            var route = this._route();
            if (this.sammy.getLocation().indexOf(route) < 0) {
                this.sammy.setLocation(route);
            }
        }

        //#endregion
        //#region Google Map

        private _googleMap: google.maps.Map;
        private _mapCreated: JQueryDeferred<void>;
        private _createMap(): JQueryDeferred<void> {
            var element = document.getElementById('google_map_canvas');
            this._googleMap = new google.maps.Map(element, {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: new google.maps.LatLng(this.lat(), this.lng()),
                zoom: 1, // zoom out
                draggable: true, // allow map panning
                scrollwheel: false // prevent mouse wheel zooming
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
                deferred.resolve();
            });
            return deferred;
        }

        private _onMapZoomChanged(): void {

        }

        private _onMapCenterChanged(): void {

        }

        private _onMapBoundsChanged(): void {
            var bounds = this._googleMap.getBounds();
            var north = bounds.getNorthEast().lat();
            var south = bounds.getSouthWest().lat();
            var east = bounds.getNorthEast().lng();
            var west = bounds.getSouthWest().lng();
        }

        private _bindMap(): void {
            var scope = this.scope();
            if (scope === 'continents') {
                $.ajax({
                    url: this.settings.partnerPlacesApi.format(scope)
                })
                    .done((response: any[]): void => {
                        //alert(this.settings.graphicsCircleApi);
                        this._onContinentsResponse(response);
                    });
            }
        }

        private _onContinentsResponse(response: any[]): void {
            var range = {
                min: Enumerable.From(response).Min(function (x) { return x.agreementCount }),
                max: Enumerable.From(response).Max(function (x) { return x.agreementCount }),
            };
            for (var i = 0; i < response.length; i++) {
                var continent = response[i];
                this._onContinentResponse(continent, range);
            }
        }

        private _onContinentResponse(continent: any, range: any): void {
            var side = this._getMarkerSide(range.min, range.max, continent.agreementCount);
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
                zIndex: 100,
            };
            var marker = new google.maps.Marker(options);
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
        }

        private _getMarkerSide(min: number, max: number, point: number): number {
            var side = 24;
            var range = max - min;
            if (range) {
                var factor = (point - min) / range;
                var emphasis = Math.round(factor * 24);
                side += emphasis;
            }
            if (side > 48) side = 48;
            if (side < 16) side = 16
            return side;
        }

        //#endregion
    }
}