var Employees;
(function (Employees) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.d.ts" />
    /// <reference path="Routes.d.ts" />
    /// <reference path="Models.d.ts" />
    (function (Servers) {
        //export function ActivitiesPlaces(tenantDomain: any, data: ApiModels.ActivitiesPlacesInputModel, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> {
        //    var promise: JQueryDeferred<ApiModels.ActivitiesPlaceApiModel[]> = $.Deferred();
        //    settings = settings || {};
        //    settings.url = Routes.Api.Employees.Activities.places(tenantDomain);
        //    if (data) settings.data = data;
        //    $.ajax(settings)
        //        .done((response: ApiModels.ActivitiesPlaceApiModel[]): void => {
        //            promise.resolve(response);
        //        })
        //        .fail((xhr: JQueryXHR): void => {
        //            promise.reject(xhr);
        //        });
        //    return promise;
        //}
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

        //export function PeoplePlaces(tenantDomain: any, data: ApiModels.PeoplePlacesInputModel, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> {
        //    var promise: JQueryDeferred<ApiModels.PeoplePlaceApiModel[]> = $.Deferred();
        //    settings = settings || {};
        //    settings.url = Routes.Api.Employees.People.places(tenantDomain);
        //    if (data) settings.data = data;
        //    $.ajax(settings)
        //        .done((response: ApiModels.PeoplePlaceApiModel[]): void => {
        //            promise.resolve(response);
        //        })
        //        .fail((xhr: JQueryXHR): void => {
        //            promise.reject(xhr);
        //        });
        //    return promise;
        //}
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
    })(Employees.Servers || (Employees.Servers = {}));
    var Servers = Employees.Servers;
})(Employees || (Employees = {}));
