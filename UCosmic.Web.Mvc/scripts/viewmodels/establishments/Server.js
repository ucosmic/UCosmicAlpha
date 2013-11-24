var Establishments;
(function (Establishments) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.d.ts" />
    /// <reference path="ApiModels.d.ts" />
    /// <reference path="Routes.d.ts" />
    (function (Servers) {
        function GetOffspring(ancestorId, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Establishments.offspring(ancestorId);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetOffspring = GetOffspring;
    })(Establishments.Servers || (Establishments.Servers = {}));
    var Servers = Establishments.Servers;
})(Establishments || (Establishments = {}));
