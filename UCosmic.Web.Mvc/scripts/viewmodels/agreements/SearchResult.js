var Agreements;
(function (Agreements) {
    var ViewModels;
    (function (ViewModels) {
        var SearchResult = (function () {
            function SearchResult(values, owner) {
                var _this = this;
                this.detailHref = ko.computed(function () {
                    return "/agreements/" + _this.id();
                });
                this.nullDisplayCountryName = ko.computed(function () {
                    return _this.countryNames() || '[Unknown]';
                });
                this.startsOnDate = ko.computed(function () {
                    var value = _this.startsOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    }
                    else {
                        return (moment(value)).format('M/D/YYYY');
                    }
                });
                this.expiresOnDate = ko.computed(function () {
                    var value = _this.expiresOn();
                    if (!value)
                        return undefined;
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    }
                    else {
                        return (moment(value)).format('M/D/YYYY');
                    }
                });
                this._owner = owner;
                this._pullData(values);
            }
            SearchResult.prototype._pullData = function (values) {
                ko.mapping.fromJS(values, {}, this);
            };
            SearchResult.prototype.clickAction = function (viewModel, e) {
                return this._owner.clickAction(viewModel, e);
            };
            return SearchResult;
        })();
        ViewModels.SearchResult = SearchResult;
    })(ViewModels = Agreements.ViewModels || (Agreements.ViewModels = {}));
})(Agreements || (Agreements = {}));
