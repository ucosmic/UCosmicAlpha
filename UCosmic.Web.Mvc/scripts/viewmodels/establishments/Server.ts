/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="ApiModels.d.ts" />
/// <reference path="Routes.d.ts" />

module Establishments.Servers {

    export function GetOffspring(ancestorId: number, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ScalarEstablishment[]> {
        var promise: JQueryDeferred<ApiModels.ScalarEstablishment[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Establishments.offspring(ancestorId);
        $.ajax(settings)
            .done((response: ApiModels.ScalarEstablishment[]): void => {
                promise.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }
}