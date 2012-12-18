var ViewModels;
(function (ViewModels) {
    (function (Countries) {
        var ServerApiModel = (function () {
            function ServerApiModel(code, name) {
                this.code = code;
                this.name = name;
            }
            return ServerApiModel;
        })();
        Countries.ServerApiModel = ServerApiModel;        
    })(ViewModels.Countries || (ViewModels.Countries = {}));
    var Countries = ViewModels.Countries;

})(ViewModels || (ViewModels = {}));

