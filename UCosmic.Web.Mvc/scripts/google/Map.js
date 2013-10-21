var App;
(function (App) {
    /// <reference path="../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../typings/jquery/jquery.d.ts" />
    /// <reference path="../typings/knockout/knockout.d.ts" />
    (function (GoogleMaps) {
        var Map = (function () {
            function Map(elementOrId, options, settings) {
                this._promise = $.Deferred();
                //#endregion
                //#region Viewport Properties & Events
                //#region Idle
                // initial values for lat & lng are based on the options used to create the map
                this.idles = ko.observable(0);
                //#endregion
                //#region Bounds (North East Soutn West)
                this.north = ko.observable();
                this.south = ko.observable();
                this.east = ko.observable();
                this.west = ko.observable();
                if (typeof elementOrId === 'string') {
                    this._element = document.getElementById(elementOrId);
                } else {
                    this._element = elementOrId;
                }

                // stash the settings and options
                this._options = options || {};
                this._settings = settings || {};

                // initialize observables
                this.zoom = ko.observable(this._options.zoom || this._options.zoom == 0 ? this._options.zoom : 1);
                this.lat = ko.observable(this._options.center ? this._reducePrecision(this._options.center.lat()) : Map.defaultCenter.lat());
                this.lng = ko.observable(this._options.center ? this._reducePrecision(this._options.center.lng()) : Map.defaultCenter.lng());

                if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                    this.ready();
                }
            }
            Map.prototype.ready = function () {
                var _this = this;
                if (!this.map) {
                    this._create();

                    // listen for the map to become idle before resolving the promise
                    google.maps.event.addListenerOnce(this.map, 'idle', function () {
                        _this._listenForCenterChange();
                        _this._listenForZoomChange();
                        _this._listenForBoundsChange();
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

            Map.prototype._idled = function () {
                var idles = this.idles();
                this.idles(++idles);
            };

            Map.prototype._listenForIdled = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'idle', function () {
                    _this._idled();
                });
            };

            Map.prototype._zoomChanged = function () {
                var zoom = this.map.getZoom();
                this.zoom(zoom);
            };

            Map.prototype._listenForZoomChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'zoom_changed', function () {
                    _this._zoomChanged();
                });
            };

            Map.prototype._centerChanged = function () {
                var center = this.map.getCenter();
                this.lat(this._reducePrecision(center.lat()));
                this.lng(this._reducePrecision(center.lng()));
            };

            Map.prototype._listenForCenterChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'center_changed', function () {
                    _this._centerChanged();
                });
            };

            Map.prototype._boundsChanged = function () {
                var bounds = this.map.getBounds();
                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                this.north(this._reducePrecision(northEast.lat()));
                this.east(this._reducePrecision(northEast.lng()));
                this.south(this._reducePrecision(southWest.lat()));
                this.west(this._reducePrecision(southWest.lng()));
            };

            Map.prototype._listenForBoundsChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'bounds_changed', function () {
                    _this._boundsChanged();
                });
            };

            //#endregion
            //#endregion
            //#region Helpful Shortcuts
            Map.prototype.triggerResize = function () {
                google.maps.event.trigger(this.map, 'resize');
            };

            Map.prototype._reducePrecision = function (value) {
                var reduced = value;
                var precision = this._settings.maxPrecision;
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
            Map.defaultCenter = new google.maps.LatLng(0, 0);
            return Map;
        })();
        GoogleMaps.Map = Map;
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;
})(App || (App = {}));
