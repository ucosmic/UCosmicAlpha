var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var SearchResult = (function () {
            function SearchResult(values) {
                var _this = this;
                ko.mapping.fromJS(values, {
                }, this);
                this.nullDisplayCountryName = ko.computed(function () {
                    return _this.countryName() || '[Undefined]';
                });
                this.fitOfficialUrl = ko.computed(function () {
                    var value = _this.officialUrl();
                    if(!value) {
                        return value;
                    }
                    var computedValue = value;
                    var protocolIndex = computedValue.indexOf('://');
                    if(protocolIndex > 0) {
                        computedValue = computedValue.substr(protocolIndex + 3);
                    }
                    var slashIndex = computedValue.indexOf('/');
                    if(slashIndex > 0) {
                        if(slashIndex < computedValue.length - 1) {
                            computedValue = computedValue.substr(slashIndex + 1);
                            computedValue = value.substr(0, value.indexOf(computedValue)) + '...';
                        }
                    }
                    return computedValue;
                });
                this.officialNameMatchesTranslation = ko.computed(function () {
                    return _this.officialName() === _this.translatedName();
                });
                this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                    return !_this.officialNameMatchesTranslation();
                });
            }
            SearchResult.prototype.clickAction = function (viewModel, e) {
                var href, $target = $(e.target);
                while($target.length && !$target.attr('href') && !$target.attr('data-href')) {
                    $target = $target.parent();
                }
                if($target.length) {
                    href = $target.attr('href') || $target.attr('data-href');
                    location.href = href.replace('/0/', '/' + this.id() + '/');
                }
            };
            SearchResult.prototype.openOfficialUrl = function (viewModel, e) {
                e.stopPropagation();
                return true;
            };
            return SearchResult;
        })();
        Establishments.SearchResult = SearchResult;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
