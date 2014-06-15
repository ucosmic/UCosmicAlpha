﻿

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
        //placeId: KnockoutObservable<number> = ko.observable(
        //    parseInt(sessionStorage.getItem(SearchMap.PlaceIdSessionKey) || 0));
        continentName = ko.observable<string>(
            sessionStorage.getItem('continentName') || '');

        static defaultMapCenter = new google.maps.LatLng(0, 17)

        //zoom: KnockoutObservable<number> = ko.observable(
        //    parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
        //lat: KnockoutObservable<number> = ko.observable(
        //    parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || SearchMap.defaultMapCenter.lat());
        //lng: KnockoutObservable<number> = ko.observable(
        //    parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || SearchMap.defaultMapCenter.lng());
        //detailPreference: KnockoutObservable<string> = ko.observable(
        //    sessionStorage.getItem(SearchMap.DetailPrefSessionKey));
        //detailPreferenceChecked: KnockoutComputed<boolean> = ko.computed({
        //    read: (): boolean => { return this.detailPreference() == '_blank' },
        //    write: (value: boolean): void => { this.detailPreference(value ? '_blank' : ''); },
        //});

        parentObject;
        ancestorId;
        keyword;
        regionCount = ko.observable<string>('');

        //#endregion

        _continentsResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;
        _countriesResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;
        _watersResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;
        //_placesResponse: KnockoutObservableArray<ApiModels.PlaceWithActivities>;

        //#region Search Filter Input sessionStorage

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            //kendo.init($(element));
            //this._applyKendo();
            //this._applySubscriptions();
        }

        static ContinentSessionKey = 'ActivitySearchContinent';
        static CountrySessionKey = 'ActivitySearchCountry2';
        static SearchOptions = 'ActivitySearchOptions'
        //static PlaceIdSessionKey = 'AgreementMapSearchPlaceId';
        //static ZoomSessionKey = 'AgreementSearchZoom';
        //static LatSessionKey = 'AgreementSearchLat';
        //static LngSessionKey = 'AgreementSearchLng';
        //static DetailPrefSessionKey = 'AgreementSearchMapDetailPreference';

        // automatically save the search inputs to session when they change
        //UpdateQueryString(key, value, url) {
        //    if (!url) url = window.location.href;
        //    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi");

        //    if (re.test(url)) {
        //        if (typeof value !== 'undefined' && value !== null)
        //            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        //        else {
        //            var hash = url.split('#');
        //            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
        //            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
        //                url += '#' + hash[1];
        //            return url;
        //        }
        //    }
        //    else {
        //        if (typeof value !== 'undefined' && value !== null) {
        //            var separator = url.indexOf('?') !== -1 ? '&' : '?',
        //                hash = url.split('#');
        //            url = hash[0] + separator + key + '=' + value;
        //            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
        //                url += '#' + hash[1];
        //            return url;
        //        }
        //        else
        //            return url;
        //    }
        //}
        replaceAll(find, replace, str) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        //getParameterByName(name) {
        //    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        //    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        //        results = regex.exec(location.search);
        //    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        //}
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

            var tempUrl: string = this.parentObject.tableUrl();
            tempUrl = tempUrl.substr(0, tempUrl.indexOf("?"))
            tempUrl += "?" + $.param(search)
            tempUrl = this.replaceAll('%5B%5D', '', tempUrl);
            //tempUrl = this.UpdateQueryString('keyword', search.keyword, tempUrl);
            //tempUrl = this.UpdateQueryString('ancestorId', search.ancestorid, tempUrl);
            //tempUrl = this.UpdateQueryString('placeNames', search.placeNames, tempUrl);
            //tempUrl = this.UpdateQueryString('placeIds', search.placeIds, tempUrl);
            //tempUrl = this.UpdateQueryString('since', search.Since, tempUrl);
            //tempUrl = this.UpdateQueryString('until', search.Until, tempUrl);
            //tempUrl = this.replaceAll('includeUndated=', '', tempUrl);
            //if(search.includeundated){
            //    tempUrl += '&includeUndated=' + search.includeundated;
            //}else{
            //    tempUrl += '&includeUndated=false';
            //}
            //tempUrl = this.replaceAll('activityTypeIds=', '', tempUrl);

            //if (search.activityTypeIds && search.activityTypeIds.length > 1) {
            //    $.each(search.activityTypeIds, function (index, value) {
            //        tempUrl += '&activityTypeIds=' + value
            //    });
            //}
            //if(search.activityTypeIds && search.activityTypeIds.length == 1){
            //    tempUrl += '&activityTypeIds=' + search.activityTypeIds;
            //}
            //tempUrl = this.UpdateQueryString('activitytypeids', search.activityTypeIds, tempUrl);
            
            return tempUrl
        }

        private updateSession(search){

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.continentCode() == undefined) this.continentCode('any');

            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
            sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
            //sessionStorage.setItem(SearchMap.PlaceIdSessionKey, this.placeId().toString());
            //sessionStorage.setItem(SearchMap.ZoomSessionKey, this.zoom().toString());
            //sessionStorage.setItem(SearchMap.LatSessionKey, this.lat().toString());
            //sessionStorage.setItem(SearchMap.LngSessionKey, this.lng().toString());
            //sessionStorage.setItem(SearchMap.DetailPrefSessionKey, this.detailPreference() || '');
            search = this.updateSearch(search);
            sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(search));

            var tempUrl = this.createTableUrl(search);
            this.parentObject.tableUrl(tempUrl);
            //this.parentObject.tableUrl(location.href.replace('map', 'table'));


        }

        //#endregion
        //#region Construction & Initialization

        private _removeContinents(placeNames: Array<string>, continent:string){
            var index = placeNames.indexOf(continent);
            if(index > -1){
                placeNames.splice(index, 1);
            }
        }


        private _loadInMapData(data, input) {
            var placeNames: Array<string> = [];
            if (input.placeNames && input.placeNames.length > 1) {
                placeNames = input.placeNames.split(" & ");
            }
            if (input.placeFilter) {
                if (input.activityTypeIds) {
                    var types: string = "";
                    if (input.activityTypeIds.length > 1) {
                        $.each(input.activityTypeIds, function (index, type) {
                        if (index == 0) {
                            types += "$.activityTypeIds.indexOf(" + type + ") > -1"
                        } else {
                                types += " || $.activityTypeIds.indexOf(" + type + ") > -1"
                        }
                        })
                    } else if (input.activityTypeIds.length = 1) {
                            types += "$.activityTypeIds.indexOf(" + input.activityTypeIds + ") > -1"
                    }
                        data = Enumerable.From(data)
                            .Where(types).ToArray();
                }
                //check for & and do this filter twice if present
                if (placeNames.length > 1) {
                    $.each(placeNames, (i: number, place: string): void => {
                        var places: string = "$.continents.All().indexOf('" + place + "') > -1";
                        data = Enumerable.From(data)
                            .Where(function (x) {
                                return (Enumerable.From(x.continents).Where("$.name=='" + place + "'").ToArray().length > 0
                                    || Enumerable.From(x.countries).Where("$.name=='" + place + "'").ToArray().length > 0
                                    || Enumerable.From(x.waters).Where("$.name=='" + place + "'").ToArray().length > 0
                                    || Enumerable.From(x.regions).Where("$.name=='" + place + "'").ToArray().length > 0
                                    );
                            }).ToArray();
                    });
                } else if (placeNames.length == 1) {
                    var places: string = "$.continents.All().indexOf('" + input.placeNames + "') > -1";
                    data = Enumerable.From(data)
                        .Where(function (x) {
                            return (Enumerable.From(x.continents).Where("$.name=='" + input.placeNames + "'").ToArray().length > 0
                                || Enumerable.From(x.countries).Where("$.name=='" + input.placeNames + "'").ToArray().length > 0
                                || Enumerable.From(x.waters).Where("$.name=='" + input.placeNames + "'").ToArray().length > 0
                                || Enumerable.From(x.regions).Where("$.name=='" + input.placeNames + "'").ToArray().length > 0
                                );
                        }).ToArray();
                }
                //if (input.placeNames && input.placeNames.length > 1) {
                //    var places: string = "$.locationNames.indexOf('" + input.placeNames + "') > -1";
                //    data = Enumerable.From(data)
                //        .Where(places).ToArray();
                //}
                if (input.Since && input.Since.length > 1) {
                    var date: string = "new Date($.startsOn) > new Date('" + input.Since + "')";
                    if (input.includeUndated) {
                        date += " || $.startsOn == '0001-01-01T00:00:00'";
                    }
                    data = Enumerable.From(data)
                        .Where(date).ToArray();
                }
                if (input.Until && input.Until.length > 1) {
                    var date: string = "new Date($.endsOn) > new Date('" + input.Until + "')";
                    if (input.includeUndated) {
                        date += " || $.endsOn == '0001-01-01T00:00:00'";
                    }
                    data = Enumerable.From(data)
                        .Where(date).ToArray();
                }
            }

            var continents = Enumerable.From(data)
                .SelectMany("$.continents")
                .GroupBy("$.code", "",
                "k, e => {" +
                "code: k," +
                //"continentId: e.Select($.place).FirstOrDefault().continentId," +
                "boundingBox: e.Select($.place).FirstOrDefault().boundingBox," +
                "center: e.Select($.place).FirstOrDefault().center," +
                //"continentCode: e.Select($.place).FirstOrDefault().continentCode," +
                "name: e.Select($.place).FirstOrDefault().name," +
                "id: e.Select($.place).FirstOrDefault().id," +
                "countryCode: null," +
                "isContinent: true," +
                "isCountry: false," +
                "isEarth: false," +
                "type: 'Continent'," +
                "count: e.Count()}").ToArray();

            var countries = Enumerable.From(data)
                .SelectMany("$.countries")
                .GroupBy("$.name", "",
                "k, e => {" +
                "name: k," +
                //"continentId: e.Select($.place).FirstOrDefault().continentId," +
                "boundingBox: e.Select($.place).FirstOrDefault().boundingBox," +
                "center: e.Select($.place).FirstOrDefault().center," +
                "code: e.Select($.place).FirstOrDefault().code," +
                "name: e.Select($.place).FirstOrDefault().name," +
                "id: e.Select($.place).FirstOrDefault().id," +
                "isContinent: false," +
                "isCountry: true," +
                "isEarth: false," +
                "type: 'Country'," +
                "count: e.Count()}").ToArray();

            var waters = Enumerable.From(data)
                .SelectMany("$.waters")
                .GroupBy("$.name", "",
                "k, e => {" +
                "code: k," +
                //"continentId: e.Select($.place).FirstOrDefault().continentId," +
                "boundingBox: e.Select($.place).FirstOrDefault().boundingBox," +
                "center: e.Select($.place).FirstOrDefault().center," +
                "continentCode: ''," +
                "name: e.Select($.place).FirstOrDefault().name," +
                "id: e.Select($.place).FirstOrDefault().id," +
                "isContinent: false," +
                "isCountry: false," +
                "isEarth: false," +
                "type: 'Water'," +
                "count: e.Count()}").ToArray();

            if (placeNames.length > 0) {
                this._removeContinents(placeNames, 'Asia');
                this._removeContinents(placeNames, 'Africa');
                this._removeContinents(placeNames, 'North America');
                this._removeContinents(placeNames, 'South America');
                this._removeContinents(placeNames, 'Antarctica');
                this._removeContinents(placeNames, 'Oceania');
                this._removeContinents(placeNames, 'Europe');
            }           
            var hasOnePlace = false;
            if (placeNames.length > 1) {
                $.each(placeNames, (i: number, place: string): void => {
                    var count = Enumerable.From(data).SelectMany("$.regions").Where("$.id==-1 && $.name=='" + place + "'").Count();
                    if (count > 0) {
                        if (hasOnePlace) {
                            this.regionCount(this.regionCount() + "Results have " + count + " activity tags of the region " + place + " not shown on map. ");
                        } else {
                            hasOnePlace = true;
                            this.regionCount("Results have " + count + " activity tags of the region " + place + " not shown on map. ");
                        }
                    }                    
                });
            } else if (placeNames.length == 1){
                var count = Enumerable.From(data).SelectMany("$.regions").Where("$.id==-1 && $.name=='" + placeNames[0] + "'").Count();
                if (count > 0) {
                    this.regionCount("Results have " + count + " activity tags of the region " + placeNames[0] + " not shown on map.");
                }   
            }else{
                this.regionCount('');
            }
            //var regionCount = Enumerable.From(data).SelectMany("$.regions").Where("$.id==-1 && $.name==").Count();

            this.countries(continents);
            this._countriesResponse = ko.observableArray(countries);
            this._continentsResponse = ko.observableArray(continents);
            this._watersResponse = ko.observableArray(waters);

            this.output = countries;

            this._map.ready().done((): void => {
                //this._map.onIdle((): void => {
                //    var idles = this._map.idles();
                //    setTimeout((): void => {
                //        if (idles == this._map.idles() && !this._map.isDragging() && this._isActivated()) {
                //            if (this.zoom() != this._map.zoom()
                //                || !SearchMap._areCoordinatesEqualEnough(this.lat(), this._map.lat())
                //                || !SearchMap._areCoordinatesEqualEnough(this.lng(), this._map.lng())) {
                //                this.lat(this._map.lat());
                //                this.lng(this._map.lng());
                //                this.zoom(this._map.zoom());
                //                //this.setLocation();
                //            }
                //        }
                //    }, 1000);
                //});

                this._load(input.placeFilter);
            });
        }

        constructor(output, parentObject) {

            this._ConstructMapData(output, parentObject);
        }

        private _ConstructMapData(output, parentObject) {
            //output.input.placeIds = '';
            //output.input.placeNames = '';
            this.parentObject = parentObject;
            this.parentObject.tableUrl(location.href.replace('map', 'table'));
            var stringActivityMapData;
            var activityMapData;
            var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
            var searchOptions = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));
            if (searchOptions) {
                //searchOptions.placeNames = '';
                //searchOptions.placeIds = '';
                this.updateSession(searchOptions);
            }
            this.ancestorId = output.input.ancestorId ? output.input.ancestorId : "null";
            this.keyword = output.input.keyword ? output.input.keyword : "null";
            
            if (stringActivityMapDataSearch == this.ancestorId + this.keyword) {
                stringActivityMapData = sessionStorage.getItem('activityMapData');
                activityMapData = $.parseJSON(stringActivityMapData);
            }

            if (activityMapData && activityMapData.length) {
                if (searchOptions) {
                    this.continentCode(searchOptions.continentCode);
                    this.continentName(searchOptions.continentName);
                    this._loadInMapData(activityMapData, searchOptions);
                } else {
                    this._loadInMapData(activityMapData, { 'placeFilter': 'continents' });
                }
            } else {
                var settings = settings || {};

                var url = '/api/usf.edu/employees/map/?ancestorid=' + this.ancestorId;
                if (output.input.keyword) {
                    url += '&keyword=' + this.keyword;
                }
                settings.url = url;//'/api/usf.edu/employees/map/?pivot=1&keyword=&ancestorid=3306&placeNames=&placeIds=&activityTypeIds=2&activityTypeIds=3&activityTypeIds=5&activityTypeIds=1&activityTypeIds=4&Since=&Until=&includeUndated=true&includeUndated=false';
                //check with ancestorid - use output.input.anc...
                this.parentObject.loadingSpinner.start();
                $.ajax(settings)
                    .done((response: any): void => {
                        this.parentObject.loadingSpinner.stop();
                        //get ancestorid and add it to the sessionStorage
                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', this.ancestorId + this.keyword);
                        if (searchOptions) {
                            this._loadInMapData(response, searchOptions);
                        } else {
                            this._loadInMapData(response, { 'placeFilter': 'continents' });
                        }
                    })
                    .fail((xhr: JQueryXHR): void => {
                        //promise.reject(xhr);
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

        serializeObject(object): any{

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
            //this.ancestorId = input.ancestorId ? input.ancestorId : "null";
            //this.keyword = input.keyword ? input.keyword : "null";

            if (stringActivityMapDataSearch == this.ancestorId + this.keyword) {
                stringActivityMapData = sessionStorage.getItem('activityMapData');
                activityMapData = $.parseJSON(stringActivityMapData);
            }

            if (activityMapData && activityMapData.length) {
                this._loadInMapData(activityMapData, input);
            } else {
                this.parentObject.loadingSpinner.start();

                var settings = settings || {};
                var url = '{0}?{1}'.format('/api/usf.edu/employees/map/', $.param(input));
                settings.url = url;//'/api/usf.edu/employees/map/?pivot=1&keyword=&ancestorid=3306&placeNames=&placeIds=&activityTypeIds=2&activityTypeIds=3&activityTypeIds=5&activityTypeIds=1&activityTypeIds=4&Since=&Until=&includeUndated=true&includeUndated=false';
                //check with ancestorid - use output.input.anc...
                $.ajax(settings)
                    .done((response: any): void => {
                        this.parentObject.loadingSpinner.stop();
                        //get ancestorid and add it to the sessionStorage
                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', this.ancestorId + this.keyword);
                        this._loadInMapData(response, input);
                    })
                    .fail((xhr: JQueryXHR): void => {
                        //promise.reject(xhr);
                    });
            }
        }
        
        clearFilter(): void {
            this._receivePlaces('continents');
            this.placeType('continents');
            sessionStorage.setItem('continentName', null);
            var search = this.serializeObject(this.parentObject.$form);
            this.updateSession(search)
            //if (this.placeId()) this.placeId(0);
            //else
            if (this.countryCode() != 'any') this.countryCode('any');
            else if (this.continentCode() != 'any') this.continentCode('any');
            this._receivePlaces('continents');
            var search = this.serializeObject(this.parentObject.$form);
            search.continentCode = '';
            search.continentName = '';
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
            //this.placeId(0);
        }

        countrySelected(): void {
            //this.placeId(0);
        }

        //#endregion
        //#region Sammy Routing

        //sammy: Sammy.Application;
        //routeFormat: string = '#/{0}/continent/{6}/country/{1}/place/{2}/zoom/{3}/latitude/{4}/longitude/{5}/'
        //    .format(this.settings.route).replace('{6}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        //private _runSammy(): void {
        //    // this will run once during construction
        //    var viewModel = this;

        //    // sammy will run the first route that it matches
        //    var beforeRegex = new RegExp('\\{0}'.format(
        //        this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)')
        //            .replace(/\//g, '\\/')));
        //    this.sammy.before(
        //        beforeRegex,
        //        function (): boolean {
        //            var e: Sammy.EventContext = this;
        //            return viewModel._onBeforeRoute(e);
        //        })

        //    // do this when we already have hashtag parameters in the page
        //    this.sammy.get(
        //        this.routeFormat.format(':continent', ':country', ':place', ':zoom', ':lat', ':lng'),
        //        function (): void {
        //            var e: Sammy.EventContext = this;
        //            viewModel._onRoute(e);
        //        });

        //    // activate the page route (create default hashtag parameters)
        //    this.sammy.get(
        //        this.settings.activationRoute || this.sammy.getLocation(),
        //        function (): void {
        //            viewModel.setLocation();
        //        });

        //    if (!this.settings.sammy && !this.sammy.isRunning())
        //        this.sammy.run();
        //}

        private _onBeforeRoute(e: Sammy.EventContext): boolean {
            // prevent the route from changing lat or lng by insignificant digits
            var newLat: string = e.params['lat'];
            var newLng: string = e.params['lng'];
            //var oldLat = this.lat();
            //var oldLng = this.lng();
            var allowRoute = true;

            //if (this._scopeHistory().length > 1 &&
            //    parseInt(e.params['zoom']) == this.zoom() &&
            //    this._areFloatsEqualEnough(parseFloat(newLat), oldLat) &&
            //    this._areFloatsEqualEnough(parseFloat(newLng), oldLng)) {
            //    return false;
            //}

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

        //private _onRoute(e: Sammy.EventContext): void {
        //    var continent: string = e.params['continent'];
        //    var country: string = e.params['country'];
        //    var placeId: string = e.params['place'];
        //    var zoom: string = e.params['zoom'];
        //    var lat: string = e.params['lat'];
        //    var lng: string = e.params['lng'];

        //    this.continentCode(continent);
        //    this.countryCode(country);
        //    //this.placeId(parseInt(placeId));
        //    //this.zoom(parseInt(zoom));
        //    //this.lat(parseFloat(lat));
        //    //this.lng(parseFloat(lng));
        //    this.activate();
        //}

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

        //private _route: KnockoutComputed<string> = ko.computed((): string => {
        //    // this will run once during construction
        //    return this._computeRoute();
        //});

        //private _computeRoute(): string {
        //    // build what the route should be, based on current filter inputs
        //    var continentCode = this.continentCode();
        //    var countryCode = this.countryCode();
        //    var placeId = this.placeId();
        //    var zoom = this.zoom();
        //    var lat = this.lat();
        //    var lng = this.lng();
        //    var route = this.routeFormat.format(continentCode, countryCode, placeId, zoom, lat, lng);
        //    return route;
        //}

        //setLocation(): void {
        //    // only set the href hashtag to trigger sammy when the current route is stale
        //    var route = this._route();
        //    if (this.sammy.getLocation().indexOf(route) < 0) {
        //        this.sammy.setLocation(route);
        //    }
        //}

        //#endregion
        //#region Query Scoping

        private _scopeHistory = ko.observableArray<SearchMapScope>();
        //private _currentScope = ko.computed((): SearchMapScope => {
        //    // this will run once during construction
        //    return this._computeCurrentScope();
        //});

        //private _computeCurrentScope(): SearchMapScope {
        //    var scope: SearchMapScope = {
        //        continentCode: this.continentCode(),
        //        countryCode: this.countryCode(),
        //        //placeId: this.placeId(),
        //    };
        //    return scope;
        //}

        //private _scopeDirty = ko.computed((): void => {
        //    this._onScopeDirty();
        //}).extend({ throttle: 1 });

        //private _onScopeDirty(): void {
        //    if (!this._isActivated()) return;

        //    var scopeHistory = this._scopeHistory();
        //    var lastScope: SearchMapScope = scopeHistory.length
        //        ? Enumerable.From(scopeHistory).Last() : null;
        //    var thisScope = this._currentScope();

        //    if (!lastScope || lastScope.countryCode != thisScope.countryCode ||
        //        lastScope.continentCode != thisScope.continentCode ||
        //        lastScope.placeId != thisScope.placeId) {
        //        this._scopeHistory.push(thisScope);
        //        $.when(this._map.ready()).then((): void => {
        //            this._map.triggerResize();
        //            this._load();
        //        });
        //    }
        //}

        //#endregion
        //#region Query Viewporting

        private _viewportHistory: KnockoutObservableArray<App.GoogleMaps.MapViewportSettings> = ko.observableArray();
        private _currentViewport = ko.computed((): App.GoogleMaps.MapViewportSettings => {
            // this will run once during construction
            return this._computeCurrentViewport();
        });

        private _computeCurrentViewport(): App.GoogleMaps.MapViewportSettings {
            var viewport: App.GoogleMaps.MapViewportSettings = {
                //zoom: this.zoom(),
                //center: new google.maps.LatLng(this.lat(), this.lng()),
            };
            return viewport;
        }

        private _viewportDirty = ko.computed((): void => {
            this._onViewportDirty();
        }).extend({ throttle: 1 });

        private _onViewportDirty(): void {
            //var zoom = this.zoom();
            //var lat = this.lat();
            //var lng = this.lng();
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
            //this.spinner.start();
            //if (!this.placeId()) {
                //var placeType = '';
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                if (continentCode != 'any' && continentCode != 'WATER') {
                    placeType = 'countries';
                } else if (continentCode == 'WATER'){
                    placeType = 'waters';
                }
            //else if (countryCode == 'any') { // continentCode != 'any', but can be none or Antarctic
            //    placeType = 'countries';
            //}
            this.placeType(placeType);
                var placesReceived = this._requestPlaces(placeType);
                this._requestPlaces('continents');
                this._requestPlaces('countries');
                this._requestPlaces('');
                this._receivePlaces(placeType);
                //$.when(placesReceived).done((): void => {
                //    this._receivePlaces(placeType);
                //    setTimeout((): void => { // pre-load the other data sets
                //        this._requestPlaces('continents');
                //        this._requestPlaces('countries');
                //        this._requestPlaces('');
                //    }, 0);
                //})
                //    .always((): void => {
                //        this.spinner.stop();
                //    });
            //}
            //else {
            //    //var partnersReceived = this._requestPartners();
            //    //$.when(partnersReceived).done((): void => {
            //    //    this._receivePartners();
            //    //})
            //    //    .always((): void => {
            //    //        this.spinner.stop();
            //    //    });
            //}
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

            //else if ((placeType == 'continents' && !this._continentsResponse) ||
            //    (placeType == 'countries' && !this._countriesResponse) ||
            //    (!placeType && !this._placesResponse)) {

            //    //$.get(this.settings.partnerPlacesApi.format(placeType))
            //    //    .done((response: ApiModels.PlaceWithActivities[]): void => {
            //    //        if (placeType == 'continents') {
            //    //            this._continentsResponse = ko.observableArray(response);
            //    //        }
            //    //        else if (placeType == 'countries') {
            //    //            this._countriesResponse = ko.observableArray(response);
            //    //        }
            //    //        else {
            //    //            this._placesResponse = ko.observableArray(response);
            //    //        }
            //    //        deferred.resolve();
            //    //    })
            //    //    .fail((xhr: JQueryXHR): void => {
            //    //        App.Failures.message(xhr, 'while trying to load agreement map data', true)
            //    //            deferred.reject();
            //    //    });
            //}
            else {
                deferred.resolve();
            }

            return deferred;
        }

        private _receivePlaces(placeType: string): void {
            var places;
            if (placeType == 'countries') {
                places = this._countriesResponse();
            } else if (placeType == 'waters') {
                places = this._watersResponse();
            } else {
                places = this._continentsResponse();
            }
            //var places = placeType == 'continents'
            //    ? this._continentsResponse()
            //    : this._countriesResponse();
                //: placeType == 'countries'
                //? this._countriesResponse()
                //: this._placesResponse();
            //var places = this.output;

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
                //this.loadViewport++;
            }

            //if (!placeType) {
            //    var countryCode = this.countryCode();
            //    places = Enumerable.From(places)
            //        .Where(function (x: ApiModels.PlaceWithActivities): boolean {
            //            return countryCode == 'none'
            //                ? !x.countryId
            //                : x.countryCode == countryCode;
            //        })
            //        .ToArray();
            //}

            //this._updateStatus(placeType, places);
            this._plotMarkers(placeType, places);
            //this._map.setViewport()
            var viewportSettings = this._getMapViewportSettings(placeType, places);
            //if (this.loadViewport > 0) {
                this._map.setViewport(viewportSettings).then((): void => {
                    //this._updateRoute();
                });
            
            //}
        }

        private _plotMarkers(placeType: string, places: ApiModels.PlaceWithActivities[]) {
            var scaler;
            if (placeType == 'countries'){
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
            //if (!placeType && !places.length && countryCode != 'none') {
            //    var country: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
            //        .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
            //            return x.code == countryCode;
            //        });
            //    if (country) {
            //        places = [{
            //            id: country.id,
            //            count: 0,
            //            name: country.name,
            //            center: country.center,
            //            boundingBox: country.box,
            //            isCountry: true,
            //            countryCode: country.code,
            //            continentCode: country.continentCode,
            //        }];
            //    }
            //}
            var markers: google.maps.Marker[] = [];
            $.each(places, (i: number, place: ApiModels.PlaceWithActivities): void => {
                if (placeType == 'continents' && !place.count) return; // do not render zero on continent
                var title = '{0} - {1} activit{2}\r\nClick for more information'
                    .format(place.name, place.count, place.count == 1 ? 'y' : 'ies');
                if (!placeType)
                    title = '{0} activit{1}\r\nClick for more information'
                        .format(place.count, place.count == 1 ? 'y' : 'ies');
                var options: google.maps.MarkerOptions = {
                    position: Places.Utils.convertToLatLng(place.center),
                    title: title,
                    clickable: place.count > 0,
                    cursor: 'pointer',
                };
                this._setMarkerIcon(options, place.count.toString(), scaler);
                var marker = new google.maps.Marker(options);
                markers.push(marker);

                // display partner name in title when only 1 agreement
                //if (place.count == 1) {
                //    marker.set('ucosmic_agreement_id', place.agreementIds[0]);
                //}

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
                        if (place.code == 'WATER') {
                            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
                            this.continentCode(place.code);
                            this.countryCode('any');
                            this.continentName(place.name);
                            sessionStorage.setItem('continentName', this.continentName());
                            this.loadViewport++;
                            this._receivePlaces('waters');
                            this.placeType('waters');
                            this.parentObject.$placeFilter.val('waters')
                            var search = this.serializeObject(this.parentObject.$form);
                            this.updateSession(search);
                            
                        }
                        else if (place.code) {
                            sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
                            this.continentCode(place.code);
                            this.countryCode('any');
                            this.continentName(place.name);
                            sessionStorage.setItem('continentName', this.continentName());
                            //this.placeId(0);
                            this.loadViewport++;
                            this._receivePlaces('countries');
                            this.placeType('countries');
                            this.parentObject.$placeFilter.val('countries')
                            var search = this.serializeObject(this.parentObject.$form);
                            this.updateSession(search);
                        } 
                    });
                }
                else{
                    google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
                        //take to advanced search table
                        if (place.id != 0) {
                            var search = this.serializeObject(this.parentObject.$form);
                            if (search.placeNames && search.placeNames.length > 0) {
                                search.placeNames += " & " + place.name;
                                search.placeIds += " " + place.id;
                            } else {
                                search.placeNames = place.name;
                                search.placeIds = place.id;
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

            // update titles of markers with count == 1
            //var singleMarkers = Enumerable.From(markers)
            //    .Where(function (x: google.maps.Marker): boolean {
            //        var agreementId = x.get('ucosmic_agreement_id');
            //        return !isNaN(agreementId) && agreementId > 0;
            //    })
            //    .ToArray();
            //if (singleMarkers.length) {
            //    var agreementIds = Enumerable.From(singleMarkers)
            //        .Select(function (x: google.maps.Marker): number {
            //            return parseInt(x.get('ucosmic_agreement_id'));
            //        }).ToArray();
            //    // TODO: this is not dry
            //    $.get(this.settings.partnersApi, { agreementIds: agreementIds, })
            //        .done((response: ApiModels.Participant[]): void => {
            //            $.each(singleMarkers, (i: number, singleMarker: google.maps.Marker): void => {
            //                var agreementId = parseInt(singleMarker.get('ucosmic_agreement_id'));
            //                // agreement can have many partners
            //                var partners: ApiModels.Participant[] = Enumerable.From(response)
            //                    .Where(function (x: ApiModels.Participant): boolean {
            //                        return x.agreementId == agreementId;
            //                    }).ToArray();
            //                if (!partners.length) return;
            //                if (!this.placeId()) {
            //                    var title = singleMarker.getTitle().replace('\r\nClick for more information', '');
            //                    $.each(partners, (i: number, partner: ApiModels.Participant): void => {
            //                        title += '\r\n{0}'.format(partner.establishmentTranslatedName);
            //                    });
            //                    singleMarker.setTitle(title);
            //                }
            //            });
            //        })
            //}
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

        //private _updateRoute(): void {
        //    var isDirty = false;
        //    if (!this._areFloatsEqualEnough(this.lat(), this._map.lat())) {
        //        this.lat(this._map.lat());
        //        isDirty = true;
        //    }
        //    if (!this._areFloatsEqualEnough(this.lng(), this._map.lng())) {
        //        this.lng(this._map.lng());
        //        isDirty = true;
        //    }
        //    if (this.zoom() != this._map.zoom()) {
        //        this.zoom(this._map.zoom());
        //        isDirty = true;
        //    }
        //    isDirty = isDirty || (this.settings.activationRoute
        //    && this.sammy.getLocation().indexOf(this.settings.activationRoute) < 0);
        //    if (isDirty) {
        //        this.setLocation();
        //    }
        //    this.loadViewport--;
        //    if (this.loadViewport < 0) this.loadViewport = 0;
        //}

        //private _updateStatus(placeType: string, places: ApiModels.PlaceWithActivities[]) {
        //    if (places && places.length) {
        //        this.status.count(Enumerable.From(places)
        //            .SelectMany(function (x: ApiModels.PlaceWithActivities, i: number): number[] {
        //                return x.agreementIds;
        //            })
        //            .Distinct(function (x: number): number {
        //                return x;
        //            })
        //            .Count().toString());
        //        this.status.partnerCount(Enumerable.From(places)
        //            .SelectMany(function (x: ApiModels.PlaceWithActivities, i: number): number[] {
        //                return x.partnerIds;
        //            })
        //            .Distinct(function (x: number): number {
        //                return x;
        //            })
        //            .Count().toString());
        //    }
        //    else {
        //        this.status.count('0');
        //        this.status.partnerCount('0');
        //    }
        //    if (placeType == 'countries') {
        //        var continentCode = this.continentCode();
        //        if (continentCode == 'none') {
        //            this.status.countryCount('unknown continent');
        //        }
        //        else {
        //            var continent = Enumerable.From(this.continentOptions())
        //                .SingleOrDefault(undefined, function (x: any): boolean {
        //                    return x.code == continentCode;
        //                });
        //            if (continent && continent.name) {
        //                this.status.countryCount(continent.name);
        //            }
        //        }
        //    }
        //    else if (!placeType) {
        //        var countryCode = this.countryCode();
        //        if (countryCode == 'none') {
        //            this.status.countryCount('unknown country');
        //        }
        //        else {
        //            var country: Places.ApiModels.Country = Enumerable.From(this.countryOptions())
        //                .SingleOrDefault(undefined, function (x: Places.ApiModels.Country): boolean {
        //                    return x.code == countryCode;
        //                });
        //            if (country && country.name) {
        //                this.status.countryCount(country.name);
        //            }
        //        }
        //    }
        //}

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

        //private _requestPartners(): JQueryDeferred<void> {
        //    var deferred: JQueryDeferred<ApiModels.PlaceWithActivities> = $.Deferred();

        //    // need to make sure we have places before we can get partners
        //    if (!this._placesResponse) {
        //        var placesReceived = this._requestPlaces('');
        //        $.when(placesReceived).then((): void => {
        //            this._requestPartners().done((): void => {
        //                deferred.resolve();
        //            });
        //        });
        //    }
        //    else {
        //        // need to request the agreementIds for the current place
        //        var placeId = this.placeId();
        //        var place: ApiModels.PlaceWithActivities = Enumerable.From(this._placesResponse())
        //            .SingleOrDefault(undefined, function (x: ApiModels.PlaceWithActivities): boolean {
        //                return x.id == placeId;
        //            });
        //        if (!place || !place.count) {
        //            this.status.count('0');
        //            this.status.partnerCount('0');
        //            this.status.countryCount('this area');
        //            deferred.reject();
        //            this.spinner.stop();
        //            //alert('There are no agreements for place #{0}.'.format(placeId));
        //        }
        //        else {
        //            // load the partners
        //            $.get(this.settings.partnersApi, { agreementIds: place.agreementIds, })
        //                .done((response: ApiModels.Participant[]): void => {
        //                    this._partnersResponse = ko.observableArray(response);
        //                    deferred.resolve();
        //                })
        //                .fail((xhr: JQueryXHR): void => {
        //                    App.Failures.message(xhr, 'while trying to load agreement partner data', true)
        //                    deferred.reject();
        //                });
        //        }
        //    }

        //    return deferred;
        //}

        //private _receivePartners(): void {

        //    var allPartners = this._partnersResponse();

        //    // how many different partners are there?
        //    var uniquePartners: ApiModels.Participant[] = Enumerable.From(allPartners)
        //        .Distinct(function (x: ApiModels.Participant): number {
        //            return x.establishmentId;
        //        })
        //        .ToArray();

        //    // set map viewport
        //    var viewportSettings: App.GoogleMaps.MapViewportSettings = {
        //        bounds: new google.maps.LatLngBounds(),
        //    };
        //    if (uniquePartners.length == 1) {
        //        // try zoom first
        //        var partner = uniquePartners[0];
        //        viewportSettings.center = Places.Utils.convertToLatLng(partner.center);
        //        if (partner.googleMapZoomLevel) {
        //            viewportSettings.zoom = partner.googleMapZoomLevel;
        //        }
        //        else if (partner.boundingBox && partner.boundingBox.hasValue) {
        //            viewportSettings.bounds = Places.Utils.convertToLatLngBounds(partner.boundingBox);
        //        }
        //    }
        //    else if (uniquePartners.length > 1) {
        //        $.each(uniquePartners, (i: number, partner: ApiModels.Participant): void => {
        //            viewportSettings.bounds.extend(Places.Utils.convertToLatLng(partner.center));
        //        });
        //    }
        //    else {
        //        alert('Found no agreement partners for place #{0}.'.format(this.placeId()));
        //    }

        //    // plot the markers
        //    var markers: google.maps.Marker[] = [];
        //    var scaler = this._getMarkerIconScaler('', this._placesResponse());
        //    $.each(uniquePartners, (i: number, partner: ApiModels.Participant): void => {
        //        // how many agreements for this partner?
        //        var agreements: ApiModels.Participant[] = Enumerable.From(allPartners)
        //            .Where(function (x: ApiModels.Participant): boolean {
        //                return x.establishmentId == partner.establishmentId;
        //            })
        //            .Distinct(function (x: ApiModels.Participant): number {
        //                return x.agreementId;
        //            }).ToArray();

        //        var options: google.maps.MarkerOptions = {
        //            position: Places.Utils.convertToLatLng(partner.center),
        //            title: '{0} - {1} agreement{2}'
        //                .format(partner.establishmentTranslatedName, agreements.length, agreements.length == 1 ? '' : 's'),
        //            clickable: true,
        //            cursor: 'pointer',
        //        };
        //        this._setMarkerIcon(options, agreements.length.toString(), scaler);
        //        var marker = new google.maps.Marker(options);
        //        markers.push(marker);
        //        google.maps.event.addListener(marker, 'click', (e: google.maps.MouseEvent): void => {
        //            if (agreements.length == 1) {
        //                var url = this.settings.detailUrl.format(partner.agreementId);
        //                var detailPreference = this.detailPreference();
        //                if (detailPreference == '_blank') {
        //                    window.open(url, detailPreference);
        //                }
        //                else {
        //                    location.href = url;
        //                }
        //            }
        //            else {
        //                this.infoWindowContent.partner(partner);
        //                this.infoWindowContent.agreements(Enumerable.From(agreements)
        //                    .OrderByDescending(function (x: ApiModels.Participant): string {
        //                        return x.agreementStartsOn;
        //                    })
        //                    .ToArray());
        //                var content = this.$infoWindow.html();
        //                var options: google.maps.InfoWindowOptions = {
        //                    content: $.trim(content),
        //                };
        //                this._map.clearInfoWindows();
        //                this._map.openInfoWindowAtMarker(options, marker);
        //            }
        //        });
        //    });

        //    this._map.replaceMarkers(markers);

        //    if (markers.length == 1) {
        //        google.maps.event.trigger(markers[0], 'click');
        //    }


        //    // update the status
        //    this.status.count(Enumerable.From(allPartners)
        //        .Distinct(function (x: ApiModels.Participant): number {
        //            return x.agreementId;
        //        }).Count().toString());
        //    this.status.partnerCount(uniquePartners.length.toString());
        //    this.status.countryCount('this area');

        //    if (this._scopeHistory().length + this.loadViewport > 1) {
        //        this._map.setViewport(viewportSettings).then((): void => {
        //            this._updateRoute();
        //        });
        //    }
        //}

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