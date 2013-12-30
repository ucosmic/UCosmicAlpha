module Activities.ViewModels {

    export class PublicView {

        constructor(activityData, imagePimpleUrl) {
            this.activityData = activityData;
            this.addMarkers();
            this.imagePimpleUrl = imagePimpleUrl;
        }
        imagePimpleUrl
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
                    var myLatlng = new google.maps.LatLng(place.PlaceCenter.Latitude, place.PlaceCenter.Longitude);
                    var shape = { coords: [7,7,7], type: 'circle' }
                    var image = {
                        url: '/images/icons/maps/mapPimple.png', //this.imagePimpleUrl
                        size: new google.maps.Size(14, 14), 
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(7, 7)
                    }
                    var options: google.maps.MarkerOptions = {
                        position: myLatlng,
                        icon: image,
                        shape: shape,
                        title: place.PlaceName,
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