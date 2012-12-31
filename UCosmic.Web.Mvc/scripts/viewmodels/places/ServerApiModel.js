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
        })(Places.Utils || (Places.Utils = {}));
        var Utils = Places.Utils;

    })(ViewModels.Places || (ViewModels.Places = {}));
    var Places = ViewModels.Places;

})(ViewModels || (ViewModels = {}));

