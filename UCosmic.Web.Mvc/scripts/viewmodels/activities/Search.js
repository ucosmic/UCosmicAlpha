var Activities;
(function (Activities) {
    (function (ViewModels) {
        (function (DataGraphPivot) {
            DataGraphPivot[DataGraphPivot["activities"] = 1] = "activities";
            DataGraphPivot[DataGraphPivot["people"] = 2] = "people";
        })(ViewModels.DataGraphPivot || (ViewModels.DataGraphPivot = {}));
        var DataGraphPivot = ViewModels.DataGraphPivot;

        var Search = (function () {
            function Search(settings) {
                var _this = this;
                this.settings = settings;
                this.countryOptions = ko.observableArray(this.settings.countryOptions);
                this.countryCode = ko.observable(this.settings.input.countryCode);
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.keyword = ko.observable(this.settings.input.keyword);
                this.pager = new App.Pager(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
                this.pivot = ko.observable(this.settings.input.pivot);
                this.isActivitiesChecked = ko.computed(function () {
                    return _this.pivot() != 2 /* people */;
                });
                this.isPeopleChecked = ko.computed(function () {
                    return _this.pivot() == 2 /* people */;
                });
                this.loadingSpinner = new App.Spinner();
                this.pager.apply(this.settings.output);
            }
            Search.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);

                this._applySubscriptions();
            };

            Search.prototype._applySubscriptions = function () {
                var _this = this;
                this.pager.input.pageSizeText.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.pager.input.pageNumberText.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.countryCode.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.orderBy.subscribe(function (newValue) {
                    _this._submitForm();
                });
            };

            Search.prototype._submitForm = function () {
                this.loadingSpinner.start();
                this.$form.submit();
            };

            Search.prototype.onKeywordInputSearchEvent = function (viewModel, e) {
                if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                    this.$form.submit();
            };
            return Search;
        })();
        ViewModels.Search = Search;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
