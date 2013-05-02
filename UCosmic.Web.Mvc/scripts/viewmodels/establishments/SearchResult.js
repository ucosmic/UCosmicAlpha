var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var SearchResult = (function () {
            function SearchResult(values, owner) {
                this._owner = owner;
                this._pullData(values);
                this._setupComputeds();
            }
            SearchResult.prototype._pullData = function (values) {
                ko.mapping.fromJS(values, {
                }, this);
            };
            SearchResult.prototype._setupComputeds = function () {
                this._setupNullDisplayCountryName();
                this._setupFittedOfficialUrl();
                this._setupOfficialUrlTooltip();
                this._setupOfficialNameTranslationMatches();
            };
            SearchResult.prototype._setupNullDisplayCountryName = function () {
                var _this = this;
                this.nullDisplayCountryName = ko.computed(function () {
                    return _this.countryName() || '[Undefined]';
                });
            };
            SearchResult.prototype._setupFittedOfficialUrl = function () {
                var _this = this;
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
            };
            SearchResult.prototype._setupOfficialUrlTooltip = function () {
                var _this = this;
                this.officialUrlTooltip = ko.computed(function () {
                    var value = _this.fitOfficialUrl();
                    if(!value) {
                        return value;
                    }
                    var computedValue = 'Visit ' + value + ' (opens a new window)';
                    return computedValue;
                });
            };
            SearchResult.prototype._setupOfficialNameTranslationMatches = function () {
                var _this = this;
                this.officialNameMatchesTranslation = ko.computed(function () {
                    return _this.officialName() === _this.translatedName();
                });
                this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                    return !_this.officialNameMatchesTranslation();
                });
            };
            SearchResult.prototype.clickAction = function (viewModel, e) {
                this._owner.clickAction(viewModel, e);
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
