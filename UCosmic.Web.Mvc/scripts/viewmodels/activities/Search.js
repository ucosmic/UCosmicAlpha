var Activities;
(function (Activities) {
    (function (ViewModels) {
        var Search = (function () {
            function Search(settings) {
                this.settings = settings;
                this.countryOptions = ko.observableArray(this.settings.countryOptions);
                this.countryCode = ko.observable(this.settings.input.countryCode);
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.pageSize = ko.observable(this.settings.input.pageSize);
                this.pageNumber = ko.observable(this.settings.input.pageNumber);
                this.keyword = ko.observable(this.settings.input.keyword);
                this._areBindingsApplied = ko.observable(false);
            }
            Search.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
                this._areBindingsApplied(true);
            };

            Search.prototype.onSearchInputChangeEvent = function (viewModel, e) {
                if (!this._areBindingsApplied())
                    return;
                $(e.target).parents('form').submit();
            };

            Search.prototype.onKeywordInputSearchEvent = function (viewModel, e) {
                if ($.trim(this.keyword()) && !$.trim($(e.target).val()))
                    this.onSearchInputChangeEvent(this, e);
            };
            return Search;
        })();
        ViewModels.Search = Search;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
