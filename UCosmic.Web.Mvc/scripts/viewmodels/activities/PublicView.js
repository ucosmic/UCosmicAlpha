var Activities;
(function (Activities) {
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView(activityData, imagePimpleUrl) {
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
                this.imagePimpleUrl = imagePimpleUrl;
            }
            PublicView.prototype.addMarkers = function () {
                var markers = [];
                $.each(this.activityData.Places, function (i, place) {
                    if (place.PlaceCenter.HasValue) {
                        var myLatlng = new google.maps.LatLng(place.PlaceCenter.Latitude, place.PlaceCenter.Longitude);
                        var shape = { coords: [7, 7, 7], type: 'circle' };
                        var image = {
                            url: '/images/icons/maps/mapPimple.png',
                            size: new google.maps.Size(14, 14),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(7, 7)
                        };
                        var options = {
                            position: myLatlng,
                            icon: image,
                            shape: shape,
                            title: place.PlaceName,
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
