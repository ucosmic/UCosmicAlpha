module Establishments.Servers {

    export function Single(establishmentId: number, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ScalarEstablishment> {
        var deferred: JQueryDeferred<ApiModels.ScalarEstablishment[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Establishments.single(establishmentId);
        $.ajax(settings)
            .done((response: ApiModels.ScalarEstablishment): void => {
                deferred.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                deferred.reject(xhr);
            });
        return deferred.promise();
    }

    export function GetChildren(parentId: number, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.ScalarEstablishment[]> {
        var deferred: JQueryDeferred<ApiModels.ScalarEstablishment[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Establishments.children(parentId);
        $.ajax(settings)
            .done((response: ApiModels.ScalarEstablishment[]): void => {
                deferred.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                deferred.reject(xhr);
            });
        return deferred.promise();
    }

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