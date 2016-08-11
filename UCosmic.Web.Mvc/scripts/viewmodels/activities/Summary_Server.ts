module Employees.Servers {

    export function GetActivityCounts(tenantId: any, settings?: JQueryAjaxSettings): JQueryPromise<ApiModels.EmployeeActivityCounts> {
        var promise: JQueryDeferred<ApiModels.EmployeeActivityCounts> = $.Deferred();
        settings = settings || {};
        settings.url = Routes.Api.Employees.Activities.counts(tenantId);
        $.ajax(settings)
            .done((response: ApiModels.EmployeeActivityCounts): void => {
            promise.resolve(response);
        })
            .fail((xhr: JQueryXHR): void => {
            promise.reject(xhr);
        }); 
        return promise; 
    }
}