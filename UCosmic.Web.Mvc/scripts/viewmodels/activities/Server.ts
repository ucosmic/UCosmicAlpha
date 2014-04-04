module Activities.Servers {

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
}