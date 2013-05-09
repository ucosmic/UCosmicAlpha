define(["require", "exports"], function(require, exports) {
    var ServerApiModel = (function () {
        function ServerApiModel(code, name) {
            this.code = code;
            this.name = name;
        }
        return ServerApiModel;
    })();
    exports.ServerApiModel = ServerApiModel;    
})
