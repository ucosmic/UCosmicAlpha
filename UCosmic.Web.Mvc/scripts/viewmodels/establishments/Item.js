var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var gm = google.maps;
        var Item = (function () {
            function Item(id) {
                var _this = this;
                this.namesSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.urlsSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.id = 0;
                this.$genericAlertDialog = undefined;
                this.languages = ko.observableArray();
                this.names = ko.observableArray();
                this.editingName = ko.observable(0);
                this.urls = ko.observableArray();
                this.editingUrl = ko.observable(0);
                this.mapTools = ko.observable();
                this.$mapCanvas = ko.observable();
                this.continents = ko.observableArray();
                this.continentId = ko.observable();
                this.countries = ko.observableArray();
                this.countryId = ko.observable();
                this.admin1s = ko.observableArray();
                this.admin1Id = ko.observable();
                this.admin1sLoading = ko.observable(false);
                this.admin2s = ko.observableArray();
                this.admin2Id = ko.observable();
                this.admin2sLoading = ko.observable(false);
                this.admin3s = ko.observableArray();
                this.admin3Id = ko.observable();
                this.admin3sLoading = ko.observable(false);
                this.places = ko.observableArray();
                this.subAdmins = ko.observableArray();
                this.id = id || 0;
                ko.computed(function () {
                    $.getJSON(App.Routes.WebApi.Languages.get()).done(function (response) {
                        var emptyValue = new ViewModels.Languages.ServerApiModel(undefined, '[Language Neutral]');
                        response.splice(0, 0, emptyValue);
                        _this.languages(response);
                    });
                }).extend({
                    throttle: 1
                });
                this.namesMapping = {
                    create: function (options) {
                        return new Establishments.Name(options.data, _this);
                    }
                };
                this.canAddName = ko.computed(function () {
                    return !_this.namesSpinner.isVisible() && _this.editingName() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestNames();
                    } else {
                        setTimeout(function () {
                            _this.namesSpinner.stop();
                            _this.addName();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
                this.urlsMapping = {
                    create: function (options) {
                        return new Establishments.Url(options.data, _this);
                    }
                };
                this.canAddUrl = ko.computed(function () {
                    return !_this.urlsSpinner.isVisible() && _this.editingUrl() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestUrls();
                    } else {
                        setTimeout(function () {
                            _this.urlsSpinner.stop();
                            _this.addUrl();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
                this.toolsMarkerLat = ko.computed(function () {
                    return _this.mapTools() && _this.mapTools().markerLatLng() ? _this.mapTools().markerLatLng().lat() : null;
                });
                this.toolsMarkerLng = ko.computed(function () {
                    return _this.mapTools() && _this.mapTools().markerLatLng() ? _this.mapTools().markerLatLng().lng() : null;
                });
                this.$mapCanvas.subscribe(function (newValue) {
                    if(!_this.map) {
                        _this.initMap();
                    }
                });
                ko.computed(function () {
                    $.get(App.Routes.WebApi.Places.get({
                        isContinent: true
                    })).done(function (response) {
                        _this.continents(response);
                    });
                }).extend({
                    throttle: 1
                });
                this.continentName = ko.computed(function () {
                    var continentId = _this.continentId();
                    if(!continentId) {
                        return '[Unspecified]';
                    }
                    var continent = ViewModels.Places.Utils.getPlaceById(_this.continents(), continentId);
                    return continent ? continent.officialName : '[Unknown]';
                });
                this.countryOptionsCaption = ko.computed(function () {
                    return _this.countries().length > 0 ? '[Unspecified]' : '[Loading...]';
                });
                ko.computed(function () {
                    $.get(App.Routes.WebApi.Places.get({
                        isCountry: true
                    })).done(function (response) {
                        _this.countries(response);
                        if(_this._countryId) {
                            var countryId = _this._countryId;
                            _this._countryId = undefined;
                            _this.countryId(countryId);
                        }
                    });
                }).extend({
                    throttle: 1
                });
                this.countryId.subscribe(function (newValue) {
                    if(newValue && _this.countries().length == 0) {
                        _this._countryId = newValue;
                    }
                    if(newValue && _this.countries().length > 0) {
                        var country = ViewModels.Places.Utils.getPlaceById(_this.countries(), newValue);
                        if(country) {
                            _this.map.fitBounds(ViewModels.Places.Utils.convertToLatLngBounds(country.box));
                            _this.continentId(country.parentId);
                            _this.loadAdmin1s(country.id);
                        }
                    } else {
                        if(!newValue && _this.countries().length > 0) {
                            _this.map.setCenter(new gm.LatLng(0, 0));
                            _this.map.setZoom(1);
                            _this.continentId(null);
                        }
                    }
                });
                this.admin1OptionsCaption = ko.computed(function () {
                    return !_this.admin1sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin1Input = ko.computed(function () {
                    return _this.countryId() && (_this.admin1s().length > 0 || _this.admin1sLoading());
                });
                this.admin1Id.subscribe(function (newValue) {
                    if(newValue && _this.admin1s().length == 0) {
                        _this._admin1Id = newValue;
                    }
                    if(newValue && _this.admin1s().length > 0) {
                        var admin1 = ViewModels.Places.Utils.getPlaceById(_this.admin1s(), newValue);
                        if(admin1) {
                            _this.loadAdmin2s(admin1.id);
                        } else {
                            _this._admin1Id = newValue;
                            _this.loadAdmin1s(_this.countryId() || _this._countryId);
                        }
                    }
                });
                this.admin2OptionsCaption = ko.computed(function () {
                    return !_this.admin2sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin2Input = ko.computed(function () {
                    return _this.countryId() && _this.admin1Id() && (_this.admin2s().length > 0 || _this.admin2sLoading());
                });
                this.admin2Id.subscribe(function (newValue) {
                    if(newValue && _this.admin2s().length == 0) {
                        _this._admin2Id = newValue;
                    }
                    if(newValue && _this.admin2s().length > 0) {
                        var admin2 = ViewModels.Places.Utils.getPlaceById(_this.admin2s(), newValue);
                        if(admin2) {
                            _this.loadAdmin3s(admin2.id);
                        } else {
                            _this._admin2Id = newValue;
                            _this.loadAdmin2s(_this.admin1Id() || _this._admin1Id);
                        }
                    }
                });
                this.admin3OptionsCaption = ko.computed(function () {
                    return !_this.admin3sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin3Input = ko.computed(function () {
                    return _this.countryId() && _this.admin1Id() && _this.admin2Id() && (_this.admin3s().length > 0 || _this.admin3sLoading());
                });
                this.admin3Id.subscribe(function (newValue) {
                    if(newValue && _this.admin3s().length == 0) {
                        _this._admin3Id = newValue;
                    }
                    if(newValue && _this.admin3s().length > 0) {
                        var admin3 = ViewModels.Places.Utils.getPlaceById(_this.admin3s(), newValue);
                        if(!admin3) {
                            _this._admin3Id = newValue;
                            _this.loadAdmin3s(_this.admin2Id() || _this._admin2Id);
                        }
                    }
                });
            }
            Item.prototype.requestNames = function (callback) {
                var _this = this;
                this.namesSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Names.get(this.id)).done(function (response) {
                    _this.receiveNames(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveNames = function (js) {
                ko.mapping.fromJS(js || [], this.namesMapping, this.names);
                this.namesSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addName = function () {
                var apiModel = new Establishments.ServerNameApiModel(this.id);
                if(this.names().length === 0) {
                    apiModel.isOfficialName = true;
                }
                var newName = new Establishments.Name(apiModel, this);
                this.names.unshift(newName);
                newName.showEditor();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.requestUrls = function (callback) {
                var _this = this;
                this.urlsSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Urls.get(this.id)).done(function (response) {
                    _this.receiveUrls(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveUrls = function (js) {
                ko.mapping.fromJS(js || [], this.urlsMapping, this.urls);
                this.urlsSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addUrl = function () {
                var apiModel = new Establishments.ServerUrlApiModel(this.id);
                if(this.urls().length === 0) {
                    apiModel.isOfficialUrl = true;
                }
                var newUrl = new Establishments.Url(apiModel, this);
                this.urls.unshift(newUrl);
                newUrl.showEditor();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.initMap = function () {
                var _this = this;
                var mapOptions = {
                    mapTypeId: gm.MapTypeId.ROADMAP,
                    center: new gm.LatLng(0, 0),
                    zoom: 1,
                    draggable: true,
                    scrollwheel: false
                };
                this.map = new gm.Map(this.$mapCanvas()[0], mapOptions);
                gm.event.addListenerOnce(this.map, 'idle', function () {
                    _this.mapTools(new App.GoogleMaps.ToolsOverlay(_this.map));
                });
                this.$mapCanvas().on('marker_destroyed', function () {
                    _this.countryId(undefined);
                    _this.subAdmins([]);
                });
                this.$mapCanvas().on('marker_dragend marker_created', function () {
                    var latLng = _this.mapTools().markerLatLng();
                    var route = App.Routes.WebApi.Places.get(latLng.lat(), latLng.lng());
                    $.get(route, function (response) {
                        if(response && response.length) {
                            _this.fillPlacesHierarchy(response);
                        }
                    });
                });
                if(this.id) {
                    $.get(App.Routes.WebApi.Establishments.Locations.get(this.id)).done(function (response) {
                        gm.event.addListenerOnce(_this.map, 'idle', function () {
                            if(response.googleMapZoomLevel) {
                                _this.map.setZoom(response.googleMapZoomLevel);
                            } else {
                                if(response.box.hasValue) {
                                    _this.map.fitBounds(ViewModels.Places.Utils.convertToLatLngBounds(response.box));
                                }
                            }
                            if(response.center.hasValue) {
                                var latLng = ViewModels.Places.Utils.convertToLatLng(response.center);
                                _this.mapTools().placeMarker(latLng);
                                _this.map.setCenter(latLng);
                            }
                        });
                        _this.fillPlacesHierarchy(response.places);
                    });
                }
            };
            Item.prototype.fillPlacesHierarchy = function (places) {
                this.places(places);
                var continent = ViewModels.Places.Utils.getContinent(places);
                if(continent) {
                    this.continentId(continent.id);
                }
                var country = ViewModels.Places.Utils.getCountry(places);
                if(country) {
                    this.countryId(country.id);
                } else {
                    this.countryId(undefined);
                }
                var admin1 = ViewModels.Places.Utils.getAdmin1(places);
                if(admin1) {
                    this.admin1Id(admin1.id);
                } else {
                    this.admin1Id(undefined);
                }
                var admin2 = ViewModels.Places.Utils.getAdmin2(places);
                if(admin2) {
                    this.admin2Id(admin2.id);
                } else {
                    this.admin2Id(undefined);
                }
                var admin3 = ViewModels.Places.Utils.getAdmin3(places);
                if(admin3) {
                    this.admin3Id(admin3.id);
                } else {
                    this.admin3Id(undefined);
                }
                var subAdmins = ViewModels.Places.Utils.getSubAdmins(places);
                if(subAdmins && subAdmins.length) {
                    this.subAdmins(subAdmins);
                } else {
                    this.subAdmins([]);
                }
            };
            Item.prototype.loadAdmin1s = function (countryId) {
                var _this = this;
                this.admin1s([]);
                var admin1Url = App.Routes.WebApi.Places.get({
                    isAdmin1: true,
                    parentId: countryId
                });
                this.admin1sLoading(true);
                $.ajax({
                    type: 'GET',
                    url: admin1Url,
                    cache: false
                }).done(function (results) {
                    _this.admin1s(results);
                    if(_this._admin1Id) {
                        _this.admin1Id(_this._admin1Id);
                    }
                    _this.admin1sLoading(false);
                });
            };
            Item.prototype.loadAdmin2s = function (admin1Id) {
                var _this = this;
                this.admin2s([]);
                var admin2Url = App.Routes.WebApi.Places.get({
                    isAdmin2: true,
                    parentId: admin1Id
                });
                this.admin2sLoading(true);
                $.ajax({
                    type: 'GET',
                    url: admin2Url,
                    cache: false
                }).done(function (results) {
                    _this.admin2s(results);
                    if(_this._admin2Id) {
                        _this.admin2Id(_this._admin2Id);
                    }
                    _this.admin2sLoading(false);
                });
            };
            Item.prototype.loadAdmin3s = function (admin2Id) {
                var _this = this;
                this.admin3s([]);
                var admin3Url = App.Routes.WebApi.Places.get({
                    isAdmin3: true,
                    parentId: admin2Id
                });
                this.admin3sLoading(true);
                $.ajax({
                    type: 'GET',
                    url: admin3Url,
                    cache: false
                }).done(function (results) {
                    _this.admin3s(results);
                    if(_this._admin3Id) {
                        _this.admin3Id(_this._admin3Id);
                    }
                    _this.admin3sLoading(false);
                });
            };
            Item.prototype.changePlaceInLocation = function () {
                this.subAdmins([]);
            };
            return Item;
        })();
        Establishments.Item = Item;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
