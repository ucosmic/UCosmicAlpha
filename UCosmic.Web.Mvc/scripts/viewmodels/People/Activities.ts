/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
var modelData;
module People.ViewModels {

    export class ActivityInputModel {
        constructor() {
            if (this.pageNumber() >= modelData.PageCount) {
                this.nextEnabled(false);
            }
            if (this.pageNumber() == 1) {
                this.prevEnabled(false);
            }
        }

        $form: JQuery;
        pageSize = ko.observable(modelData.PageSize);
        pageNumber = ko.observable((modelData.PageNumber != null) ? modelData.PageNumber : 1);
        keyword = ko.observable(modelData.Keyword);
        countryCode = ko.observable(modelData.CountryCode);
        prevEnabled = ko.observable(true);
        nextEnabled = ko.observable(true);
        orderBy = ko.observable();

        nextPage(model, event): void {
            event.preventDefault();
            this.pageNumber(this.pageNumber() + 1);
            this.keywordSearch();
        }

        prevPage(model, event): void {
            event.preventDefault();
            this.pageNumber(this.pageNumber() - 1);
            this.keywordSearch();
        }

        keywordSearch(): void {
            //alert("test");
            //this.search();
            this.$form.submit();
        }

        //search(): void{
        //    this.$form.submit();
        //}
    }

}
