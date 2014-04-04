var Activities;
(function (Activities) {
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
    })(Activities.Servers || (Activities.Servers = {}));
    var Servers = Activities.Servers;
})(Activities || (Activities = {}));
