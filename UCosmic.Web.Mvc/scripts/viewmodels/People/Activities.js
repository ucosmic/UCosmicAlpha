/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../places/ApiModels.d.ts" />
var modelData;
var People;
(function (People) {
    (function (ViewModels) {
        var ActivityInputModel = (function () {
            function ActivityInputModel() {
                this.pageSize = ko.observable(modelData.PageSize);
                this.pageNumber = ko.observable((modelData.PageNumber != null) ? modelData.PageNumber : 1);
                this.keyword = ko.observable(modelData.Keyword);
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                this.prevEnabled = ko.observable(true);
                this.nextEnabled = ko.observable(true);
                this.orderBy = ko.observable();
                this.hasInitialized = false;
                this.optionsEnabled = ko.observable(false);
                this._setupCountryDropDown();
                if (this.pageNumber() >= modelData.PageCount) {
                    this.nextEnabled(false);
                }
                if (this.pageNumber() == 1) {
                    this.prevEnabled(false);
                }
                this.orderBy.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                }, this);
                this.pageSize.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                    this.optionsEnabled(true);
                }, this);
                this.countryCode.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.hasInitialized = true;
                        this.search();
                    }
                }, this);
            }
            ActivityInputModel.prototype.nextPage = function (model, event) {
                event.preventDefault();
                this.pageNumber(this.pageNumber() + 1);
                this.search();
            };

            ActivityInputModel.prototype.prevPage = function (model, event) {
                event.preventDefault();
                this.pageNumber(this.pageNumber() - 1);
                this.search();
            };

            ActivityInputModel.prototype.search = function () {
                this.$form.submit();
            };

            // countries dropdown
            ActivityInputModel.prototype._setupCountryDropDown = function () {
                var _this = this;
                ko.computed(function () {
                    // populate countryCode based on last value when paging backwards
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        // setup empty value
                        var emptyValue = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        _this.countries(response);

                        _this.countryCode(modelData.CountryCode);
                        _this.hasInitialized = true;
                    });
                }).extend({ throttle: 1 });
            };
            return ActivityInputModel;
        })();
        ViewModels.ActivityInputModel = ActivityInputModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
