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
    })(ViewModels.Places || (ViewModels.Places = {}));
    var Places = ViewModels.Places;

})(ViewModels || (ViewModels = {}));

