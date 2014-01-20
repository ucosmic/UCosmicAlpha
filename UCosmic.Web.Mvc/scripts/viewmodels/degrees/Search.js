var Degrees;
(function (Degrees) {
    (function (ViewModels) {
        var Search = (function () {
            function Search(settings) {
                this.settings = settings;
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.keyword = ko.observable(this.settings.input.keyword);
                this.pager = new App.Pager(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
                this.loadingSpinner = new App.Spinner();
                this.pager.apply(this.settings.output);
            }
            Search.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
                kendo.init($(element));
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

                this.orderBy.subscribe(function (newValue) {
                    _this._submitForm();
                });
            };

            Search.prototype._submitForm = function () {
                if (this.loadingSpinner.isVisible())
                    return;
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
    })(Degrees.ViewModels || (Degrees.ViewModels = {}));
    var ViewModels = Degrees.ViewModels;
})(Degrees || (Degrees = {}));
