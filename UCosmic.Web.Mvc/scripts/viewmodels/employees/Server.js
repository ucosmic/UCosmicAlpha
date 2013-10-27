var Employees;
(function (Employees) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.d.ts" />
    /// <reference path="Routes.d.ts" />
    /// <reference path="Models.d.ts" />
    (function (Servers) {
        function ActivitiesPlaces(tenantDomain, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Activities.places(tenantDomain);
            if (data)
                settings.data = data;
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.ActivitiesPlaces = ActivitiesPlaces;

        function ActivitiesSummary(tenantDomain, settings) {
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
        Servers.ActivitiesSummary = ActivitiesSummary;

        function PeoplePlaces(tenantDomain, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.People.places(tenantDomain);
            if (data)
                settings.data = data;
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.PeoplePlaces = PeoplePlaces;
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
