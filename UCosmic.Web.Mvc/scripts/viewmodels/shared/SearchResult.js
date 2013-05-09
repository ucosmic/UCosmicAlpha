define(["require", "exports"], function(require, exports) {
    
    
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
            this._setupCountryComputeds();
            this._setupUrlComputeds();
            this._setupNameComputeds();
            this._setupLinkComputeds();
        };
        SearchResult.prototype._setupCountryComputeds = function () {
            var _this = this;
            this.nullDisplayCountryName = ko.computed(function () {
                return _this.countryName() || '[Undefined]';
            });
        };
        SearchResult.prototype._setupUrlComputeds = function () {
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
            this.officialUrlTooltip = ko.computed(function () {
                var value = _this.fitOfficialUrl();
                if(!value) {
                    return value;
                }
                var computedValue = 'Visit ' + value + ' (opens a new window)';
                return computedValue;
            });
        };
        SearchResult.prototype._setupNameComputeds = function () {
            var _this = this;
            this.officialNameMatchesTranslation = ko.computed(function () {
                return _this.officialName() === _this.translatedName();
            });
            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                return !_this.officialNameMatchesTranslation();
            });
        };
        SearchResult.prototype._setupLinkComputeds = function () {
            var _this = this;
            this.detailHref = ko.computed(function () {
                return _this._owner.detailHref(_this.id());
            });
            this.detailTooltip = ko.computed(function () {
                return _this._owner.detailTooltip();
            });
        };
        SearchResult.prototype.clickAction = function (viewModel, e) {
            return this._owner.clickAction(viewModel, e);
        };
        SearchResult.prototype.openOfficialUrl = function (viewModel, e) {
            e.stopPropagation();
            return true;
        };
        return SearchResult;
    })();
    exports.SearchResult = SearchResult;    
})
