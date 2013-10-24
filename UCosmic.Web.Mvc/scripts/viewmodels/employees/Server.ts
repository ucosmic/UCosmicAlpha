/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="ApiModels.d.ts" />

module Employees.Servers {
    export function ActivityPlaces(tenantDomain: any, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ActivityPlaceApiModel[]> {
        var promise: JQueryDeferred<ApiModels.ActivityPlaceApiModel[]> = $.Deferred();
        settings = settings || {};
        settings.url = '/api/{0}/activities/places/'.format(tenantDomain)
        $.ajax(settings)
            .done((response: ApiModels.ActivityPlaceApiModel[]): void => {
                promise.resolve(response);
            })
            .fail((): void => {
                promise.reject();
            });
        return promise;
    }
}