//interface EventTarget {
//    result: any;
//}
var Activities;
(function (Activities) {
    var ViewModels;
    (function (ViewModels) {
        var SearchMap = (function () {
            function SearchMap(output, parentObject) {
                //this._ConstructMapData(output, parentObject);
                var _this = this;
                this.continentCode = ko.observable(sessionStorage.getItem(SearchMap.ContinentSessionKey) || 'any');
                this.countryCode = ko.observable(sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
                this.continentName = ko.observable(sessionStorage.getItem('continentName') || '');
                this.regionCount = ko.observable('');
                this.activityCount = ko.observable('?');
                this.peopleCount = ko.observable('?');
                this.locationCount = ko.observable('?');
                this.dataDefered = $.Deferred();
                this.placeFilter = ko.observable();
                this._map = new App.GoogleMaps.Map('google_map_canvas', {
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                    },
                }, {
                    maxPrecision: 8,
                });
                this.placeType = ko.observable("");
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
                this._viewportHistory = ko.observableArray();
                this._currentViewport = ko.computed(function () {
                    return _this._computeCurrentViewport();
                });
                this._viewportDirty = ko.computed(function () {
                    _this._onViewportDirty();
                }).extend({ throttle: 1 });
                this.spinner = new App.Spinner({ delay: 400, });
                this.infoWindowContent = {
                    partner: ko.observable({}),
                    agreements: ko.observableArray([]),
                };
                this.createIndexDb = function () {
                    var idbSupported = false;
                    var db;
                    if ("indexedDB" in window) {
                        idbSupported = true;
                    }
                    var openRequest = indexedDB.open("test", 1);
                    openRequest.onupgradeneeded = function (e) {
                        console.log("running onupgradeneeded");
                    };
                    openRequest.onsuccess = function (e) {
                        console.log("Success!");
                    };
                    openRequest.onerror = function (e) {
                        console.log("Error");
                    };
                    var transaction = db.transaction(["mapData"], "readwrite");
                    var store = transaction.objectStore("mapData");
                    var mapData = {
                        test: "asdf",
                        id: 1
                    };
                    var request = store.add(mapData, 1);
                };
                this.parentObject = parentObject;
                this.parentObject.tableUrl(location.href.replace('map', 'table'));
                this.ancestorId = output.input.ancestorId ? output.input.ancestorId : "null";
                if (!output.input.activityTypeIds) {
                    output.input.activityTypeIds = [];
                    $.each(output.activityTypes, function (i, type) {
                        output.input.activityTypeIds.push(type.activityTypeId);
                    });
                }
                this._ConstructMapData(output.input);
            }
            SearchMap.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
            };
            SearchMap.prototype.replaceAll = function (find, replace, str) {
                return str.replace(new RegExp(find, 'g'), replace);
            };
            SearchMap.prototype.updateSearch = function (search) {
                var searchOptions = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));
                if (searchOptions) {
                    search.pageNumber = searchOptions.pageNumber;
                    search.orderBy = searchOptions.orderBy;
                    search.pageSize = searchOptions.pageSize;
                }
                search.continentCode = this.continentCode();
                search.continentName = this.continentName();
                return search;
            };
            SearchMap.prototype.createTableUrl = function (search) {
                if (!this.parentObject.tableUrl() || this.parentObject.tableUrl().indexOf('?') == 0) {
                    this.parentObject.tableUrl(location.href.replace('map', 'table') + '?');
                }
                var tempUrl = this.parentObject.tableUrl();
                tempUrl = tempUrl.substr(0, tempUrl.indexOf("?"));
                tempUrl += "?" + $.param(search);
                tempUrl = this.replaceAll('%5B%5D', '', tempUrl);
                return tempUrl;
            };
            SearchMap.prototype.updateSession = function (search) {
                if (this.countryCode() == undefined)
                    this.countryCode('any');
                if (this.continentCode() == undefined)
                    this.continentCode('any');
                sessionStorage.setItem(SearchMap.ContinentSessionKey, this.continentCode());
                sessionStorage.setItem(SearchMap.CountrySessionKey, this.countryCode());
                search = this.updateSearch(search);
                sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(search));
                var tempUrl = this.createTableUrl(search);
                this.parentObject.tableUrl(tempUrl);
            };
            SearchMap.prototype._removeContinents = function (placeNames, continent) {
                var index = placeNames.indexOf(continent);
                if (index > -1) {
                    placeNames.splice(index, 1);
                }
            };
            SearchMap.prototype._ConstructMapData = function (input) {
                var _this = this;
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
                var dataDeferred = $.Deferred();
                var placeFilter = input.placeFilter;
                if ((input.placeNames || input.keyword) && this.continentCode().toLowerCase() != 'water') {
                    placeFilter = 'countries';
                    input.placeFilter = placeFilter;
                }
                else if (this.continentCode().toLowerCase() == 'water') {
                    placeFilter = 'waters';
                    input.placeFilter = placeFilter;
                }
                else if (!placeFilter && this.continentCode() != 'any' && this.continentCode() != 'WATER') {
                    placeFilter = 'countries';
                    input.placeFilter = placeFilter;
                }
                else {
                    placeFilter = 'continents';
                    input.placeFilter = placeFilter;
                }
                this.placeFilter(placeFilter);
                if (placeFilter == 'continents') {
                    this._getContinentData(input, continentsData, dataDeferred);
                    $.when(dataDeferred).then(function () {
                        dataDeferred = $.Deferred();
                        _this._getCountriesData(input, countriesData, dataDeferred);
                        $.when(dataDeferred).then(function () {
                            dataDeferred = $.Deferred();
                            _this._getWatersData(input, watersData, dataDeferred);
                            $.when(dataDeferred).then(function () {
                                _this.dataDefered.resolve();
                            });
                        });
                    });
                }
                else if (placeFilter == 'countries') {
                    this._getContinentData(input, continentsData, dataDeferred);
                    this._getCountriesData(input, countriesData, dataDeferred);
                    $.when(dataDeferred).then(function () {
                        dataDeferred = $.Deferred();
                        _this._getContinentData(input, continentsData, dataDeferred);
                        $.when(dataDeferred).then(function () {
                            dataDeferred = $.Deferred();
                            _this._getWatersData(input, watersData, dataDeferred);
                            $.when(dataDeferred).then(function () {
                                _this.dataDefered.resolve();
                            });
                        });
                    });
                }
                else {
                    this._getContinentData(input, continentsData, dataDeferred);
                    this._getWatersData(input, watersData, dataDeferred);
                    $.when(dataDeferred).then(function () {
                        dataDeferred = $.Deferred();
                        _this._getContinentData(input, continentsData, dataDeferred);
                        $.when(dataDeferred).then(function () {
                            dataDeferred = $.Deferred();
                            _this._getCountriesData(input, countriesData, dataDeferred);
                            $.when(dataDeferred).then(function () {
                                _this.dataDefered.resolve();
                            });
                        });
                    });
                }
            };
            SearchMap.prototype._deleteInputProperties = function (input) {
                delete input.pageSize;
                delete input.placeFilter;
                delete input.pageNumber;
                delete input.orderBy;
                return input;
            };
            SearchMap.prototype._getContinentData = function (input, data, dataDeferred) {
                var _this = this;
                var placeFilter = input.placeFilter;
                if (data) {
                    dataDeferred.resolve();
                    this._continentsResponse = ko.observableArray(JSON.parse(data));
                    if (placeFilter == 'continents') {
                        this._map.ready().done(function () {
                            _this._load(placeFilter);
                        });
                    }
                }
                else {
                    var settings = settings || {};
                    input.continentCode = 'any';
                    var url = '/api/usf.edu/employees/continents/?' + $.param(input);
                    settings.url = url;
                    $.ajax(settings)
                        .done(function (response) {
                        _this._continentsResponse = ko.observableArray(response);
                        dataDeferred.resolve();
                        if (placeFilter == 'continents') {
                            _this._map.ready().done(function () {
                                _this._load(placeFilter);
                                input = _this._deleteInputProperties(input);
                                sessionStorage.setItem(JSON.stringify(input) + 'continents', JSON.stringify(response));
                            });
                        }
                        else {
                            input = _this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'continents', JSON.stringify(response));
                        }
                    })
                        .fail(function (xhr) {
                    })
                        .always(function () {
                        dataDeferred.resolve();
                    });
                }
            };
            SearchMap.prototype._getCountriesData = function (input, data, dataDeferred) {
                var _this = this;
                if (data) {
                    dataDeferred.resolve();
                    this._countriesResponse = ko.observableArray(JSON.parse(data));
                    if (input.placeFilter == 'countries') {
                        this._map.ready().done(function () {
                            _this._load(input.placeFilter);
                        });
                    }
                }
                else {
                    var settings = settings || {};
                    if (!input.continentCode) {
                        input.continentCode = 'any';
                    }
                    var url = '/api/usf.edu/employees/countries/?' + $.param(input);
                    settings.url = url;
                    var placeFilter = input.placeFilter;
                    $.ajax(settings)
                        .done(function (response) {
                        dataDeferred.resolve();
                        _this._countriesResponse = ko.observableArray(response);
                        if (placeFilter == 'countries') {
                            _this._map.ready().done(function () {
                                _this._load(placeFilter);
                                input = _this._deleteInputProperties(input);
                                sessionStorage.setItem(JSON.stringify(input) + 'countries', JSON.stringify(response));
                            });
                        }
                        else {
                            input = _this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'countries', JSON.stringify(response));
                        }
                    })
                        .fail(function (xhr) {
                    })
                        .always(function () {
                        dataDeferred.resolve();
                    });
                }
            };
            SearchMap.prototype._getWatersData = function (input, data, dataDeferred) {
                var _this = this;
                if (data) {
                    dataDeferred.resolve();
                    this._watersResponse = ko.observableArray(JSON.parse(data));
                    if (input.placeFilter == 'waters') {
                        this._map.ready().done(function () {
                            _this._load(input.placeFilter);
                        });
                    }
                }
                else {
                    var settings = settings || {};
                    if (!input.continentCode) {
                        input.continentCode = 'any';
                    }
                    var url = '/api/usf.edu/employees/waters/?' + $.param(input);
                    settings.url = url;
                    var placeFilter = input.placeFilter;
                    $.ajax(settings)
                        .done(function (response) {
                        dataDeferred.resolve();
                        _this._watersResponse = ko.observableArray(response);
                        if (placeFilter == 'waters') {
                            _this._map.ready().done(function () {
                                _this._load(placeFilter);
                                input = _this._deleteInputProperties(input);
                                sessionStorage.setItem(JSON.stringify(input) + 'waters', JSON.stringify(response));
                            });
                        }
                        else {
                            input = _this._deleteInputProperties(input);
                            sessionStorage.setItem(JSON.stringify(input) + 'waters', JSON.stringify(response));
                        }
                    })
                        .fail(function (xhr) {
                    })
                        .always(function () {
                        dataDeferred.resolve();
                    });
                }
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
                    }
                    else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            };
            SearchMap.prototype.reloadData = function (form, reloadPage) {
                var input = this.serializeObject($('form'));
                this.updateSession(input);
                if (reloadPage) {
                    var search = input;
                    var url = location.href.split('?')[0] + '?ancestorId=' + search.ancestorid + '&keyword=' + search.keyword;
                    location.href = url;
                    return;
                }
                if (this.parentObject.loadingSpinner.isVisible())
                    return;
                var stringActivityMapData;
                var activityMapData;
                var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
                if (stringActivityMapDataSearch == this.ancestorId + input.keyword) {
                    stringActivityMapData = sessionStorage.getItem('activityMapData');
                    activityMapData = $.parseJSON(stringActivityMapData);
                }
                this._ConstructMapData();
            };
            SearchMap.prototype.clearFilter = function () {
                this.continentCode('any');
                this.continentName('');
                this.parentObject.placeNames("");
                var placeFilter = 'continents';
                if ((this.parentObject.placeNames() || this.parentObject.keyword())) {
                    placeFilter = 'countries';
                }
                this.placeFilter(placeFilter);
                this._receivePlaces(placeFilter);
                this.parentObject.$placeFilter.val(placeFilter);
                var search = this.serializeObject(this.parentObject.$form);
                search.continentCode = 'any';
                delete search.continentName;
                this.updateSession(search);
            };
            SearchMap.prototype._computeCountryOptions = function () {
                var options = [{
                        code: this.countryCode(),
                        name: '[Loading...]',
                    }];
                var countries = this.countries();
                if (countries && countries.length) {
                    var anyCountry = {
                        code: 'any',
                        name: '[All countries]',
                    };
                    var noCountry = {
                        code: 'none',
                        name: '[Without country]',
                    };
                    options = countries.slice(0);
                    var continentCode = this.continentCode();
                    if (continentCode != 'any' && continentCode != 'none') {
                        options = Enumerable.From(options)
                            .Where(function (x) {
                            return x.continentCode == continentCode;
                        }).ToArray();
                    }
                    options = Enumerable.From([anyCountry])
                        .Concat(options)
                        .Concat([noCountry]).ToArray();
                }
                return options;
            };
            SearchMap.prototype._computeContinentOptions = function () {
                var options = [{
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
                        .Select(function (x) {
                        return {
                            code: x.continentCode,
                            name: x.continentName
                        };
                    })
                        .Distinct(function (x) {
                        return x.code;
                    })
                        .OrderBy(function (x) {
                        return x.name;
                    })
                        .ToArray();
                    options = Enumerable.From([anyContinent])
                        .Concat(options)
                        .Concat([noContinent]).ToArray();
                }
                return options;
            };
            SearchMap.prototype._loadCountryOptions = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get())
                    .done(function (response) {
                    _this.countries(response);
                    deferred.resolve();
                });
                return deferred;
            };
            SearchMap.prototype.continentSelected = function () {
                this.countryCode('any');
            };
            SearchMap.prototype.countrySelected = function () {
            };
            SearchMap.prototype._onBeforeRoute = function (e) {
                var newLat = e.params['lat'];
                var newLng = e.params['lng'];
                var allowRoute = true;
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
            SearchMap.prototype._computeCurrentViewport = function () {
                var viewport = {};
                return viewport;
            };
            SearchMap.prototype._onViewportDirty = function () {
                var _this = this;
                if (!this._isActivated() || this.loadViewport)
                    return;
                var viewportHistory = this._viewportHistory();
                var lastViewport = viewportHistory.length
                    ? Enumerable.From(viewportHistory).Last() : null;
                var thisViewport = this._currentViewport();
                if (!lastViewport || lastViewport.zoom != thisViewport.zoom ||
                    !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lat(), thisViewport.center.lat()) ||
                    !SearchMap._areCoordinatesEqualEnough(lastViewport.center.lng(), thisViewport.center.lng())) {
                    this._viewportHistory.push(thisViewport);
                    $.when(this._map.ready()).then(function () {
                        _this._map.setViewport(thisViewport).then(function () {
                        });
                    });
                }
            };
            SearchMap.prototype._load = function (placeType) {
                var continentCode = this.continentCode();
                var countryCode = this.countryCode();
                if (continentCode != 'any' && continentCode != 'WATER') {
                    placeType = 'countries';
                }
                else if (continentCode == 'WATER') {
                    placeType = 'waters';
                }
                this.placeType(placeType);
                this._receivePlaces(placeType);
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
                }
                else {
                    deferred.resolve();
                }
                return deferred;
            };
            SearchMap.prototype._receivePlaces = function (placeType) {
                var _this = this;
                var places;
                if (placeType == 'countries') {
                    if (this._countriesResponse()) {
                        this.parentObject.loadingSpinner.start;
                        places = this._countriesResponse();
                    }
                    else {
                        this.parentObject.loadingSpinner.start();
                        setTimeout(function () { _this._receivePlaces(placeType); }, 50);
                        return;
                    }
                }
                else if (placeType == 'waters') {
                    if (this._watersResponse()) {
                        this.parentObject.loadingSpinner.start;
                        places = this._watersResponse();
                    }
                    else {
                        this.parentObject.loadingSpinner.start();
                        setTimeout(function () { _this._receivePlaces(placeType); }, 50);
                        return;
                    }
                }
                else {
                    if (this._continentsResponse()) {
                        this.parentObject.loadingSpinner.start;
                        places = this._continentsResponse();
                    }
                    else {
                        this.parentObject.loadingSpinner.start();
                        setTimeout(function () { _this._receivePlaces(placeType); }, 50);
                        return;
                    }
                }
                if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    if (this.continentCode() && this.continentCode() != 'any') {
                        places = Enumerable.From(places)
                            .Where(function (x) {
                            return continentCode == 'none'
                                ? !x.id
                                : x.code == continentCode;
                        })
                            .ToArray();
                    }
                }
                var count = 0;
                var peopleCount = 0;
                $.each(places, function (index, place) {
                    count += place.count;
                });
                if (placeType != 'countries' || this.continentCode() == 'any') {
                    var places2 = this._continentsResponse();
                    peopleCount = places2[0].peopleCountTotal;
                }
                else {
                    var places2 = this._continentsResponse();
                    var place = places2.filter(function (value, index, test) {
                        if (value.code == _this.continentCode()) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    peopleCount = place[0].peopleCount;
                }
                if (places.length > 0) {
                    this.activityCount(count.toString());
                    this.peopleCount(peopleCount.toString());
                    this.locationCount(places.length.toString());
                }
                else {
                    this.activityCount('0');
                    this.peopleCount('0');
                    this.locationCount('0');
                }
                this._plotMarkers(placeType, places);
                var viewportSettings = this._getMapViewportSettings(placeType, places);
                this._map.setViewport(viewportSettings).then(function () {
                });
            };
            SearchMap.prototype._plotMarkers = function (placeType, places) {
                var _this = this;
                var scaler;
                if (placeType == 'countries') {
                    scaler = this._getMarkerIconScaler(placeType, this._countriesResponse());
                }
                else if (placeType == 'waters') {
                    scaler = this._getMarkerIconScaler(placeType, this._watersResponse());
                }
                else {
                    scaler = this._getMarkerIconScaler(placeType, this._continentsResponse());
                }
                var continentCode = this.continentCode();
                if (placeType == 'countries' && !places.length && continentCode != 'none') {
                    var continent = Enumerable.From(this._continentsResponse())
                        .SingleOrDefault(undefined, function (x) {
                        return x.code == continentCode;
                    });
                    if (continent) {
                        places = [continent];
                    }
                }
                var countryCode = this.countryCode();
                var markers = [];
                $.each(places, function (i, place) {
                    if (placeType == 'continents' && !place.count)
                        return;
                    var title = '{0} - {1} activit{2}\r\nClick for more information'
                        .format(place.name, place.count, place.count == 1 ? 'y' : 'ies');
                    if (!placeType)
                        title = '{0} activit{1}\r\nClick for more information'
                            .format(place.count, place.count == 1 ? 'y' : 'ies');
                    var options = {
                        position: Places.Utils.convertToLatLng(place.center),
                        title: title,
                        clickable: place.count > 0,
                        cursor: 'pointer',
                    };
                    if (place.placeType == "region") {
                        _this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(248, 62, 52)');
                    }
                    else if (place.placeType == "water") {
                        _this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(47, 67, 253)');
                    }
                    else if (place.placeType == "country") {
                        _this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(29, 172, 13)');
                    }
                    else if (place.placeType == "global") {
                        _this._setMarkerIcon(options, place.count.toString(), scaler, 'rgb(237, 145, 5)');
                    }
                    else {
                        _this._setMarkerIcon(options, place.count.toString(), scaler);
                    }
                    var marker = new google.maps.Marker(options);
                    markers.push(marker);
                    google.maps.event.addListener(marker, 'mouseover', function (e) {
                        marker.setOptions({
                            zIndex: 201,
                        });
                    });
                    google.maps.event.addListener(marker, 'mouseout', function (e) {
                        var side = marker.getIcon().size.width;
                        setTimeout(function () {
                            marker.setOptions({
                                zIndex: 200 - side,
                            });
                        }, 400);
                    });
                    if (placeType === 'continents') {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.code == 'WATER') {
                                _this.parentObject.loadingSpinner.start();
                                sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                                _this.continentCode(place.code);
                                _this.countryCode('any');
                                _this.continentName(place.name);
                                sessionStorage.setItem('continentName', _this.continentName());
                                _this.loadViewport++;
                                _this._receivePlaces('waters');
                                _this.placeType('waters');
                                _this.parentObject.$placeFilter.val('waters');
                                _this.placeFilter('waters');
                                var search = _this.serializeObject(_this.parentObject.$form);
                                _this.updateSession(search);
                            }
                            else if (place.code) {
                                _this.parentObject.loadingSpinner.start();
                                sessionStorage.setItem(SearchMap.ContinentSessionKey, _this.continentCode());
                                _this.continentCode(place.code);
                                _this.countryCode('any');
                                _this.continentName(place.name);
                                sessionStorage.setItem('continentName', _this.continentName());
                                _this.loadViewport++;
                                _this._receivePlaces('countries');
                                _this.placeType('countries');
                                _this.parentObject.$placeFilter.val('countries');
                                _this.placeFilter('countries');
                                var search = _this.serializeObject(_this.parentObject.$form);
                                _this.updateSession(search);
                            }
                        });
                    }
                    else {
                        google.maps.event.addListener(marker, 'click', function (e) {
                            if (place.id != 0) {
                                $('#mapCover').addClass('mapCover');
                                $('#mapCoverLoading').addClass('mapCoverLoading');
                                _this.parentObject.loadingSpinner.start();
                                var search = _this.serializeObject(_this.parentObject.$form);
                                var hasChangedPlaces = false;
                                if (search.placeNames && search.placeNames.length > 0 && search.placeNames.indexOf(place.name) < 0) {
                                    search.placeNames += " & " + place.name;
                                    search.placeIds += " " + place.id;
                                    hasChangedPlaces = true;
                                }
                                else if (search.placeNames.indexOf(place.name) < 0) {
                                    search.placeNames = place.name;
                                    search.placeIds = place.id.toString();
                                    hasChangedPlaces = true;
                                }
                                if (hasChangedPlaces) {
                                    sessionStorage.setItem("isMapClick", "1");
                                }
                                search.placeIds = search.placeIds.split(" ");
                                _this.updateSession(search);
                                var url = _this.createTableUrl(search);
                                location.href = url;
                            }
                        });
                    }
                });
                this._map.replaceMarkers(markers);
                if (this.parentObject.affiliationsLoaded) {
                    this.parentObject.loadingSpinner.stop();
                }
            };
            SearchMap.prototype.fixBoundingBox = function (boundingBox) {
                if (!boundingBox.northEast) {
                    boundingBox.northEast = boundingBox.northeast;
                    boundingBox.southWest = boundingBox.southwest;
                }
                return boundingBox;
            };
            SearchMap.prototype._getMapViewportSettings = function (placeType, places) {
                var settings = {
                    bounds: new google.maps.LatLngBounds(),
                };
                if (placeType == 'continents') {
                    settings.zoom = 1;
                    settings.center = new google.maps.LatLng(0, 0);
                }
                else if (placeType == 'countries') {
                    var continentCode = this.continentCode();
                    if (!places.length) {
                        if (continentCode && this._continentsResponse) {
                            var continent = Enumerable.From(this._continentsResponse())
                                .SingleOrDefault(undefined, function (x) {
                                return x.code == continentCode;
                            });
                            if (continent && continent.boundingBox && continent.boundingBox.hasValue) {
                                continent.boundingBox = this.fixBoundingBox(continent.boundingBox);
                                settings.bounds = Places.Utils.convertToLatLngBounds(continent.boundingBox);
                            }
                        }
                    }
                    else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue) {
                            country.boundingBox = this.fixBoundingBox(country.boundingBox);
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                        }
                    }
                    else {
                        var latLngs = Enumerable.From(places)
                            .Select(function (x) {
                            return new google.maps.LatLng(x.center.latitude, x.center.longitude);
                        }).ToArray();
                        $.each(latLngs, function (index, latLng) {
                            settings.bounds.extend(latLng);
                        });
                    }
                }
                else {
                    var countryCode = this.countryCode();
                    if (!places.length) {
                        if (countryCode && this.countryOptions) {
                            var countryOption = Enumerable.From(this.countryOptions())
                                .SingleOrDefault(undefined, function (x) {
                                return x.code == countryCode;
                            });
                            if (countryOption && countryOption.box && countryOption.box.hasValue) {
                                settings.bounds = Places.Utils.convertToLatLngBounds(countryOption.box);
                            }
                        }
                    }
                    else if (places.length == 1) {
                        var country = places[0];
                        if (country && country.boundingBox && country.boundingBox.hasValue)
                            settings.bounds = Places.Utils.convertToLatLngBounds(country.boundingBox);
                    }
                    else {
                        var latLngs = Enumerable.From(places)
                            .Select(function (x) {
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
                    return new Scaler({ min: 0, max: 1, }, { min: 16, max: 16, });
                var from = {
                    min: Enumerable.From(places).Min(function (x) { return x.count; }),
                    max: Enumerable.From(places).Max(function (x) { return x.count; }),
                };
                var into = { min: 24, max: 48 };
                if (!placeType)
                    into = { min: 24, max: 32 };
                return new Scaler(from, into);
            };
            SearchMap.prototype._setMarkerIcon = function (options, text, scaler, color) {
                if (color === void 0) { color = 'rgb(11, 11, 11)'; }
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
                var shape = {
                    type: 'circle',
                    coords: [halfSide, halfSide, halfSide],
                };
                options.icon = icon;
                options.shape = shape;
                options.zIndex = 200 - side;
            };
            SearchMap.defaultMapCenter = new google.maps.LatLng(0, 17);
            SearchMap.ContinentSessionKey = 'ActivitySearchContinent';
            SearchMap.CountrySessionKey = 'ActivitySearchCountry2';
            SearchMap.SearchOptions = 'ActivitySearchOptions';
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
    })(ViewModels = Activities.ViewModels || (Activities.ViewModels = {}));
})(Activities || (Activities = {}));
