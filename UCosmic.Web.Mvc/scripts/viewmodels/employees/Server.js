var Employees;
(function (Employees) {
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="ApiModels.d.ts" />
    (function (Servers) {
        function ActivityPlaces(tenantDomain, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = '/api/{0}/activities/places/'.format(tenantDomain);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function () {
                promise.reject();
            });
            return promise;
        }
        Servers.ActivityPlaces = ActivityPlaces;
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
