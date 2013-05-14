define(["require", "exports", '../places/ServerApiModel', '../Widgets/Spinner'], function(require, exports, __Places__, __Spinner__) {
    
    var Places = __Places__;

    var Spinner = __Spinner__;

    var gm = google.maps;
    var Location = (function () {
        function Location(ownerId) {
            var _this = this;
            this.mapZoom = ko.observable(1);
            this.mapTools = ko.observable();
            this.$mapCanvas = ko.observable();
            this.isMapVisible = ko.observable();
            this.isLoaded = ko.observable();
            this.continents = ko.observableArray();
            this.continentId = ko.observable();
            this.countries = ko.observableArray();
            this.countryId = ko.observable();
            this.allowCountryFitBounds = true;
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
            this.loadSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.saveSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.isEditing = ko.observable();
            this.ownerId = ownerId;
            this._initComputedsAndSubscriptions();
            this.loadSpinner.isVisible.subscribe(function (newValue) {
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
                } else if(_this.isEditable()) {
                    _this.mapTools().hideMarkerTools();
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
                $.get(App.Routes.WebApi.Places.get(), {
                    isContinent: true
                }).done(function (response) {
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
                var continent = Places.Utils.getPlaceById(_this.continents(), continentId);
                return continent ? continent.officialName : '[Unknown]';
            });
            this.countryOptionsCaption = ko.computed(function () {
                return _this.countries().length > 0 ? '[Unspecified]' : '[Loading...]';
            });
            ko.computed(function () {
                $.get(App.Routes.WebApi.Places.get(), {
                    isCountry: true
                }).done(function (response) {
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
                var country = Places.Utils.getPlaceById(_this.countries(), countryId);
                return country ? country.officialName : '[Unknown]';
            });
            this.countryId.subscribe(function (newValue) {
                if(newValue && _this.countries().length == 0) {
                    _this._countryId = newValue;
                }
                if(newValue && _this.countries().length > 0) {
                    var country = Places.Utils.getPlaceById(_this.countries(), newValue);
                    if(country) {
                        if(_this.allowCountryFitBounds) {
                            _this.map.fitBounds(Places.Utils.convertToLatLngBounds(country.box));
                        } else {
                            setTimeout(function () {
                                _this.allowCountryFitBounds = true;
                            }, 1000);
                        }
                        _this.continentId(country.parentId);
                        _this.loadAdmin1s(country.id);
                    }
                } else if(!newValue && _this.countries().length > 0) {
                    _this.map.setCenter(new gm.LatLng(0, 0));
                    if(_this.allowCountryFitBounds) {
                        _this.map.setZoom(1);
                    } else {
                        setTimeout(function () {
                            _this.allowCountryFitBounds = true;
                        }, 1000);
                    }
                    _this.continentId(null);
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
                    var admin1 = Places.Utils.getPlaceById(_this.admin1s(), newValue);
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
                var admin1 = Places.Utils.getPlaceById(_this.admin1s(), admin1Id);
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
                    var admin2 = Places.Utils.getPlaceById(_this.admin2s(), newValue);
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
                var admin2 = Places.Utils.getPlaceById(_this.admin2s(), admin2Id);
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
                    var admin3 = Places.Utils.getPlaceById(_this.admin3s(), newValue);
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
                var admin3 = Places.Utils.getPlaceById(_this.admin3s(), admin3Id);
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
            this.isMapVisible(true);
            gm.event.addListenerOnce(this.map, 'idle', function () {
                _this.mapTools(new App.GoogleMaps.ToolsOverlay(_this.map));
                _this.mapTools().hideMarkerTools();
                gm.event.addListener(_this.map, 'zoom_changed', function () {
                    _this.mapZoom(_this.map.getZoom());
                });
            });
            this.$mapCanvas().on('marker_destroyed', function () {
                var center = _this.map.getCenter();
                var zoom = _this.map.getZoom();
                _this.countryId(undefined);
                _this.continentId(undefined);
                _this.admin1Id(undefined);
                _this.admin2Id(undefined);
                _this.admin3Id(undefined);
                _this.subAdmins([]);
                _this.map.setCenter(center);
                _this.map.setZoom(zoom);
            });
            this.$mapCanvas().on('marker_dragend marker_created', function () {
                var latLng = _this.mapTools().markerLatLng();
                var route = App.Routes.WebApi.Places.ByCoordinates.get(latLng.lat(), latLng.lng());
                _this.loadSpinner.start();
                $.get(route).done(function (response) {
                    if(response && response.length) {
                        _this.allowCountryFitBounds = false;
                        _this.fillPlacesHierarchy(response);
                    }
                }).always(function () {
                    _this.loadSpinner.stop();
                }).fail(function (arg1, arg2, arg3, arg4, arg5) {
                });
            });
            if(this.ownerId) {
                this.isLoaded(false);
                $.get(App.Routes.WebApi.Establishments.Locations.get(this.ownerId)).done(function (response) {
                    gm.event.addListenerOnce(_this.map, 'idle', function () {
                        _this.loadMapZoom(response);
                        _this.loadMapMarker(response);
                    });
                    _this.fillPlacesHierarchy(response.places);
                    _this.isLoaded(true);
                });
            } else {
                gm.event.addListenerOnce(this.map, 'idle', function () {
                    _this.isEditing(true);
                });
            }
        };
        Location.prototype.loadMapZoom = function (response) {
            if(response.googleMapZoomLevel && response.center && response.center.hasValue) {
                this.map.setZoom(response.googleMapZoomLevel);
            } else if(response.box.hasValue) {
                this.map.fitBounds(Places.Utils.convertToLatLngBounds(response.box));
            }
            if(response.googleMapZoomLevel && response.googleMapZoomLevel > 1) {
                this.map.setZoom(response.googleMapZoomLevel);
            }
            if(response.googleMapZoomLevel || response.box.hasValue) {
                this.allowCountryFitBounds = false;
            }
        };
        Location.prototype.loadMapMarker = function (response) {
            if(response.center.hasValue) {
                var latLng = Places.Utils.convertToLatLng(response.center);
                this.mapTools().placeMarker(latLng);
                this.map.setCenter(latLng);
            }
        };
        Location.prototype.fillPlacesHierarchy = function (places) {
            this.places(places);
            var continent = Places.Utils.getContinent(places);
            if(continent) {
                this.continentId(continent.id);
            }
            var country = Places.Utils.getCountry(places);
            if(country) {
                this.countryId(country.id);
            } else {
                this.countryId(undefined);
            }
            var admin1 = Places.Utils.getAdmin1(places);
            if(admin1) {
                this.admin1Id(admin1.id);
            } else {
                this.admin1Id(undefined);
            }
            var admin2 = Places.Utils.getAdmin2(places);
            if(admin2) {
                this.admin2Id(admin2.id);
            } else {
                this.admin2Id(undefined);
            }
            var admin3 = Places.Utils.getAdmin3(places);
            if(admin3) {
                this.admin3Id(admin3.id);
            } else {
                this.admin3Id(undefined);
            }
            var subAdmins = Places.Utils.getSubAdmins(places);
            if(subAdmins && subAdmins.length) {
                this.subAdmins(subAdmins);
            } else {
                this.subAdmins([]);
            }
        };
        Location.prototype.loadAdmin1s = function (countryId) {
            var _this = this;
            var admin1Url = App.Routes.WebApi.Places.get();
            this.admin1sLoading(true);
            $.ajax({
                type: 'GET',
                url: admin1Url,
                data: {
                    isAdmin1: true,
                    parentId: countryId
                },
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
            var admin2Url = App.Routes.WebApi.Places.get();
            this.admin2sLoading(true);
            $.ajax({
                type: 'GET',
                data: {
                    isAdmin2: true,
                    parentId: admin1Id
                },
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
            var admin3Url = App.Routes.WebApi.Places.get();
            this.admin3sLoading(true);
            $.ajax({
                type: 'GET',
                data: {
                    isAdmin3: true,
                    parentId: admin2Id
                },
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
        Location.prototype.clickToSave = function () {
            var _this = this;
            var me = this;
            if(!this.ownerId) {
                return;
            }
            this.saveSpinner.start();
            $.ajax({
                url: App.Routes.WebApi.Establishments.Locations.put(me.ownerId),
                type: 'PUT',
                data: me.serializeData()
            }).always(function () {
                me.saveSpinner.stop();
            }).done(function (response, statusText, xhr) {
                App.flasher.flash(response);
                _this.isEditing(false);
            }).fail(function (arg1, arg2, arg3) {
            });
        };
        Location.prototype.serializeData = function () {
            var center, centerLat = this.toolsMarkerLat(), centerLng = this.toolsMarkerLng(), zoom = this.map.getZoom();
            if(centerLat != null && centerLng != null) {
                center = {
                    latitude: centerLat,
                    longitude: centerLng
                };
            }
            if(center) {
                this.map.setCenter(Places.Utils.convertToLatLng(center));
            }
            var box, northEast, northEastLat = this.map.getBounds().getNorthEast().lat(), northEastLng = this.map.getBounds().getNorthEast().lng(), southWest, southWestLat = this.map.getBounds().getSouthWest().lat(), southWestLng = this.map.getBounds().getSouthWest().lng(), placeId;
            if(zoom && zoom > 1) {
                box = {
                    northEast: {
                        latitude: northEastLat,
                        longitude: northEastLng
                    },
                    southWest: {
                        latitude: southWestLat,
                        longitude: southWestLng
                    }
                };
            }
            if(this.subAdmins().length) {
                placeId = this.subAdmins()[this.subAdmins().length - 1].id;
            } else if(this.admin3Id()) {
                placeId = this.admin3Id();
            } else if(this.admin2Id()) {
                placeId = this.admin2Id();
            } else if(this.admin1Id()) {
                placeId = this.admin1Id();
            } else if(this.countryId()) {
                placeId = this.countryId();
            } else if(this.continentId()) {
                placeId = this.continentId();
            }
            var js = {
                center: center,
                box: box,
                googleMapZoomLevel: zoom,
                placeId: placeId
            };
            return js;
        };
        Location.prototype.clickToCancelEdit = function () {
            var _this = this;
            this.isEditing(false);
            if(!this.ownerId) {
                return;
            }
            this.isLoaded(false);
            $.get(App.Routes.WebApi.Establishments.Locations.get(this.ownerId)).done(function (response) {
                _this.map.setZoom(1);
                _this.loadMapZoom(response);
                _this.mapTools().destroyMarker();
                _this.loadMapMarker(response);
                _this.fillPlacesHierarchy(response.places);
                _this.isLoaded(true);
            });
        };
        Location.prototype.clickForHelp = function () {
            alert('TODO: Show location help dialog here.');
        };
        return Location;
    })();
    exports.Location = Location;    
})
