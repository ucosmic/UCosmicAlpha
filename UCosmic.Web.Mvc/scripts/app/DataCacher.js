/// <reference path="../typings/jquery/jquery.d.ts" />
var App;
(function (App) {
    var DataCacher = (function () {
        function DataCacher(loader) {
            this.loader = loader;
            this._promise = $.Deferred();
            this._isLoading = false;
        }
        DataCacher.prototype.ready = function () {
            var _this = this;
            if (!this._isLoading) {
                this._isLoading = true;
                this.loader().done(function (data) {
                    _this.cached = data;
                    _this._promise.resolve(_this.cached);
                }).fail(function (xhr) {
                    _this._promise.reject();
                });
            }
            return this._promise;
        };

        DataCacher.prototype.reload = function () {
            this._promise = $.Deferred();
            this.cached = undefined;
            this._isLoading = false;
            return this.ready();
        };
        return DataCacher;
    })();
    App.DataCacher = DataCacher;
})(App || (App = {}));
//# sourceMappingURL=DataCacher.js.map
