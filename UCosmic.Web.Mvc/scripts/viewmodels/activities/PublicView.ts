/// <reference path="../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../google/Map.ts" />

module Activities.ViewModels {

    export class PublicView {

        constructor(activityData) {
            this.activityData = activityData;
            this.addMarkers();
        }
        activityData
        lat = 15;
        lng = 6;
        zoom = -1;
        private _map = new App.GoogleMaps.Map(
            'map-canvas',
            { // options
                center: new google.maps.LatLng(this.lat, this.lng),
                zoom: this.zoom, // zoom out
                streetViewControl: false,
                panControl: false,
                draggable: false,
                zoomControl: false,
                disableDefaultUI: true,
            },
            { // settings
                maxPrecision: 8,
            }
            );
        private addMarkers() {
            var markers: google.maps.Marker[] = [];
            $.each(this.activityData.Places, (i: number, place: any): void => {
                if (place.PlaceCenter.HasValue) {
                    var options: google.maps.MarkerOptions = {
                        position: new google.maps.LatLng(place.PlaceCenter.Latitude, place.PlaceCenter.Longitude),
                        icon: {
                            url: "/images/icons/maps/mapPimple.png",
                        },
                        title: "test",
                        zIndex: 200,
                    };
                    var marker = new google.maps.Marker(options);
                    markers.push(marker)
                }
            });
            this._map.replaceMarkers(markers);
        }
    }
}