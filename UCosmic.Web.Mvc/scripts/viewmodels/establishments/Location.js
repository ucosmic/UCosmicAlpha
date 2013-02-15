var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var gm = google.maps;
        var Location = (function () {
            function Location(ownerId) {
                var _this = this;
                this.mapZoom = ko.observable(1);
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
                this.dataLoadingSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(400));
                this.isEditing = ko.observable();
                this.ownerId = ownerId;
                this._initComputedsAndSubscriptions();
                this.dataLoadingSpinner.isVisible.subscribe(function (newValue) {
                    if(!_this.$dataLoadingDialog || !_this.$dataLoadingDialog.length) {
                        return;
                    }
                    if(newValue) {
                        _this.$dataLoadingDialog.dialog({
                            modal: true,
                            resizable: false,
                            dialogClass: 'no-close',
                            width: '450px'
                        });
                    } else {
                        _this.$dataLoadingDialog.dialog('close');
                    }
                });
                this.isEditable = ko.computed(function () {
                    return _this.ownerId && _this.ownerId !== 0;
                });
                this.isEditIconVisible = ko.computed(function () {
                    return _this.isEditable() && !_this.isEditing();
                });
                this.isEditing.subscribe(function (newValue) {
                    if(newValue) {
                        _this.mapTools().showMarkerTools();
                    } else {
                        if(_this.isEditable()) {
                            _this.mapTools().hideMarkerTools();
                        }
                    }
                });
            }
            Location.prototype._initComputedsAndSubscriptions = function () {
                var _this = this;
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
                this.countryName = ko.computed(function () {
                    var countryId = _this.countryId();
                    if(!countryId) {
                        return '[Unspecified]';
                    }
                    var country = ViewModels.Places.Utils.getPlaceById(_this.countries(), countryId);
                    return country ? country.officialName : '[Unknown]';
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
                this.admin1Name = ko.computed(function () {
                    var admin1Id = _this.admin1Id();
                    if(!admin1Id) {
                        return '[Unspecified]';
                    }
                    var admin1 = ViewModels.Places.Utils.getPlaceById(_this.admin1s(), admin1Id);
                    return admin1 ? admin1.officialName : '[Unknown]';
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
                this.admin2Name = ko.computed(function () {
                    var admin2Id = _this.admin2Id();
                    if(!admin2Id) {
                        return '[Unspecified]';
                    }
                    var admin2 = ViewModels.Places.Utils.getPlaceById(_this.admin2s(), admin2Id);
                    return admin2 ? admin2.officialName : '[Unknown]';
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
                this.admin3Name = ko.computed(function () {
                    var admin3Id = _this.admin3Id();
                    if(!admin3Id) {
                        return '[Unspecified]';
                    }
                    var admin3 = ViewModels.Places.Utils.getPlaceById(_this.admin3s(), admin3Id);
                    return admin3 ? admin3.officialName : '[Unknown]';
                });
            };
            Location.prototype.initMap = function () {
                var _this = this;
                var me = this;
                var mapOptions = {
                    mapTypeId: gm.MapTypeId.ROADMAP,
                    center: new gm.LatLng(0, 0),
                    zoom: me.mapZoom(),
                    draggable: true,
                    scrollwheel: false
                };
                this.map = new gm.Map(this.$mapCanvas()[0], mapOptions);
                gm.event.addListenerOnce(this.map, 'idle', function () {
                    _this.mapTools(new App.GoogleMaps.ToolsOverlay(_this.map));
                    _this.mapTools().hideMarkerTools();
                    gm.event.addListener(_this.map, 'zoom_changed', function () {
                        _this.mapZoom(_this.map.getZoom());
                    });
                });
                this.$mapCanvas().on('marker_destroyed', function () {
                    _this.countryId(undefined);
                    _this.subAdmins([]);
                });
                this.$mapCanvas().on('marker_dragend marker_created', function () {
                    var latLng = _this.mapTools().markerLatLng();
                    var route = App.Routes.WebApi.Places.get(latLng.lat(), latLng.lng());
                    _this.dataLoadingSpinner.start();
                    $.get(route).done(function (response) {
                        if(response && response.length) {
                            _this.fillPlacesHierarchy(response);
                        }
                    }).always(function () {
                        _this.dataLoadingSpinner.stop();
                    }).fail(function (arg1, arg2, arg3, arg4, arg5) {
                    });
                });
                if(this.ownerId) {
                    $.get(App.Routes.WebApi.Establishments.Locations.get(this.ownerId)).done(function (response) {
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
                } else {
                    gm.event.addListenerOnce(this.map, 'idle', function () {
                        _this.isEditing(true);
                    });
                }
            };
            Location.prototype.fillPlacesHierarchy = function (places) {
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
            Location.prototype.loadAdmin1s = function (countryId) {
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
            Location.prototype.loadAdmin2s = function (admin1Id) {
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
            Location.prototype.loadAdmin3s = function (admin2Id) {
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
            Location.prototype.changePlaceInLocation = function () {
                this.subAdmins([]);
            };
            Location.prototype.clickToEdit = function () {
                this.isEditing(true);
            };
            Location.prototype.clickToCancelEdit = function () {
                this.isEditing(false);
            };
            return Location;
        })();
        Establishments.Location = Location;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
