
//interface EventTarget {
//    result: any;
//}

var last_url = sessionStorage.getItem('last_employee_activity_map_url');
if (location.href.indexOf('pageNumber') > -1) {
    sessionStorage.setItem('last_employee_activity_map_url', location.href);
} else if (last_url) {
    location.href = last_url;
}

module Activities.ViewModels {


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
        continentCode = ko.observable<string>(
            sessionStorage.getItem(SearchMap.ContinentSessionKey) || 'any');
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
        continentName = ko.observable<string>(
            sessionStorage.getItem('continentName') || '');

        static defaultMapCenter = new google.maps.LatLng(0, 17)


        parentObject;
        ancestorId;
        keyword;
        regionCount = ko.observable<string>('');
        activityCount = ko.observable<string>('?');
        peopleCount = ko.observable<string>('?');
        locationCount = ko.observable<string>('?');

        //#endregion

        _continentsResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;
        _countriesResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;
        _watersResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;

        //#region Search Filter Input sessionStorage

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
        }

        static ContinentSessionKey = 'ActivitySearchContinent';
        static CountrySessionKey = 'ActivitySearchCountry2';
        static SearchOptions = 'ActivitySearchOptions'
        replaceAll(find, replace, str) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        updateSearch(search) {
            var searchOptions = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));
            if (searchOptions) {
                search.pageNumber = searchOptions.pageNumber;
                search.orderBy = searchOptions.orderBy;
                search.pageSize = searchOptions.pageSize;
            }
            search.continentCode = this.continentCode();
            search.continentName = this.continentName();
            return search;
        }

        createTableUrl(search) {
            if (!this.parentObject.tableUrl() || this.parentObject.tableUrl().indexOf('?') == 0) {
                this.parentObject.tableUrl(location.href.replace('map', 'table') + '?');
            }
            var tempUrl: string = this.parentObject.tableUrl();
            tempUrl = tempUrl.substr(0, tempUrl.indexOf("?"))
            tempUrl += "?" + $.param(search)
            tempUrl = this.replaceAll('%5B%5D', '', tempUrl);
            return tempUrl
        }

        private updateSession(search) {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.continentCode() == undefined) this.continentCode('any');

            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            search = this.updateSearch(search);
            sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(search));

            var tempUrl = this.createTableUrl(search);
            this.parentObject.tableUrl(tempUrl);


        }

        //#endregion
        //#region Construction & Initialization

        private _removeContinents(placeNames: Array<string>, continent: string) {
            var index = placeNames.indexOf(continent);
            if (index > -1) {
                placeNames.splice(index, 1);
            }
        }

        dataDefered = $.Deferred();
        constructor(output, parentObject) {
            //this._ConstructMapData(output, parentObject);

            this.parentObject = parentObject;
            this.parentObject.tableUrl(location.href.replace('map', 'table'));
            this.ancestorId = output.input.ancestorId ? output.input.ancestorId : "null";
            //this.keyword = output.input.keyword ? output.input.keyword : "null";
            if (!output.input.activityTypeIds) {
                output.input.activityTypeIds = [];
                $.each(output.activityTypes,(i: number, type: any): void => {
                    output.input.activityTypeIds.push(type.activityTypeId);
                });
            }


            this._ConstructMapData(output.input);
        }
        placeFilter = ko.observable<string>();
        private _ConstructMapData(input?) {
            var searchOptions = sessionStorage.getItem(SearchMap.SearchOptions);

            var continentsData;
            var watersData;
            var countriesData;
            var regionsData;
            if (searchOptions) {
                input = JSON.parse(searchOptions);
                var input2 = input;
                delete input2.continentName;
                input2.continentCode = 'any';
                input2 = this._deleteInputProperties(input2);
                searchOptions = JSON.stringify(input2);
                continentsData = sessionStorage.getItem(searchOptions + 'continents');
                watersData = sessionStorage.getItem(searchOptions + 'waters');
                countriesData = sessionStorage.getItem(searchOptions + 'countries');
                regionsData = sessionStorage.getItem(searchOptions + 'regions');
            }
            this.parentObject.loadingSpinner.start();
            //load the placefilter one first
            var dataDeferred = $.Deferred();
            var placeFilter = input.placeFilter;
            if ((input.placeNames || input.keyword) && this.continentCode().toLowerCase() != 'water') {
                //if ((this.parentObject.placeNames() || this.parentObject.keyword()) && this.continentCode().toLowerCase() != 'water') {
                placeFilter = 'countries';
                input.placeFilter = placeFilter;
            } else if (this.continentCode().toLowerCase() == 'water') {
                placeFilter = 'waters';
                input.placeFilter = placeFilter;

            } else if (!placeFilter && this.continentCode() != 'any' && this.continentCode() != 'WATER') {
                placeFilter = 'countries'
                input.placeFilter = placeFilter;
            } else if (this.continentCode() == 'all') {
                placeFilter = 'all'
                input.placeFilter = placeFilter;
            } else {
                placeFilter = 'continents'
                input.placeFilter = placeFilter;
            }
            this.placeFilter(placeFilter);
            //if (placeFilter) {
                if (placeFilter == 'continents') {
                    this._getContinentData(input, continentsData, dataDeferred);
                    $.when(dataDeferred).then(() => {
                        dataDeferred = $.Deferred();
                        this._getCountriesData(input, countriesData, dataDeferred);
                        $.when(dataDeferred).then(() => {
                            dataDeferred = $.Deferred();
                            this._getWatersData(input, watersData, dataDeferred);
                            $.when(dataDeferred).then(() => {
                                this.dataDefered.resolve();
                                //this.loadSummary();
                                //    dataDeferred = $.Deferred();
                                //    this._getRegionsData(input, regionsData);
                            });
                        });
                    });
                } else if (placeFilter == 'countries') {
                    this._getContinentData(input, continentsData, dataDeferred);
                    this._getCountriesData(input, countriesData, dataDeferred);
                    $.when(dataDeferred).then(() => {
                        dataDeferred = $.Deferred();
                        this._getContinentData(input, continentsData, dataDeferred);
                        $.when(dataDeferred).then(() => {
                            dataDeferred = $.Deferred();
                            this._getWatersData(input, watersData, dataDeferred);
                            $.when(dataDeferred).then(() => {
                                this.dataDefered.resolve();
                                //this.loadSummary();
                                //    dataDeferred = $.Deferred();
                                //    this._getRegionsData(input, regionsData);
                            });
                        });
                    });
                } else {
                    this._getContinentData(input, continentsData, dataDeferred);
                    this._getWatersData(input, watersData, dataDeferred);
                    $.when(dataDeferred).then(() => {
                        dataDeferred = $.Deferred();
                        this._getContinentData(input, continentsData, dataDeferred);
                        $.when(dataDeferred).then(() => {
                            dataDeferred = $.Deferred();
                            this._getCountriesData(input, countriesData, dataDeferred);
                            $.when(dataDeferred).then(() => {
                                this.dataDefered.resolve();
                            });
                        });
                    });
                }
        }
        private _deleteInputProperties(input) {
            delete input.pageSize;
            delete input.placeFilter;
            delete input.pageNumber;
            delete input.orderBy;
            return input;
        }

        private _getContinentData(input, data, dataDeferred) {
            var placeFilter = input.placeFilter;
            if (data) {
                dataDeferred.resolve();
                this._continentsResponse = ko.observableArray(JSON.parse(data));
                if (placeFilter == 'continents') {
                    this._map.ready().done((): void => {
                        this._load(placeFilter);
                    });
                }
            }
            else {
                var settings = settings || {};
                input.continentCode = 'any';
                var url = '/api/usf.edu/employees/continents/?' + $.param(input);

                settings.url = url;
                $.ajax(settings)
                    .done((response: any): void => {
                    this._continentsResponse = ko.observableArray(response);
                    dataDeferred.resolve();
                    if (placeFilter == 'continents') {
                        this._map.ready().done((): void => {
                            this._load(placeFilter);
                            input = this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'continents', JSON.stringify(response))
                        });
                    } else {
                        input = this._deleteInputProperties(input);
                        sessionStorage.setItem(JSON.stringify(input) + 'continents', JSON.stringify(response))
                    }
                })
                    .fail((xhr: JQueryXHR): void => {
                    //promise.reject(xhr);
                })
                    .always(() => {
                    dataDeferred.resolve();
                });
            }
        }

        private _getCountriesData(input, data, dataDeferred) {
            if (data) {
                dataDeferred.resolve();
                this._countriesResponse = ko.observableArray(JSON.parse(data));
                //if (this._countriesResponse().length > 0) {
                //    this.activityCount(this._countriesResponse()[0].activityCount);
                //    this.locationCount(this._countriesResponse().length.toString());
                //} else {
                //    this.activityCount('0');
                //    this.locationCount('0');
                //}
                if (input.placeFilter == 'countries') {
                    this._map.ready().done((): void => {
                        this._load(input.placeFilter);
                    });
                }
            }
            else {

                var settings = settings || {};

                if (!input.continentCode) {
                    input.continentCode = 'any';
                }
                //var input = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));
                var url = '/api/usf.edu/employees/countries/?' + $.param(input);

                settings.url = url;
                var placeFilter = input.placeFilter;
                $.ajax(settings)
                    .done((response: any): void => {
                    dataDeferred.resolve();
                    this._countriesResponse = ko.observableArray(response);
                    //if (response.length > 0) {
                    //    this.activityCount(response[0].activityCount);
                    //    this.locationCount(response[0].length.toString());
                    //} else {
                    //    this.activityCount('0');
                    //    this.locationCount('0');
                    //}
                    if (placeFilter == 'countries') {
                        this._map.ready().done((): void => {
                            this._load(placeFilter);
                            input = this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'countries', JSON.stringify(response))
                        });
                    } else {
                        input = this._deleteInputProperties(input);
                        sessionStorage.setItem(JSON.stringify(input) + 'countries', JSON.stringify(response))
                    }
                })
                    .fail((xhr: JQueryXHR): void => {
                    //promise.reject(xhr);
                })
                    .always(() => {
                    dataDeferred.resolve();
                });
            }
        }

        private _getWatersData(input, data, dataDeferred) {
            if (data) {
                dataDeferred.resolve();
                this._watersResponse = ko.observableArray(JSON.parse(data));
                if (input.placeFilter == 'waters') {
                    this._map.ready().done((): void => {
                        this._load(input.placeFilter);
                    });
                }
            }
            else {

                var settings = settings || {};

                if (!input.continentCode) {
                    input.continentCode = 'any';
                }
                //var input = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));
                var url = '/api/usf.edu/employees/waters/?' + $.param(input);

                settings.url = url;
                var placeFilter = input.placeFilter;
                $.ajax(settings)
                    .done((response: any): void => {
                    dataDeferred.resolve();
                    this._watersResponse = ko.observableArray(response);
                    if (placeFilter == 'waters') {
                        this._map.ready().done((): void => {
                            this._load(placeFilter);
                            input = this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'waters', JSON.stringify(response))
                        });
                    } else {
                        input = this._deleteInputProperties(input);
                        sessionStorage.setItem(JSON.stringify(input) + 'waters', JSON.stringify(response))
                    }
                })
                    .fail((xhr: JQueryXHR): void => {
                    //promise.reject(xhr);
                })
                    .always(() => {
                    dataDeferred.resolve();
                });

            }
        }


        //#endregion
        //#region Google Map

        private _map = new App.GoogleMaps.Map(
            'google_map_canvas',
            { // options
                //center: new google.maps.LatLng(this.lat(), this.lng()),
                //zoom: this.zoom(), // zoom out
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

        serializeObject(object): any {

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
        }

        //#region Summary
        reloadData(form, reloadPage): void {
            var input = this.serializeObject($('form'));
            this.updateSession(input)
            if (reloadPage) {
                var search = input;
                var url = location.href.split('?')[0] + '?ancestorId=' + search.ancestorid + '&keyword=' + search.keyword;
                location.href = url;
                return;
            }

            if (this.parentObject.loadingSpinner.isVisible()) return;
            var stringActivityMapData;
            var activityMapData;
            var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');

            if (stringActivityMapDataSearch == this.ancestorId + input.keyword) {
                stringActivityMapData = sessionStorage.getItem('activityMapData');
                activityMapData = $.parseJSON(stringActivityMapData);
            }

            this._ConstructMapData();
        }

        clearFilter(): void {
            this.continentCode('any');
            this.continentName('');
            this.parentObject.placeNames("");
            var placeFilter: string = 'continents';
            if ((this.parentObject.placeNames() || this.parentObject.keyword())) {
                placeFilter = 'countries';
            }
            this.placeFilter(placeFilter);
            this._receivePlaces(placeFilter);
            this.parentObject.$placeFilter.val(placeFilter)
            var search = this.serializeObject(this.parentObject.$form);
            search.continentCode = 'any';
            delete search.continentName;
            this.updateSession(search)
        }

        //#endregion
        //#region Country & Continent Options
        placeType = ko.observable<string>("");
        output;
        // initial options show loading message
        countries = ko.observableArray<Places.ApiModels.Country>();
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
            this.countryCode('any');
        }

        countrySelected(): void {
        }

        //#endregion
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _onBeforeRoute(e: Sammy.EventContext): boolean {
            // prevent the route from changing lat or lng by insignificant digits
            var newLat: string = e.params['lat'];
            var newLng: string = e.params['lng'];
            var allowRoute = true;


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
        
        //#endregion
        //#region Query Scoping

        private _scopeHistory = ko.observableArray<SearchMapScope>();
       
        //#endregion
        //#region Query Viewporting

        private _viewportHistory: KnockoutObservableArray<App.GoogleMaps.MapViewportSettings> = ko.observableArray();
        private _currentViewport = ko.computed((): App.GoogleMaps.MapViewportSettings => {
            // this will run once during construction
            return this._computeCurrentViewport();
        });

        private _computeCurrentViewport(): App.GoogleMaps.MapViewportSettings {
            var viewport: App.GoogleMaps.MapViewportSettings = {
            };
            return viewport;
        }

        private _viewportDirty = ko.computed((): void => {
            this._onViewportDirty();
        }).extend({ throttle: 1 });

        private _onViewportDirty(): void {
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
                        //this.setLocation();
                    });
                });
            }
        }

        //#endregion
        //#region Navigational Binding

        //private _partnersResponse: KnockoutObservableArray<ApiModels.Participant>;
        spinner = new App.Spinner({ delay: 400, });

        private _load(placeType): void {
            var continentCode = this.continentCode();
            var countryCode = this.countryCode();
            if (continentCode != 'any' && continentCode != 'WATER' && continentCode != 'all') {
                placeType = 'countries';
            } else if (continentCode == 'WATER') {
                placeType = 'waters';
            } else if(continentCode == 'all') {
                placeType = 'all';
            }
            //if (this.parentObject.placeNames() != '') {
            //    placeType = 'countries';
            //}

            this.placeType(placeType);

            this._receivePlaces(placeType);

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

            else {
                deferred.resolve();
            }

            return deferred;
        }

        private _receivePlaces(placeType: string): void {
            var places;
            if (placeType == 'countries') {
                if (this._countriesResponse()) {
                    this.parentObject.loadingSpinner.start
                    places = this._countriesResponse();
                } else {
                    this.parentObject.loadingSpinner.start();
                    setTimeout(() => { this._receivePlaces(placeType) }, 50);
                    return;
                }
            } else if (placeType == 'waters') {
                if (this._watersResponse()) {
                    this.parentObject.loadingSpinner.start
                    places = this._watersResponse();
                } else {
                    this.parentObject.loadingSpinner.start();
                    setTimeout(() => { this._receivePlaces(placeType) }, 50);
                    return;
                }
            } else if (placeType == 'all') {
                if (this._countriesResponse()) {
                    this.parentObject.loadingSpinner.start
                    places = this._countriesResponse();
                } else {
                    this.parentObject.loadingSpinner.start();
                    setTimeout(() => {
                        this._receivePlaces(placeType)
                    }, 50);
                    return;
                }
            } else {
                if (this._continentsResponse()) {
                    this.parentObject.loadingSpinner.start
                    places = this._continentsResponse();
                } else {
                    this.parentObject.loadingSpinner.start();
                    setTimeout(() => { this._receivePlaces(placeType) }, 50);
                    return;
                }
            }

            if (placeType == 'countries') {
                var continentCode = this.continentCode();
                if (this.continentCode() && this.continentCode() != 'any') {
                    places = Enumerable.From(places)
                        .Where(function (x: ApiModels.PlaceWithActivities): boolean {
                        return continentCode == 'none'
                            ? !x.id
                            : x.code == continentCode;
                    })
                        .ToArray();
                }
            }
            places = places.filter(function(place){
                return place.count > 0;
            })
            var count = 0;
            var peopleCount = 0;
            $.each(places, function (index, place) {
                count += place.count;
            });
            if (placeType != 'countries' || this.continentCode() == 'any' || this.continentCode() == 'all') {
                var places2: any = this._continentsResponse();
                peopleCount = places2[0].peopleCountTotal;
            } else {
                var places2: any = this._continentsResponse();
                var place = places2.filter((value, index, test) => {
                    if (value.code == this.continentCode()) {
                        return true;
                    } else {
                        return false;
                    }
                });
                peopleCount = place[0].peopleCount;
            }
            if (places.length > 0) {
                this.activityCount(count.toString());
                this.peopleCount(peopleCount.toString());
                this.locationCount(places.length.toString());
            } else {
                this.activityCount('0');
                this.peopleCount('0');
                this.locationCount('0');
            }

            this._plotMarkers(placeType, places);
            var viewportSettings = this._getMapViewportSettings(placeType, places);
            this._map.setViewport(viewportSettings).then((): void => {
            });
        }

        private _plotMarkers(placeType: string, places: ApiModels.PlaceWithActivities[]) {
            var scaler;


            if (placeType == 'countries') {
                scaler = this._getMarkerIconScaler(placeType, this._countriesResponse())
            } else if (placeType == 'waters') {
                scaler = this._getMarkerIconScaler(placeType, this._watersResponse())
            } else {
                scaler = this._getMarkerIconScaler(placeType, this._continentsResponse());
            }
            var continentCode = this.continentCode();
            if (placeType == 'countries' && !places.length && continentCode != 'none') {
                var continent = Enumerable.From(this._continentsResponse())
                    .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithActivities): boolean {
                    return x.code == continentCode;
                });
                if (continent) {
                    places = [continent];
                }
            }
            var countryCode = this.countryCode();
            var markers: google.maps.Marker[] = [];
            $.each(places,(i: number, place: ApiModels.PlaceWithActivities): void => {
                if (placeType == 'continents' && !place.count) return; // do not render zero on continent
                var title = '{0} - {1} activit{2}\r\nClick for more information'
                    .format(place.name, place.count, place.count == 1 ? 'y' : 'ies');
                if (!placeType)
                    title = '{0} activit{1}\r\nClick for more information'
                        .format(place.count, place.count == 1 ? 'y' : 'ies');
                //if(place.name == 'Antarctic'){
                //    place.center.latitude = -78;
                //    place.center.longitude = 40.5;
                //}
                var options: google.maps.MarkerOptions = {
                    position: Places.Utils.convertToLatLng(place.center),
                    title: title,
                    clickable: place.count > 0,
                    cursor: 'pointer',
                };
                if (place.placeType == "region") {
                    this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(248, 62, 52)');
                }
                else if (place.placeType == "water") {
                    this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(47, 67, 253)');
                }
                else if (place.placeType == "country") {
                    this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(29, 172, 13)');
                }
                else if (place.placeType == "global") {
                    this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(237, 145, 5)');
                }
                else {
                    this._setMarkerIcon(options, place.count.toString(), scaler);
                }
                var marker = new google.maps.Marker(options);
                markers.push(marker);

                google.maps.event.addListener(marker, 'mouseover',(e: google.maps.MouseEvent): void => {
                    marker.setOptions({
                        zIndex: 201,
                    });
                });
                google.maps.event.addListener(marker, 'mouseout',(e: google.maps.MouseEvent): void => {
                    var side = marker.getIcon().size.width;
                    setTimeout((): void => {
                        marker.setOptions({
                            zIndex: 200 - side,
                        });
                    }, 400);
                });
                if (placeType === 'continents') {
                    google.maps.event.addListener(marker, 'click',(e: google.maps.MouseEvent): void => {
                        if (place.code == 'WATER') {
                            this.parentObject.loadingSpinner.start();
                            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
                            this.continentCode(place.code);
                            this.countryCode('any');
                            this.continentName(place.name);
                            sessionStorage.setItem('continentName', this.continentName());
                            this.loadViewport++;
                            this._receivePlaces('waters');
                            this.placeType('waters');
                            this.parentObject.$placeFilter.val('waters')
                            this.placeFilter('waters');
                            var search = this.serializeObject(this.parentObject.$form);
                            this.updateSession(search);

                        }
                        else if (place.code) {
                            this.parentObject.loadingSpinner.start();
                            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
                            this.continentCode(place.code);
                            this.countryCode('any');
                            this.continentName(place.name);
                            sessionStorage.setItem('continentName', this.continentName());
                            this.loadViewport++;
                            this._receivePlaces('countries');
                            this.placeType('countries');
                            this.parentObject.$placeFilter.val('countries')
                            this.placeFilter('countries');
                            var search = this.serializeObject(this.parentObject.$form);
                            this.updateSession(search);
                        }
                    });
                }
                else {
                    google.maps.event.addListener(marker, 'click',(e: google.maps.MouseEvent): void => {
                        //take to advanced search table
                        if (place.id != 0) {
                            $('#mapCover').addClass('mapCover');
                            $('#mapCoverLoading').addClass('mapCoverLoading');

                            this.parentObject.loadingSpinner.start();
                            var search = this.serializeObject(this.parentObject.$form);
                            var hasChangedPlaces = false;
                            if (search.placeNames && search.placeNames.length > 0 && search.placeNames.indexOf(place.name) < 0) {
                                search.placeNames += " & " + place.name;
                                search.placeIds += " " + place.id;
                                hasChangedPlaces = true;
                            } else if (search.placeNames.indexOf(place.name) < 0) {
                                search.placeNames = place.name;
                                search.placeIds = place.id.toString();
                                hasChangedPlaces = true;
                            }

                            if (hasChangedPlaces) {
                                sessionStorage.setItem("isMapClick", "1");
                            }

                            search.placeIds = search.placeIds.split(" ");
                            this.updateSession(search);

                            var url = this.createTableUrl(search);//location.href.replace('map', 'table') + '&' + this.replaceAll('%5B%5D', '', $.param(search));
                            location.href = url;
                        }
                    });
                }

            });
            this._map.replaceMarkers(markers);
            if (this.parentObject.affiliationsLoaded) {
                this.parentObject.loadingSpinner.stop();
            }

        }

        fixBoundingBox(boundingBox) {
            if (!boundingBox.northEast) {
                boundingBox.northEast = boundingBox.northeast;
                boundingBox.southWest = boundingBox.southwest;
            }
            return boundingBox;
        }

        private _getMapViewportSettings(placeType: string, places: ApiModels.PlaceWithActivities[]): App.GoogleMaps.MapViewportSettings {

            var settings: App.GoogleMaps.MapViewportSettings = {
                bounds: new google.maps.LatLngBounds(),
            };

            
            // zoom map to level 1 in order to view continents
            if (placeType == 'continents') {
                settings.zoom = 1;
                settings.center = new google.maps.LatLng(0, 0);
            }

            // zoom map for countries based on response length
            else if (placeType == 'countries') {
                var continentCode = this.continentCode();
                //#region zero places, try continent bounds
                if (!places.length) {
                    if (continentCode && this._continentsResponse) {
                        var continent: ApiModels.PlaceWithActivities = Enumerable.From(this._continentsResponse())
                            .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithActivities): boolean {
                            return x.code == continentCode;
                        });
                        if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                            continent.boundingBox = this.fixBoundingBox(continent.boundingBox);
                            settings.bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                        }
                    }
                }
                //#endregion
                //#region one place, try country bounds
                else if (places.length == 1) {
                    var country = places[0];
                    if (country && country.boundingBox && country.boundingBox.hasValue) {
                        country.boundingBox = this.fixBoundingBox(country.boundingBox);
                        settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    }
                }
                //#endregion
                //#region multiple places, extend bounds
                else {
                    var latLngs = Enumerable.From(places)
                        .Select(function (x: ApiModels.PlaceWithActivities): any {
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
                        .Select(function (x: ApiModels.PlaceWithActivities): any {
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


        private _getMarkerIconScaler(placeType: string, places: ApiModels.PlaceWithActivities[]): Scaler {
            if (!places || !places.length)
                return new Scaler({ min: 0, max: 1, }, { min: 16, max: 16, });
            var from: Range = { // scale based on the smallest & largest agreement counts
                min: Enumerable.From(places).Min(function (x) { return x.count }),
                max: Enumerable.From(places).Max(function (x) { return x.count }),
            };
            var into: Range = { min: 24, max: 48 }; // smallest & largest placemarker circles
            if (!placeType) into = { min: 24, max: 32 };

            return new Scaler(from, into);
        }

        private _setMarkerIcon(options: google.maps.MarkerOptions, text: string, scaler: Scaler, color = 'rgb(11, 11, 11)'): void {
            var side = isNaN(parseInt(text)) ? 24 : scaler.scale(parseInt(text));
            if (text == '0') {
                side = 24;
            }
            var halfSide = side / 2;
            var settings = {
                opacity: 0.7,
                side: side,
                text: text,
                fillColor: color,
            };
            var url = '{0}?{1}'.format("/api/graphics/circle", $.param(settings));
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

        $infoWindow: JQuery;
        infoWindowContent: any = {
            partner: ko.observable({}),
            agreements: ko.observableArray([]),
        };

        //#endregion


        //#region indexedDb map data
        createIndexDb = function () {
            //http://code.tutsplus.com/tutorials/working-with-indexeddb--net-34673
            //if I can do this then load it into the session
            var idbSupported = false;
            var db;
            if ("indexedDB" in window) {
                idbSupported = true;
            }

            var openRequest = indexedDB.open("test", 1);

            openRequest.onupgradeneeded = function (e) {
                console.log("running onupgradeneeded");
            }

            openRequest.onsuccess = function (e) {
                console.log("Success!");
            }

            openRequest.onerror = function (e) {
                console.log("Error");
            }

            var transaction = db.transaction(["mapData"], "readwrite");
            var store = transaction.objectStore("mapData");
            var mapData = {
                test: "asdf",
                id: 1
            }

            //Perform the add
            var request = store.add(mapData, 1);
        }

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