/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="Routes.d.ts" />
/// <reference path="Models.d.ts" />
var Employees;
(function (Employees) {
    (function (Servers) {
        function GetEmployeesPlaces(tenantId, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.places(tenantId);
            if (data)
                settings.data = data;
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetEmployeesPlaces = GetEmployeesPlaces;

        function GetActivityCounts(tenantId, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Activities.counts(tenantId);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetActivityCounts = GetActivityCounts;

        function GetSettingsByPerson(personId, settings) {
            if (typeof personId === "undefined") { personId = 0; }
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Settings.byPerson(personId);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                if (xhr.status === 404)
                    promise.resolve(null);
                else
                    promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetSettingsByPerson = GetSettingsByPerson;
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
