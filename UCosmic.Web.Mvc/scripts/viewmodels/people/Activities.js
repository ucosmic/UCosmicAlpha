var People;
(function (People) {
    (function (ViewModels) {
        var ActivityInputModel = (function () {
            function ActivityInputModel(modelData) {
                this.pageSize = ko.observable(this.modelData.PageSize);
                this.pageNumber = ko.observable((this.modelData.PageNumber != null) ? this.modelData.PageNumber : 1);
                this.keyword = ko.observable(this.modelData.Keyword);
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                this.prevEnabled = ko.observable(true);
                this.nextEnabled = ko.observable(true);
                this.orderBy = ko.observable(this.modelData.OrderBy);
                this.hasInitialized = false;
                this.optionsEnabled = ko.observable(false);
                this.modelData = modelData;
                this._setupCountryDropDown();
                if (this.pageNumber() >= modelData.PageCount) {
                    this.nextEnabled(false);
                }
                if (this.pageNumber() == 1) {
                    this.prevEnabled(false);
                }
                this.pageNumber.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                }, this);
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
                this.pageNumber((parseInt(this.pageNumber()) + 1).toString());
                this.search();
            };

            ActivityInputModel.prototype.prevPage = function (model, event) {
                event.preventDefault();
                this.pageNumber((parseInt(this.pageNumber()) - 1).toString());
                this.search();
            };

            ActivityInputModel.prototype.search = function () {
                this.$form.submit();
            };

            ActivityInputModel.prototype._setupCountryDropDown = function () {
                var _this = this;
                ko.computed(function () {
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        var emptyValue = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        _this.countries(response);

                        _this.countryCode(_this.modelData.CountryCode);
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
