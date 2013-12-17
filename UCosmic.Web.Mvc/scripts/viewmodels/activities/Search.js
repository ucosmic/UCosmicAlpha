var Activities;
(function (Activities) {
    (function (ViewModels) {
        var Search = (function () {
            function Search(settings) {
                this.settings = settings;
                this.countryOptions = ko.observableArray(this.settings.countryOptions);
                this.countryCode = ko.observable(this.settings.input.countryCode);
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.keyword = ko.observable(this.settings.input.keyword);
                this.pager = new App.Pager(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
                this._areBindingsApplied = ko.observable(false);
                this.pager.apply(this.settings.output);
            }
            Search.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
                this._areBindingsApplied(true);
                this._applySubscriptions();
            };

            Search.prototype._applySubscriptions = function () {
                var _this = this;
                this.pager.input.pageSizeText.subscribe(function (newValue) {
                    _this.$form.submit();
                });
                this.pager.input.pageNumberText.subscribe(function (newValue) {
                    _this.$form.submit();
                });
                this.countryCode.subscribe(function (newValue) {
                    _this.$form.submit();
                });
                this.orderBy.subscribe(function (newValue) {
                    _this.$form.submit();
                });
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
