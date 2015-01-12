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
        typeCode: string;
        placeId: number;
    }

    export class SearchMap {
        //#region Search Filter Inputs



        static defaultMapCenter = new google.maps.LatLng(0, 17)

        zoom: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        lat: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap.defaultMapCenter.lat());
        lng: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap.defaultMapCenter.lng());
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
        static TypeSessionKey = 'AgreementTypeSearchCountry2';
        static PlaceIdSessionKey = 'AgreementMapSearchPlaceId';
        static ZoomSessionKey = 'AgreementSearchZoom';
        static LatSessionKey = 'AgreementSearchLat';
        static LngSessionKey = 'AgreementSearchLng';
        static DetailPrefSessionKey = 'AgreementSearchMapDetailPreference';

        // instead of throttling, both this and the options are observed
        continentCode = ko.observable<string>(
            sessionStorage.getItem(SearchMap.ContinentSessionKey) || 'any');
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
        placeId: KnockoutObservable<number> = ko.observable(
            parseInt(sessionStorage.getItem(SearchMap.PlaceIdSessionKey) || 0));
        typeCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.TypeSessionKey) || 'any');
        initSessionTypeCode: string = sessionStorage.getItem(SearchMap.TypeSessionKey) || 'any'

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.continentCode() == undefined) this.continentCode('any');
            if (this.typeCode() == undefined) this.typeCode('any');
            if (this.typeCode() != 'any' && this.typeCode() != undefined) {
                this._loadSummary(this.typeCode());
            }

            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchMap.TypeSessionKey, this.typeCode());
            sessionStorage.setItem(SearchMap.PlaceIdSessionKey, this.placeId().toString());
            sessionStorage.setItem(SearchMap.ZoomSessionKey, this.zoom().toString());
            sessionStorage.setItem(SearchMap.LatSessionKey, this.lat().toString());
            sessionStorage.setItem(SearchMap.LngSessionKey, this.lng().toString());
            sessionStorage.setItem(SearchMap.DetailPrefSessionKey, this.detailPreference() || '');
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchMapSettings) {
            this._loadSummary(this.typeCode());
            this._loadCountryOptions();
            this._loadAgreementTypes();
            this.sammy = this.settings.sammy || Sammy();
            this._runSammy();

            this._map.ready().done((): void => {
                this._map.onIdle((): void => {
                    var idles = this._map.idles();
                    setTimeout((): void => {
                        if (idles == this._map.idles() && !this._map.isDragging() && this._isActivated()) {
                            if (this.zoom() != this._map.zoom()
                                || !SearchMap._areCoordinatesEqualEnough(this.lat(), this._map.lat())
                                || !SearchMap._areCoordinatesEqualEnough(this.lng(), this._map.lng())) {
                                this.lat(this._map.lat());
                                this.lng(this._map.lng());
                                this.zoom(this._map.zoom());
                                this.setLocation();
                            }
                        }
                    }, 1000);
                });
            });
        }

        //#endregion
        //#region Google Map

        private _map = new App.GoogleMaps.Map(
            'google_map_canvas',
            { // options
                center: new google.maps.LatLng(this.lat(), this.lng()),
                zoom: this.zoom(), // zoom out
                streetViewControl: false,
                panControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                },
            },
            { // settings
                maxPrecision: 8,
                //log: true,
            }
            );

        triggerMapResize(): JQueryPromise<void> {
            return this._map.triggerResize();
        }

        private static _areCoordinatesEqualEnough(coord1: number, coord2: number): boolean {
            var diff = Math.abs(coord1 - coord2);
            return diff < 0.000001;
        }

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
        private _loadSummary(typeCode?: string): void {
            var url = this.settings.summaryApi;
            if (typeCode) {
                var keyword = "!none!";
                var countryCode = 'any';
                url = url += "Table/" + countryCode + "/" + typeCode + "/" + keyword
            }
            $.get(url)
                .done((response: ApiModels.Summary): void => {
                    ko.mapping.fromJS(response, {}, this.summary);
                });
        }
        clearFilter(): void {
            if (this.placeId()) this.placeId(0);
            else if (this.countryCode() != 'any') this.countryCode('any');
            else if (this.continentCode() != 'any') this.continentCode('any');
        }

        //#endregion
        //#region Country & Continent Options

        // initial options show loading message
        countries = ko.observableArray<Places.ApiModels.Country>();
        countryOptions = ko.computed((): Places.ApiModels.Country[]=> {
            return this._computeCountryOptions();
        });
        continentOptions = ko.computed((): any[]=> {
            return this._computeContinentOptions();
        });

        //typeCodeChange = ko.computed((): any=> {
        //    this.setLocation();
        //    return false;
        //});

        typeOptions: KnockoutObservableArray<Places.ApiModels.AgreementType> = ko.observableArray(
            [{ code: 'any', name: '[Loading...]' }]);

        //private _typeChanged: KnockoutComputed<void> = ko.computed((): void => {
        //    if (this.spinner) {
        //        this._continentsResponse = undefined;
        //        this._countriesResponse = undefined;
        //        this._placesResponse = undefined;
        //        this._onTypeChanged();
        //    }
        //});
        //private _onTypeChanged(): void {
        //    // changes when applyBindings happens and after options data is loaded
        //    var typeCode = this.typeCode();
        //    var options = this.typeOptions();
        //    // keep typeCode as an option so that we don't lose it when options change
        //    if (options.length == 1 && options[0].code != typeCode)
        //        options[0].code = typeCode;

        //    if (this.spinner) {
        //        this._load();
        //    }
        //}

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

        private _loadAgreementTypes(): JQueryDeferred<void> {
            // this will run once during construction
            // this will run before sammy and applyBindings...
            var deferred = $.Deferred();
            $.get("/api/agreements/agreement-types/0/")
                .done((response: Places.ApiModels.AgreementType[]): void => {
                    // ...but this will run after sammy and applyBindings
                    var options = response.slice(0);
                    // customize options
                    var any: Places.ApiModels.AgreementType = {
                        code: 'any',
                        name: '[All types]'
                    };
                    options = Enumerable.From([any]).Concat(options).ToArray();

                    this.typeOptions(options); // push into observable array
                    this.typeCode(this.initSessionTypeCode);
                    deferred.resolve();

                });
            return deferred;
        }

        continentSelected(): void {
            this.countryCode('any');
            this.placeId(0);
        }

        countrySelected(): void {
            this.placeId(0);
        }

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/continent/{7}/country/{1}/type/{2}/place/{3}/zoom/{4}/latitude/{5}/longitude/{6}/'
            .format(this.settings.route).replace('{7}', '{0}');
        routeChanged: boolean;
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
                this.routeFormat.format(':continent', ':country', ':type', ':place', ':zoom', ':lat', ':lng'),
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._onRoute(e);
                });

            // activate the page route (create default hashtag parameters)
            this.sammy.get(
                this.settings.activationRoute || this.sammy.getLocation(),
                function (): void {
                    viewModel.setLocation();
                });

            if (!this.settings.sammy && !this.sammy.isRunning())
                this.sammy.run();
        }

        private _onBeforeRoute(e: Sammy.EventContext): boolean {
            // prevent the route from changing lat or lng by insignificant digits
            var newLat: string = e.params['lat'];
            var newLng: string = e.params['lng'];
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
        }

        private _areFloatsEqualEnough(value1: number, value2: number): boolean {
            if (value1 == value2) return true;
            var string1 = value1.toString();
            var string2 = value2.toString();
            var index1 = string1.indexOf('.');
            var index2 = string2.indexOf('.');
            if (index1 < 0 || index2 < 0) return string1 == string2;
            var int1 = parseInt(string1.substr(0, index1));
            var int2 = parseInt(string2.substr(0, index2));
            if (int1 != int2) return false;
            var precision1 = parseInt(string1.substr(index1 + 1));
            var precision2 = parseInt(string2.substr(index2 + 1));
            if (precision1 < 10000) return precision1 == precision2;
            // need to make sure both preceisions have the same number of digits
            while (precision1.toString().length < precision2.toString().length) {
                precision1 *= 10;
            }
            while (precision2.toString().length < precision1.toString().length) {
                precision2 *= 10;
            }
            return Math.abs(precision1 - precision2) < 100;
            return true;
        }

        private _onRoute(e: Sammy.EventContext): void {
            var continent: string = e.params['continent'];
            var country: string = e.params['country'];
            var type: string = e.params['type'];
            var placeId: string = e.params['place'];
            var zoom: string = e.params['zoom'];
            var lat: string = e.params['lat'];
            var lng: string = e.params['lng'];

            this.continentCode(continent);
            this.countryCode(country);
            this.typeCode(type);
            this.placeId(parseInt(placeId));
            this.zoom(parseInt(zoom));
            this.lat(parseFloat(lat));
            this.lng(parseFloat(lng));
            this.activate();
        }

        loadViewport: number = 0;
        activate(): void {
            if (!this._isActivated()) {
                if (this._map.map) this._map.triggerResize();
                this._scopeHistory([]);
                this._viewportHistory([]);
                $.when(this._map.ready()).then((): void => {
                    this._isActivated(true);
                });
            }
        }
        deactivate(): void {
            if (this._isActivated()) this._isActivated(false);
        }

        private _route: KnockoutComputed<string> = ko.computed((): string => {
            // this will run once during construction
            return this._computeRoute();
        });

        private _computeRoute(): string {
            // build what the route should be, based on current filter inputs
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
        }

        setLocation(): void {
            // only set the href hashtag to trigger sammy when the current route is stale
            var route = this._route();
            if (this.sammy.getLocation().indexOf(route) < 0) {
                this.sammy.setLocation(route);
            }
        }

        //#endregion
        //#region Query Scoping

        private _scopeHistory = ko.observableArray<SearchMapScope>();
        private _currentScope = ko.computed((): SearchMapScope => {
            // this will run once during construction
            return this._computeCurrentScope();
        });

        private _computeCurrentScope(): SearchMapScope {
            var scope: SearchMapScope = {
                continentCode: this.continentCode(),
                countryCode: this.countryCode(),
                typeCode: this.typeCode(),
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
                (!isNaN(lastScope.placeId) && lastScope.placeId != thisScope.placeId) || lastScope.typeCode != thisScope.typeCode) {
                //if (lastScope && lastScope.typeCode != thisScope.typeCode) {
                //    this._continentsResponse = undefined;
                //    this._countriesResponse = undefined;
                //    this._placesResponse = undefined;
                //}
                this._scopeHistory.push(thisScope);
                $.when(this._map.ready()).then((): void => {
                    this._map.triggerResize();
                    this._load();
                });
            }
        }

        //#endregion
        //#region Query Viewporting

        private _viewportHistory: KnockoutObservableArray<App.GoogleMaps.MapViewportSettings> = ko.observableArray();
        private _currentViewport = ko.computed((): App.GoogleMaps.MapViewportSettings => {
            // this will run once during construction
            return this._computeCurrentViewport();
        });

        private _computeCurrentViewport(): App.GoogleMaps.MapViewportSettings {
            var viewport: App.GoogleMaps.MapViewportSettings = {
                zoom: this.zoom(),
                center: new google.maps.LatLng(this.lat(), this.lng()),
            };
            return viewport;
        }

        private _viewportDirty = ko.computed((): void => {
            this._onViewportDirty();
        }).extend({ throttle: 1 });

        private _onViewportDirty(): void {
            var zoom = this.zoom();
            var lat = this.lat();
            var lng = this.lng();
            if (!this._isActivated() || this.loadViewport) return;

            var viewportHistory = this._viewportHistory();
            var lastViewport: App.GoogleMaps.MapViewportSettings = viewportHistory.length
                ? Enumerable.From(viewportHistory).Last() : null;
            var thisViewport = this._currentViewport();

            if (!lastViewport || lastViewport.zoom != thisViewport.zoom ||
                !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lat(), thisViewport.center.lat()) ||
                !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lng(), thisViewport.center.lng())) {

                this._viewportHistory.push(thisViewport);
                $.when(this._map.ready()).then((): void => {
                    this._map.setViewport(thisViewport).then((): void => {
                        this.setLocation();
                    });
                });
            }
        }

        //#endregion
        //#region Navigational Binding

        private _continentsResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _countriesResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _placesResponse: KnockoutObservableArray<ApiModels.PlaceWithAgreements>;
        private _partnersResponse: KnockoutObservableArray<ApiModels.Participant>;
        spinner = new App.Spinner({ delay: 400, });

        private _load(): void {
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
                else if (countryCode == 'any') { // continentCode != 'any', but can be none or Antarctic
                    placeType = 'countries';
                }
                var placesReceived = this._requestPlaces(placeType);
                $.when(placesReceived).done((): void => {
                    this._receivePlaces(placeType);
                    setTimeout((): void => { // pre-load the other data sets
                        this._requestPlaces('continents');
                        this._requestPlaces('countries');
                        this._requestPlaces('');
                    }, 0);
                })
                    .always((): void => {
                        this.spinner.stop();
                    });
            }
            else {
                var partnersReceived = this._requestPartners();
                $.when(partnersReceived).done((): void => {
                    this._receivePartners();
                })
                    .always((): void => {
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

            if (this.typeCode() != 'any') {
                var type = this.typeCode();
                //places = places.filter(function (value, index, test) {
                //    if (value.agreementTypes.indexOf(type) == -1) {
                //        return false;
                //    } else {
                //        return true;
                //    }
                //})
                places = places.map(function (x) {
                    x.agreementCount = x.agreementTypes.filter(function (value, index, test) {
                        if (value.indexOf(type) == -1) {
                            return false;
                        } else {
                            return true;
                        }
                    }).length;
                    return x;
                })
                //places = Enumerable.From(places)
                //    .Where(function (x: ApiModels.PlaceWithAgreements): boolean {
                //        return x.agreementTypes.indexOf(type) > -1;
                //    }).ToArray();
            } else {
                places = places.map(function (x) {
                    x.agreementCount = x.agreementTypes.length;
                    return x;
                })
            }

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
            this._plotMarkers(placeType, places);

            var viewportSettings = this._getMapViewportSettings(placeType, places);
            if (this._scopeHistory().length + this.loadViewport > 1) {
                this._map.setViewport(viewportSettings).then((): void => {
                });
                this._updateRoute();
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
            var markers: google.maps.Marker[] = [];
            $.each(places, (i: number, place: ApiModels.PlaceWithAgreements): void => {
                if (!place.agreementCount) return; // do not render zero
                //if (placeType == 'continents' && !place.agreementCount) return; // do not render zero on continent
                var title = '{0} - {1} agreement{2}\r\nClick for more information'
                    .format(place.name, place.agreementCount, place.agreementCount == 1 ? '' : 's');
                if (!placeType)
                    title = '{0} agreement{1}\r\nClick for more information'
                        .format(place.agreementCount, place.agreementCount == 1 ? '' : 's');
                var options: google.maps.MarkerOptions = {
                    position: Places.Utils.convertToLatLng(place.center),
                    title: title,
                    clickable: place.agreementCount > 0,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, place.agreementCount.toString(), scaler);
                var marker = new google.maps.Marker(options);
                markers.push(marker);

                // display partner name in title when only 1 agreement
                if (place.agreementCount == 1) {
                    marker.set('ucosmic_agreement_id', place.agreementIds[0]);
                }

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
            this._map.replaceMarkers(markers);

            // update titles of markers with agreementCount == 1
            var singleMarkers = Enumerable.From(markers)
                .Where(function (x: google.maps.Marker): boolean {
                    var agreementId = x.get('ucosmic_agreement_id');
                    return !isNaN(agreementId) && agreementId > 0;
                })
                .ToArray();
            if (singleMarkers.length) {
                var agreementIds = Enumerable.From(singleMarkers)
                    .Select(function (x: google.maps.Marker): number {
                        return parseInt(x.get('ucosmic_agreement_id'));
                    }).ToArray();
                // TODO: this is not dry
                $.get(this.settings.partnersApi, { agreementIds: agreementIds, })
                    .done((response: ApiModels.Participant[]): void => {
                        $.each(singleMarkers, (i: number, singleMarker: google.maps.Marker): void => {
                            var agreementId = parseInt(singleMarker.get('ucosmic_agreement_id'));
                            // agreement can have many partners
                            var partners: ApiModels.Participant[] = Enumerable.From(response)
                                .Where(function (x: ApiModels.Participant): boolean {
                                    return x.agreementId == agreementId;
                                }).ToArray();
                            if (!partners.length) return;
                            if (!this.placeId()) {
                                var title = singleMarker.getTitle().replace('\r\nClick for more information', '');
                                $.each(partners, (i: number, partner: ApiModels.Participant): void => {
                                    title += '\r\n{0}'.format(partner.establishmentTranslatedName);
                                });
                                singleMarker.setTitle(title);
                            }
                        });
                    })
            }
        }

        private _getMapViewportSettings(placeType: string, places: ApiModels.PlaceWithAgreements[]): App.GoogleMaps.MapViewportSettings {

            var settings: App.GoogleMaps.MapViewportSettings = {
                bounds: new google.maps.LatLngBounds(),
            };

            // zoom map to level 1 in order to view continents
            if (placeType == 'continents') {
                settings.zoom = 1;
                settings.center = SearchMap.defaultMapCenter;
            }

            // zoom map for countries based on response length
            else if (placeType == 'countries') {
                var continentCode = this.continentCode();
                //#region zero places, try continent bounds
                if (!places.length) {
                    if (continentCode && this._continentsResponse) {
                        var continent: ApiModels.PlaceWithAgreements = Enumerable.From(this._continentsResponse())
                            .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithAgreements): boolean {
                                return x.continentCode == continentCode;
                            });
                        if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                            settings.bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                        }
                    }
                }
                //#endregion
                //#region one place, try country bounds
                else if (places.length == 1) {
                    var country = places[0];
                    if (country && country.boundingBox && country.boundingBox.hasValue)
                        settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                }
                //#endregion
                //#region multiple places, extend bounds
                else {
                    var latLngs = Enumerable.From(places)
                        .Select(function (x: ApiModels.PlaceWithAgreements): any {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                    $.each(latLngs, function (index: number, latLng: google.maps.LatLng): void {
                        settings.bounds.extend(latLng);
                    });
                }
                //#endregion
            }
            else {
                var countryCode = this.countryCode();
                //#region zero places, try country bounds
                if (!places.length) {
                    if (countryCode && this.countryOptions) {
                        var countryOption: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
                            .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
                                return x.code == countryCode;
                            });
                        if (countryOption && countryOption.box && countryOption.box.hasValue) {
                            settings.bounds = Places.Utils.convertToLatLngBounds(countryOption.box);
                        }
                    }
                }
                //#endregion
                //#region one place, try country bounds
                else if (places.length == 1) {
                    var country = places[0];
                    if (country && country.boundingBox && country.boundingBox.hasValue)
                        settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                }
                //#endregion
                //#region multiple places, extend bounds
                else {
                    var latLngs = Enumerable.From(places)
                        .Select(function (x: ApiModels.PlaceWithAgreements): any {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                    $.each(latLngs, function (index: number, latLng: google.maps.LatLng): void {
                        settings.bounds.extend(latLng);
                    });
                }
                //#endregion
            }

            return settings;
        }

        private _updateRoute(): void {
            var isDirty = false;
            if (!this._areFloatsEqualEnough(this.lat(), this._map.lat())) {
                this.lat(this._map.lat());
                isDirty = true;
            }
            if(this.routeChanged){
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
            if (this.loadViewport < 0) this.loadViewport = 0;
        }


        private _loadStatus(countryCode?: string, continentCode?: string, typeCode?: string): void {
            var url = this.settings.summaryApi;
            url = url += "Map/" + countryCode + "/" + typeCode + "/" + continentCode
            this.status.agreementCount('?');
            this.status.partnerCount('?');
            $.get(url)
                .done((response: ApiModels.Summary): void => {
                    //ko.mapping.fromJS(response, {}, this.summary);
                    this.status.agreementCount(response.agreementCount.toString());
                    this.status.partnerCount(response.partnerCount.toString());
                });
        }

        private _updateStatus(placeType: string, places: ApiModels.PlaceWithAgreements[]) {

            this._loadStatus(this.countryCode(),this.continentCode(), this.typeCode());
            //if (this.typeCode() != 'any') {
            //    var type = this.typeCode();
            //    places = places.map(function (x) {
            //        //var myX = x.agreementTypes.filter(function (value, index, test) {
            //        //    if (value.indexOf(type) == -1) {
            //        //        return false;
            //        //    } else {
            //        //        return true;
            //        //    }
            //        //});
            //        //x.agreementCount = x.agreementTypes.filter(function (value, index, test) {
            //        //if (value.indexOf(type) == -1) {
            //        //    return false;
            //        //} else {
            //        //    return true;
            //        //}
            //        //}).length;
            //        //x.partnerCount = x.agreementTypes.filter(function (value, index, test) {
            //        //    if (value.indexOf(type) == -1) {
            //        //        return false;
            //        //    } else {
            //        //        return true;
            //        //    }
            //        //}).length;

            //        //x.agreementTypes.forEach(function (value: any, index: number, array: Array<Object>) {
            //        //    if (value.indexOf(type) == -1) {
            //        //        x.partnerCount = x.partnerCount - 1;
            //        //        x.agreementCount = x.agreementCount - 1;
            //        //        //x.partnerIds.splice(index, 1);
            //        //        //x.agreementIds.splice(index, 1);
            //        //    } 
            //        //});
            //        //return x;
            //    })
            //}
            //if (places && places.length) {
            //    this.status.agreementCount(Enumerable.From(places)
            //        .SelectMany(function (x: ApiModels.PlaceWithAgreements, i: number): number[] {
            //            return x.agreementIds;
            //        })
            //        .Distinct(function (x: number): number {
            //            return x;
            //        })
            //        .Count().toString());
            //    this.status.partnerCount(Enumerable.From(places)
            //        .SelectMany(function (x: ApiModels.PlaceWithAgreements, i: number): number[] {
            //            return x.partnerIds;
            //        })
            //        .Distinct(function (x: number): number {
            //            return x;
            //        })
            //        .Count().toString());
            //}
            //else {
            //    this.status.agreementCount('0');
            //    this.status.partnerCount('0');
            //}
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
                    this.status.agreementCount('0');
                    this.status.partnerCount('0');
                    this.status.countryCount('this area');
                    deferred.reject();
                    this.spinner.stop();
                    //alert('There are no agreements for place #{0}.'.format(placeId));
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
            var viewportSettings: App.GoogleMaps.MapViewportSettings = {
                bounds: new google.maps.LatLngBounds(),
            };
            if (uniquePartners.length == 1) {
                // try zoom first
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
                $.each(uniquePartners, (i: number, partner: ApiModels.Participant): void => {
                    viewportSettings.bounds.extend(Places.Utils.convertToLatLng(partner.center));
                });
            }
            else {
                alert('Found no agreement partners for place #{0}.'.format(this.placeId()));
            }

            // plot the markers
            var markers: google.maps.Marker[] = [];
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
                    position: Places.Utils.convertToLatLng(partner.center),
                    title: '{0} - {1} agreement{2}'
                        .format(partner.establishmentTranslatedName, agreements.length, agreements.length == 1 ? '' : 's'),
                    clickable: true,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, agreements.length.toString(), scaler);
                var marker = new google.maps.Marker(options);
                markers.push(marker);
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
                        };
                        this._map.clearInfoWindows();
                        this._map.openInfoWindowAtMarker(options, marker);
                    }
                });
            });

            this._map.replaceMarkers(markers);

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

            if (this._scopeHistory().length + this.loadViewport > 1) {
                this._map.setViewport(viewportSettings).then((): void => {
                    this._updateRoute();
                });
            }
        }

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