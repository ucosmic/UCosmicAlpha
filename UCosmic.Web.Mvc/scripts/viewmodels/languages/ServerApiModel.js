var ViewModels;
(function (ViewModels) {
    (function (Languages) {
        var ServerApiModel = (function () {
            function ServerApiModel(code, name) {
                this.code = code;
                this.name = name;
            }
            return ServerApiModel;
        })();
        Languages.ServerApiModel = ServerApiModel;        
    })(ViewModels.Languages || (ViewModels.Languages = {}));
    var Languages = ViewModels.Languages;
})(ViewModels || (ViewModels = {}));
