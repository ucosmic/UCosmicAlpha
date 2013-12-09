import gm = google.maps;

module Places.Utils {

    export function getPlaceById(places: ApiModels.Place[], id: number): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.id == id) return place;
            }
        }
        return null;
    }

    export function getContinent(places: ApiModels.Place[]): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.isContinent) return place;
            }
        }
        return null;
    }

    export function getCountry(places: ApiModels.Place[]): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.isCountry) return place;
            }
        }
        return null;
    }

    export function getAdmin1(places: ApiModels.Place[]): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.isAdmin1) return place;
            }
        }
        return null;
    }

    export function getAdmin2(places: ApiModels.Place[]): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.isAdmin2) return place;
            }
        }
        return null;
    }

    export function getAdmin3(places: ApiModels.Place[]): ApiModels.Place {
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (place.isAdmin3) return place;
            }
        }
        return null;
    }

    export function getSubAdmins(places: ApiModels.Place[]): ApiModels.Place[] {
        var subAdmins: ApiModels.Place[] = [];
        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                if (!place.isEarth && !place.isContinent && !place.isCountry &&
                    !place.isAdmin1 && !place.isAdmin2 && !place.isAdmin3)
                    subAdmins[subAdmins.length] = place;
            }
        }
        return subAdmins;
    }

    export function convertToLatLng(point: ApiModels.Point): gm.LatLng {
        return new gm.LatLng(point.latitude, point.longitude);
    }
        
    export function convertToLatLngBounds(box: ApiModels.Box): gm.LatLngBounds {
        return new gm.LatLngBounds(convertToLatLng(box.southWest),
            convertToLatLng(box.northEast));
    }
}