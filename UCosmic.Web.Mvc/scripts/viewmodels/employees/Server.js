var Employees;
(function (Employees) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.d.ts" />
    /// <reference path="Routes.d.ts" />
    /// <reference path="Models.d.ts" />
    (function (Servers) {
        function EmployeesPlaces(tenantDomain, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.places(tenantDomain);
            if (data)
                settings.data = data;
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.EmployeesPlaces = EmployeesPlaces;

        function ActivityCounts(tenantDomain, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Activities.summary(tenantDomain);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.ActivityCounts = ActivityCounts;
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
