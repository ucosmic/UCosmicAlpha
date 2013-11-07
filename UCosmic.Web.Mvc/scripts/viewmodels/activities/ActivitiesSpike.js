var Activities;
(function (Activities) {
    /// <reference path="../../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../google/Map.ts" />
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView() {
                this.lat = 15;
                this.lng = 6;
                this.zoom = -1;
                this._map = new App.GoogleMaps.Map('map-canvas', {
                    center: new google.maps.LatLng(this.lat, this.lng),
                    zoom: this.zoom,
                    streetViewControl: false,
                    panControl: false,
                    draggable: false,
                    zoomControl: false,
                    disableDefaultUI: true
                }, {
                    maxPrecision: 8
                });
            }
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
