var App;
(function (App) {
    /// <reference path="../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../typings/jquery/jquery.d.ts" />
    /// <reference path="../typings/knockout/knockout.d.ts" />
    /// <reference path="../app/App.ts" />
    (function (GoogleMaps) {
        var Map = (function () {
            function Map(elementOrId, options, settings) {
                this._promise = $.Deferred();
                //#region Idle
                // initial values for lat & lng are based on the options used to create the map
                this.idles = ko.observable(0);
                this._idleCallbacks = [];
                //#endregion
                //#region Bounds (North East Soutn West)
                this.north = ko.observable();
                this.south = ko.observable();
                this.east = ko.observable();
                this.west = ko.observable();
                //#endregion
                //#region Drag
                this.isDragging = ko.observable(false);
                //#endregion
                //#endregion
                //#region Markers
                this.markers = ko.observableArray([]);
                //#endregion
                //#region InfoWindows
                this.infoWindows = ko.observableArray([]);
                // stash the settings and options
                this._options = options || {};
                this._settings = settings || {};

                this._log('Constructing google map wrapper instance.');

                if (typeof elementOrId === 'string') {
                    this._element = document.getElementById(elementOrId);
                } else {
                    this._element = elementOrId;
                }

                this._log('Set map canvas element, id is "{0}".', $(this._element).attr('id'));

                // initialize observables
                this.zoom = ko.observable(this._options.zoom || this._options.zoom == 0 ? this._options.zoom : 1);
                this.lat = ko.observable(this._options.center ? Map._reducePrecision(this._options.center.lat(), this._settings.maxPrecision) : Map.defaultCenter.lat());
                this.lng = ko.observable(this._options.center ? Map._reducePrecision(this._options.center.lng(), this._settings.maxPrecision) : Map.defaultCenter.lng());

                this.lng.subscribe(function (newValue) {
                    if (newValue) {
                    }
                });

                this._log('Zoom initialized to {0}.', this.zoom());
                this._log('Latitude initialized to {0}.', this.lat());
                this._log('Longitude initialized to {0}.', this.lng());

                if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                    this._log('Eagerly readying the google map instance.');
                    this.ready();
                }

                this._log('Completed Construction of google map wrapper instance.');
            }
            Map.prototype.ready = function () {
                var _this = this;
                if (!this.map) {
                    this._create();

                    // listen for the map to become idle before resolving the promise
                    google.maps.event.addListenerOnce(this.map, 'idle', function () {
                        _this._log('Fired map idle event #0.');
                        _this._listenForCenterChange();
                        _this._listenForZoomChange();
                        _this._listenForBoundsChange();
                        _this._listenForDragging();
                        _this._listenForIdled();
                        _this._boundsChanged();
                        _this._promise.resolve();
                    });
                }
                return this._promise;
            };
            Map.prototype._create = function () {
                // first set up the options
                var options = this._options;

                if (!options.center)
                    options.center = Map.defaultCenter;
                if (!options.zoom)
                    options.zoom = 1;
                if (!options.mapTypeId)
                    options.mapTypeId = google.maps.MapTypeId.ROADMAP;

                if (!options.scrollwheel)
                    options.scrollwheel = false;

                // construct the map to kick off initialization
                this.map = new google.maps.Map(this._element, options);
            };

            //#endregion
            //#region Viewport Properties & Events
            Map.prototype.setViewport = function (settings) {
                var isDirty = false;

                // set zoom if it is present and not current value
                var zoom = this.map.getZoom();
                if (Map.isValidZoom(settings.zoom) && settings.zoom != zoom) {
                    this.map.setZoom(settings.zoom);
                    isDirty = true;
                }

                // set center if it is present and not current value
                var center = this.map.getCenter();
                if (settings.center && !Map.areCentersEqual(center, settings.center, this._settings.maxPrecision)) {
                    this.map.setCenter(settings.center);
                    isDirty = true;
                }

                // set bounds if present, not empty, and not current value
                var bounds = this.map.getBounds();
                if (settings.bounds && !Map.isEmptyBounds(settings.bounds) && !Map.areBoundsEqual(bounds, settings.bounds)) {
                    this.map.fitBounds(settings.bounds);
                    isDirty = true;
                }

                var promise = $.Deferred();
                if (isDirty) {
                    google.maps.event.addListenerOnce(this.map, 'idle', function () {
                        promise.resolve();
                    });
                } else {
                    promise.resolve();
                }
                return promise;
            };

            Map.prototype.onIdle = function (callback) {
                this._idleCallbacks.push(callback);
            };

            Map.prototype._idled = function () {
                var idles = this.idles();
                this.idles(++idles);
            };

            Map.prototype._listenForIdled = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'idle', function () {
                    _this._idled();
                    $.each(_this._idleCallbacks, function (i, callback) {
                        callback();
                    });
                    _this._log('Fired map idle event #{0}.', _this.idles());
                });
            };

            Map.prototype._zoomChanged = function () {
                var zoom = this.map.getZoom();
                this.zoom(zoom);
            };

            Map.prototype._listenForZoomChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'zoom_changed', function () {
                    //this._log('Firing map zoom_changed event.');
                    _this._zoomChanged();
                    _this._log('Fired map zoom_changed event.');
                });
            };

            Map.isValidZoom = function (zoom) {
                return typeof zoom !== 'undefined' && !isNaN(zoom) && zoom >= 0;
            };

            Map.prototype._centerChanged = function () {
                var center = this.map.getCenter();
                this.lat(Map._reducePrecision(center.lat(), this._settings.maxPrecision));
                this.lng(Map._reducePrecision(center.lng(), this._settings.maxPrecision));
            };

            Map.prototype._listenForCenterChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'center_changed', function () {
                    //this._log('Firing map center_changed event.');
                    _this._centerChanged();
                    _this._log('Fired map center_changed event.');
                });
            };

            Map.areCentersEqual = function (center1, center2, precision) {
                return Map.areNumbersEqualy(center1.lat(), center2.lat(), precision) && Map.areNumbersEqualy(center1.lng(), center2.lng(), precision);
            };

            Map.areNumbersEqualy = //39.24683949
            //39.2468395
            function (coordinate1, coordinate2, preceision) {
                coordinate1 = Map._reducePrecision(coordinate1, preceision);
                coordinate2 = Map._reducePrecision(coordinate2, preceision);
                return coordinate1 - coordinate2 == 0;
            };

            Map.prototype._boundsChanged = function () {
                var bounds = this.map.getBounds();
                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                this.north(Map._reducePrecision(northEast.lat(), this._settings.maxPrecision));
                this.east(Map._reducePrecision(northEast.lng(), this._settings.maxPrecision));
                this.south(Map._reducePrecision(southWest.lat(), this._settings.maxPrecision));
                this.west(Map._reducePrecision(southWest.lng(), this._settings.maxPrecision));
            };

            Map.prototype._listenForBoundsChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'bounds_changed', function () {
                    //this._log('Firing map bounds_changed event.');
                    _this._boundsChanged();
                    _this._log('Fired map bounds_changed event.');
                });
            };

            Map.isEmptyBounds = function (bounds) {
                return Map.areBoundsEqual(bounds, Map.emptyBounds);
            };

            Map.areBoundsEqual = function (bounds1, bounds2) {
                var ne1 = bounds1.getNorthEast();
                var ne2 = bounds2.getNorthEast();
                var sw1 = bounds1.getSouthWest();
                var sw2 = bounds2.getSouthWest();
                return ne1.lat() == ne2.lat() && ne1.lng() == ne2.lng() && sw1.lat() == sw2.lat() && sw1.lng() == sw2.lng();
            };

            Map.prototype._draggingChanged = function (isDragging) {
                this.isDragging(isDragging);
            };

            Map.prototype._listenForDragging = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'dragstart', function () {
                    //this._log('Firing map dragstart event.');
                    _this._draggingChanged(true);
                    _this._log('Fired map dragstart event.');
                });
                google.maps.event.addListener(this.map, 'dragend', function () {
                    //this._log('Firing map dragend event.');
                    _this._draggingChanged(false);
                    _this._log('Fired map dragend event.');
                });
            };

            Map.prototype.addMarker = function (options) {
                options.map = this.map;
                var marker = new google.maps.Marker(options);
                this.markers.push(marker);
                return marker;
            };

            Map.prototype.clearMarkers = function (destroy) {
                if (typeof destroy === "undefined") { destroy = true; }
                var markers = this.markers().slice(0);
                $.each(markers, function (i, marker) {
                    marker.setMap(null);
                    if (destroy)
                        marker = null;
                });
                this.markers([]);
                return markers;
            };

            Map.prototype.replaceMarkers = function (markers, destroy) {
                if (typeof destroy === "undefined") { destroy = true; }
                var _this = this;
                var removed = this.clearMarkers(destroy);
                $.each(markers, function (i, marker) {
                    marker.setMap(_this.map);
                    _this.markers.push(marker);
                });
                return removed;
            };

            Map.prototype.openInfoWindowAtMarker = function (options, marker) {
                var infoWindow = new google.maps.InfoWindow(options);
                this.infoWindows.push(infoWindow);
                infoWindow.open(this.map, marker);
                return infoWindow;
            };

            Map.prototype.clearInfoWindows = function () {
                var infoWindows = this.infoWindows().slice(0);
                $.each(infoWindows, function (i, infoWindow) {
                    infoWindow.close();
                    infoWindow = null;
                });
                this.infoWindows([]);
                return infoWindows;
            };

            Map.prototype.closeInfoWindows = function () {
                var infoWindows = this.infoWindows();
                $.each(infoWindows, function (i, infoWindow) {
                    infoWindow.close();
                });
            };

            //replaceInfoWindows(infoWindows: google.maps.InfoWindow[]): google.maps.InfoWindow[] {
            //    var removed = this.removeInfoWindows();
            //    $.each(infoWindows, (i: number, infoWindow: google.maps.InfoWindow): void => {
            //        this.openInfoWindow(infoWindow);
            //    });
            //    return removed;
            //}
            //#endregion
            //#region Helpers
            Map.prototype.triggerResize = function () {
                var promise = $.Deferred();
                google.maps.event.trigger(this.map, 'resize');
                google.maps.event.addListenerOnce(this.map, 'idle', function () {
                    promise.resolve();
                });
                return promise;
            };

            Map._reducePrecision = function (value, precision) {
                if (typeof precision === "undefined") { precision = 0; }
                var reduced = value;
                if (precision) {
                    var text = value.toString();
                    var decimal = text.indexOf('.');
                    if (decimal >= 0) {
                        var fraction = text.substr(decimal, precision + 1);
                        text = text.substr(0, decimal) + fraction;
                        reduced = parseFloat(text);
                    }
                }
                return reduced;
            };

            Map.prototype._log = function (message) {
                var args = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    args[_i] = arguments[_i + 1];
                }
                if (!this._settings.log || !console)
                    return;
                console.log('MapWrapper: ' + message.format(args));
            };
            Map.defaultCenter = new google.maps.LatLng(0, 0);

            Map.emptyBounds = new google.maps.LatLngBounds(new google.maps.LatLng(1, 180), new google.maps.LatLng(-1, -180));
            return Map;
        })();
        GoogleMaps.Map = Map;
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;
})(App || (App = {}));
//# sourceMappingURL=Map.js.map
