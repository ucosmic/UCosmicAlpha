var Employees;
(function (Employees) {
    var Servers;
    (function (Servers) {
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
    })(Servers = Employees.Servers || (Employees.Servers = {}));
})(Employees || (Employees = {}));
