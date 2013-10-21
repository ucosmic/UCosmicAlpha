var App;
(function (App) {
    /// <reference path="../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../typings/jquery/jquery.d.ts" />
    /// <reference path="../typings/knockout/knockout.d.ts" />
    (function (GoogleMaps) {
        var Map = (function () {
            function Map(elementOrId, options, settings) {
                this.created = $.Deferred();
                //#endregion
                //#region Viewport Properties & Events
                //#region Center (Latitude & Longitude)
                // initial values for lat & lng are based on the options used to create the map
                this.lat = ko.observable(this._options.center ? this._options.center.lat() : Map.defaultCenter.lat());
                this.lng = ko.observable(this._options.center ? this._options.center.lng() : Map.defaultCenter.lng());
                //#endregion
                //#region Zoom
                // initial values for lat & lng are based on the options used to create the map
                this.zoom = ko.observable(this._options.zoom || this._options.zoom == 0 ? this._options.zoom : 1);
                //#endregion
                //#region Bounds (North East Soutn West)
                // initial values for lat & lng are based on the options used to create the map
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

                if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                    this.create();
                }
            }
            Map.prototype.create = function () {
                var _this = this;
                this.created = $.Deferred();
                if (!this.map) {
                    // first set up the options
                    var options = this._options;

                    if (!options.center)
                        options.center = Map.defaultCenter;
                    if (!options.zoom)
                        options.zoom = 1;

                    if (!options.scrollwheel)
                        options.scrollwheel = false;

                    // construct the map to kick off initialization
                    this.map = new google.maps.Map(this._element, options);

                    // listen for the map to become idle before resolving the promize
                    google.maps.event.addListenerOnce(this.map, 'idle', function () {
                        _this._listenForCenterChange();
                        _this._listenForZoomChange();
                        _this._listenForBoundsChange();
                        _this.created.resolve();
                    });
                } else {
                    this.created.resolve();
                }
                return this.created;
            };

            Map.prototype._centerChanged = function () {
                var center = this.map.getCenter();
                this.lat(center.lat());
                this.lng(center.lng());
            };

            Map.prototype._listenForCenterChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'center_changed', function () {
                    _this._centerChanged();
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

            Map.prototype._boundsChanged = function () {
                var bounds = this.map.getBounds();
                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                this.north(northEast.lat());
                this.east(northEast.lng());
                this.south(southWest.lat());
                this.west(southWest.lng());
            };

            Map.prototype._listenForBoundsChange = function () {
                var _this = this;
                google.maps.event.addListener(this.map, 'bounds_changed', function () {
                    _this._centerChanged();
                });
            };
            Map.defaultCenter = new google.maps.LatLng(0, 0);
            return Map;
        })();
        GoogleMaps.Map = Map;
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;
})(App || (App = {}));
