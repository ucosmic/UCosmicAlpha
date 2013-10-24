var Employees;
(function (Employees) {
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="Models.d.ts" />
    (function (Servers) {
        function ActivityPlaces(tenantDomain, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = '/api/{0}/activities/places/'.format(tenantDomain);
            if (data)
                settings.data = data;
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function () {
                promise.reject();
            });
            return promise;
        }
        Servers.ActivityPlaces = ActivityPlaces;

        function ActivitiesSummary(tenantDomain, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = '/api/{0}/activities/summary/'.format(tenantDomain);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function () {
                promise.reject();
            });
            return promise;
        }
        Servers.ActivitiesSummary = ActivitiesSummary;
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
