var Establishments;
(function (Establishments) {
    var Servers;
    (function (Servers) {
        function Single(establishmentId, settings) {
            var deferred = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Establishments.single(establishmentId);
            $.ajax(settings).done(function (response) {
                deferred.resolve(response);
            }).fail(function (xhr) {
                deferred.reject(xhr);
            });
            return deferred.promise();
        }
        Servers.Single = Single;
        function GetChildren(parentId, settings) {
            var deferred = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Establishments.children(parentId);
            $.ajax(settings).done(function (response) {
                deferred.resolve(response);
            }).fail(function (xhr) {
                deferred.reject(xhr);
            });
            return deferred.promise();
        }
        Servers.GetChildren = GetChildren;
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
    })(Servers = Establishments.Servers || (Establishments.Servers = {}));
})(Establishments || (Establishments = {}));
