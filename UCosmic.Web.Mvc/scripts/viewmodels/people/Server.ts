/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="../employees/Models.d.ts" />
/// <reference path="Models.d.ts" />
/// <reference path="Routes.d.ts" />

module People.Servers {

    export function GetAffiliationsByPerson(personId: number = 0, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.Affiliation[]> {
        var promise: JQueryDeferred<ApiModels.Affiliation[]> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.People.Affiliations.plural(personId);
        $.ajax(settings)
            .done((response: ApiModels.Affiliation[]): void => {
                promise.resolve(response);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }

    export function PutAffiliation(data: ApiModels.AffiliationPut, establishmentId: number, personId: number = 0, settings?: JQueryAjaxSettings): JQueryPromise<JQueryXHR> {
        var promise: JQueryDeferred<JQueryXHR> = $.Deferred();
        settings = settings || {};
        settings.type = 'PUT';
        settings.url = Routes.Api.People.Affiliations.single(establishmentId, personId);
        settings.data = data;
        $.ajax(settings)
            .done((response: any, status: string, xhr: JQueryXHR): void => {
                promise.resolve(xhr);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }

    export function DeleteAffiliation(establishmentId: number, personId: number = 0, settings?: JQueryAjaxSettings): JQueryPromise<JQueryXHR> {
        var promise: JQueryDeferred<JQueryXHR> = $.Deferred();
        settings = settings || {};
        settings.type = 'DELETE';
        settings.url = Routes.Api.People.Affiliations.single(establishmentId, personId);
        $.ajax(settings)
            .done((response: any, status: string, xhr: JQueryXHR): void => {
                promise.resolve(xhr);
            })
            .fail((xhr: JQueryXHR): void => {
                promise.reject(xhr);
            });
        return promise;
    }
}