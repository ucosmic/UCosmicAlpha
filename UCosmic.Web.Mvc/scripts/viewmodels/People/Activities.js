/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
var modelData;
var People;
(function (People) {
    (function (ViewModels) {
        var ActivityInputModel = (function () {
            function ActivityInputModel() {
                this.pageSize = ko.observable(modelData.PageSize);
                this.pageNumber = ko.observable((modelData.PageNumber != null) ? modelData.PageNumber : 1);
                this.keyword = ko.observable(modelData.Keyword);
                this.countryCode = ko.observable(modelData.CountryCode);
                this.prevEnabled = ko.observable(true);
                this.nextEnabled = ko.observable(true);
                this.orderBy = ko.observable();
                if (this.pageNumber() >= modelData.PageCount) {
                    this.nextEnabled(false);
                }
                if (this.pageNumber() == 1) {
                    this.prevEnabled(false);
                }
            }
            ActivityInputModel.prototype.nextPage = function (model, event) {
                event.preventDefault();
                this.pageNumber(this.pageNumber() + 1);
                this.keywordSearch();
            };

            ActivityInputModel.prototype.prevPage = function (model, event) {
                event.preventDefault();
                this.pageNumber(this.pageNumber() - 1);
                this.keywordSearch();
            };

            ActivityInputModel.prototype.keywordSearch = function () {
                //alert("test");
                //this.search();
                this.$form.submit();
            };
            return ActivityInputModel;
        })();
        ViewModels.ActivityInputModel = ActivityInputModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
