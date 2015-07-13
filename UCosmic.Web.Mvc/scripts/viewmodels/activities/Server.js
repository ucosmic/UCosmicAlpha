var Activities;
(function (Activities) {
    var Servers;
    (function (Servers) {
        function Single(establishmentId, settings) {
            var deferred = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Establishments.single(establishmentId);
            $.ajax(settings)
                .done(function (response) {
                deferred.resolve(response);
            })
                .fail(function (xhr) {
                deferred.reject(xhr);
            });
            return deferred.promise();
        }
        Servers.Single = Single;
        function GetChildren(parentId, settings) {
            var deferred = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Establishments.children(parentId);
            $.ajax(settings)
                .done(function (response) {
                deferred.resolve(response);
            })
                .fail(function (xhr) {
                deferred.reject(xhr);
            });
            return deferred.promise();
        }
        Servers.GetChildren = GetChildren;
    })(Servers = Activities.Servers || (Activities.Servers = {}));
})(Activities || (Activities = {}));
