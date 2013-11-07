/// <reference path="../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../google/Map.ts" />
module Activities.ViewModels {


    export class PublicView {
        constructor() {

        }
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
                //log: true,
            }
            );
    }
}