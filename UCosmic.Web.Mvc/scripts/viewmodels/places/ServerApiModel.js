var ViewModels;
(function (ViewModels) {
    (function (Places) {
        var ServerCountryApiModel = (function () {
            function ServerCountryApiModel(code, name) {
                this.code = code;
                this.name = name;
            }
            return ServerCountryApiModel;
        })();
        Places.ServerCountryApiModel = ServerCountryApiModel;        
        (function (Utils) {
            var gm = google.maps;
            function getPlaceById(places, id) {
                if(places && places.length > 0) {
                    for(var i = 0; i < places.length; i++) {
                        var place = places[i];
                        if(place.id == id) {
                            return place;
                        }
                    }
                }
                return null;
            }
            Utils.getPlaceById = getPlaceById;
            function getContinent(places) {
                if(places && places.length > 0) {
                    for(var i = 0; i < places.length; i++) {
                        var place = places[i];
                        if(place.isContinent) {
                            return place;
                        }
                    }
                }
                return null;
            }
            Utils.getContinent = getContinent;
            function getCountry(places) {
                if(places && places.length > 0) {
                    for(var i = 0; i < places.length; i++) {
                        var place = places[i];
                        if(place.isCountry) {
                            return place;
                        }
                    }
                }
                return null;
            }
            Utils.getCountry = getCountry;
            function getAdmin1(places) {
                if(places && places.length > 0) {
                    for(var i = 0; i < places.length; i++) {
                        var place = places[i];
                        if(place.isAdmin1) {
                            return place;
                        }
                    }
                }
                return null;
            }
            Utils.getAdmin1 = getAdmin1;
            function convertToLatLng(point) {
                return new gm.LatLng(point.latitude, point.longitude);
            }
            Utils.convertToLatLng = convertToLatLng;
            function convertToLatLngBounds(box) {
                return new gm.LatLngBounds(convertToLatLng(box.southWest), convertToLatLng(box.northEast));
            }
            Utils.convertToLatLngBounds = convertToLatLngBounds;
        })(Places.Utils || (Places.Utils = {}));
        var Utils = Places.Utils;
    })(ViewModels.Places || (ViewModels.Places = {}));
    var Places = ViewModels.Places;
})(ViewModels || (ViewModels = {}));
