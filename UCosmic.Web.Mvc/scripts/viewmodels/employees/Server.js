var Employees;
(function (Employees) {
    var Servers;
    (function (Servers) {
        function GetEmployeesPlaces(tenantId, data, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.places(tenantId);
            if (data)
                settings.data = data;
            $.ajax(settings)
                .done(function (response) {
                promise.resolve(response);
            })
                .fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetEmployeesPlaces = GetEmployeesPlaces;
        function GetActivityCounts(tenantId, settings) {
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Activities.counts(tenantId);
            $.ajax(settings)
                .done(function (response) {
                promise.resolve(response);
            })
                .fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetActivityCounts = GetActivityCounts;
        function GetSettingsByPerson(personId, settings) {
            if (personId === void 0) { personId = 0; }
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.Employees.Settings.byPerson(personId);
            $.ajax(settings)
                .done(function (response) {
                promise.resolve(response);
            })
                .fail(function (xhr) {
                if (xhr.status === 404)
                    promise.resolve(null);
                else
                    promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetSettingsByPerson = GetSettingsByPerson;
    })(Servers = Employees.Servers || (Employees.Servers = {}));
})(Employees || (Employees = {}));
