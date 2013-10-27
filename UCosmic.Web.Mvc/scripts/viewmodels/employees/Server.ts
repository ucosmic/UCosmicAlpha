/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="Routes.d.ts" />
/// <reference path="Models.d.ts" />

module Employees.Servers {

    export function ActivitiesPlaces(tenantDomain: any, data: ApiModels.ActivitiesPlacesInputModel, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ActivitiesPlaceApiModel[]> {
        var promise: JQueryDeferred<ApiModels.ActivitiesPlaceApiModel[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Employees.Activities.places(tenantDomain);
        if (data) settings.data = data;
        $.ajax(settings)
            .done((response: ApiModels.ActivitiesPlaceApiModel[]): void => {
                promise.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }

    export function ActivitiesSummary(tenantDomain: any, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ActivitiesSummary> {
        var promise: JQueryDeferred<ApiModels.ActivitiesSummary> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Employees.Activities.summary(tenantDomain);
        $.ajax(settings)
            .done((response: ApiModels.ActivitiesSummary): void => {
                promise.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }

    export function PeoplePlaces(tenantDomain: any, data: ApiModels.PeoplePlacesInputModel, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.PeoplePlaceApiModel[]> {
        var promise: JQueryDeferred<ApiModels.PeoplePlaceApiModel[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Employees.People.places(tenantDomain);
        if (data) settings.data = data;
        $.ajax(settings)
            .done((response: ApiModels.PeoplePlaceApiModel[]): void => {
                promise.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }
}