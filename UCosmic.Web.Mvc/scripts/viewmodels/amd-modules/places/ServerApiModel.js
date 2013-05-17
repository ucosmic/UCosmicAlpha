define(["require", "exports"], function(require, exports) {
    var ServerCountryApiModel = (function () {
        function ServerCountryApiModel(code, name) {
            this.code = code;
            this.name = name;
        }
        return ServerCountryApiModel;
    })();
    exports.ServerCountryApiModel = ServerCountryApiModel;    
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
        function getAdmin2(places) {
            if(places && places.length > 0) {
                for(var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if(place.isAdmin2) {
                        return place;
                    }
                }
            }
            return null;
        }
        Utils.getAdmin2 = getAdmin2;
        function getAdmin3(places) {
            if(places && places.length > 0) {
                for(var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if(place.isAdmin3) {
                        return place;
                    }
                }
            }
            return null;
        }
        Utils.getAdmin3 = getAdmin3;
        function getSubAdmins(places) {
            var subAdmins = [];
            if(places && places.length > 0) {
                for(var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if(!place.isEarth && !place.isContinent && !place.isCountry && !place.isAdmin1 && !place.isAdmin2 && !place.isAdmin3) {
                        subAdmins[subAdmins.length] = place;
                    }
                }
            }
            return subAdmins;
        }
        Utils.getSubAdmins = getSubAdmins;
        function convertToLatLng(point) {
            return new gm.LatLng(point.latitude, point.longitude);
        }
        Utils.convertToLatLng = convertToLatLng;
        function convertToLatLngBounds(box) {
            return new gm.LatLngBounds(convertToLatLng(box.southWest), convertToLatLng(box.northEast));
        }
        Utils.convertToLatLngBounds = convertToLatLngBounds;
    })(exports.Utils || (exports.Utils = {}));
    var Utils = exports.Utils;
})
