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
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
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
                this.countryCode.subscribe(function (newValue) {
                    if(newValue && _this.countries().length == 0) {
                        _this._countryCode = newValue;
                    }
                    if(newValue && _this.countries().length > 0 && !_this._countryCode) {
                        var country;
                        for(var i = 0; i < _this.countries().length; i++) {
                            if(_this.countries()[i].code == newValue) {
                                country = _this.countries()[i];
                            }
                        }
                        _this.map.fitBounds(ViewModels.Places.Utils.convertToLatLngBounds(country.box));
                    }
                    if(newValue && _this.countries().length > 0) {
                        _this._countryCode = undefined;
                    }
                });
                ko.computed(function () {
                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        _this.countries(response);
                        if(_this._countryCode) {
                            _this.countryCode(_this._countryCode);
                        }
                    });
                }).extend({
                    throttle: 1
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
                        var country = ViewModels.Places.Utils.getCountry(response.places);
                        if(country) {
                            _this.countryCode(country.countryCode);
                        }
                    });
                }
            };
            return Item;
        })();
        Establishments.Item = Item;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
