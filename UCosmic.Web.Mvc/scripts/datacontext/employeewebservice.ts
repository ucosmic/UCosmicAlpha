/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="iemployee.ts" />
/// <reference path="../app/Routes.ts" />

module DataContext {
    export class EmployeeWebService extends IEmployee {

        constructor(inId: number) {
            super(inId);
        }

        /*override*/ GetFacultyRanks(): JQueryDeferred {
            var deferred: JQueryDeferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/facultyranks/",
                  function (data: any, textStatus: string, jqXHR: JQueryXHR) {
                      deferred.resolve(data);
                  }).fail(function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                      // the deferred will only invoke failure callbacks if one is specified
                      deferred.reject(jqXHR, textStatus, errorThrown);
                  });
            return deferred;
        }

        /*override*/ Get(): JQueryDeferred {
            var deferred: JQueryDeferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString(),
                 function (data: any, textStatus: string, jqXHR: JQueryXHR): void {
                     deferred.resolve(data);
                 })
                .fail(function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                    // the deferred will only invoke failure callbacks if one is specified
                    deferred.reject(jqXHR, textStatus, errorThrown);
                });
            return deferred;
        }

        /*override*/ Put(dataOut: any): JQueryDeferred {
            var deferred: JQueryDeferred = $.Deferred();
            $.ajax({
                data: dataOut,
                type: "PUT",
                success: function (data: any, textStatus: string, jqXHR: JQueryXHR) {
                    deferred.resolve(data)
                },
                error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                    deferred.reject(jqXHR, textStatus, errorThrown);
                },
                url: this.GetBaseUrl() + "/" + this.GetId().toString()
            });
            return deferred;
        }

        ///*override*/ GetSalutations(): JQueryDeferred {
        //    var deferred: JQueryDeferred = $.Deferred();
        //    //$.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/salutations/",
        //    $.getJSON(App.Routes.WebApi.People.Names.Salutations.get(),
        //         function (data, textStatus, jqXHR) {
        //             deferred.resolve(data);
        //         });
        //    return deferred;
        //}
        //
        ///*override*/ GetSuffixes(): JQueryDeferred {
        //    var deferred: JQueryDeferred = $.Deferred();
        //    //$.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/suffixes/",
        //    $.getJSON(App.Routes.WebApi.People.Names.Suffixes.get(),
        //         function (data, textStatus, jqXHR) {
        //             deferred.resolve(data);
        //         });
        //    return deferred;
        //}

    }
}