/// <reference path="../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../google/Map.ts" />
var Activities;
(function (Activities) {
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView(activityData) {
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
                this.activityData = activityData;
                this.addMarkers();
            }
            PublicView.prototype.addMarkers = function () {
                var markers = [];
                $.each(this.activityData.Places, function (i, place) {
                    if (place.PlaceCenter.HasValue) {
                        var options = {
                            position: new google.maps.LatLng(place.PlaceCenter.Latitude, place.PlaceCenter.Longitude),
                            icon: {
                                url: "/images/icons/maps/mapPimple.png"
                            },
                            title: "test",
                            zIndex: 200
                        };
                        var marker = new google.maps.Marker(options);
                        markers.push(marker);
                    }
                });
                this._map.replaceMarkers(markers);
            };
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
