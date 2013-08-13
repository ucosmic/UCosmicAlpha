/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/knockout/knockout.d.ts" />
/// <reference path="../../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../establishments/ServerApiModel.d.ts" />
define(["require", "exports"], function(require, exports) {
    

    var SearchResult = (function () {
        function SearchResult(values, owner) {
            this._owner = owner;
            this._pullData(values);
            this._setupComputeds();
        }
        SearchResult.prototype._pullData = function (values) {
            // map input model to observables
            ko.mapping.fromJS(values, {}, this);
        };

        //#endregion
        //#region Computeds
        SearchResult.prototype._setupComputeds = function () {
            this._setupCountryComputeds();
            this._setupUrlComputeds();
            this._setupNameComputeds();
            this._setupLinkComputeds();
        };

        SearchResult.prototype._setupCountryComputeds = function () {
            var _this = this;
            // show alternate text when country is undefined
            this.nullDisplayCountryName = ko.computed(function () {
                return _this.countryName() || '[Undefined]';
            });
        };

        SearchResult.prototype._setupUrlComputeds = function () {
            var _this = this;
            // compact URL so that it fits within page width
            this.fitOfficialUrl = ko.computed(function () {
                var value = _this.officialUrl();
                if (!value)
                    return value;

                var computedValue = value;
                var protocolIndex = computedValue.indexOf('://');
                if (protocolIndex > 0)
                    computedValue = computedValue.substr(protocolIndex + 3);
                var slashIndex = computedValue.indexOf('/');
                if (slashIndex > 0) {
                    if (slashIndex < computedValue.length - 1) {
                        computedValue = computedValue.substr(slashIndex + 1);
                        computedValue = value.substr(0, value.indexOf(computedValue)) + '...';
                    }
                }
                return computedValue;
            });

            // inform user what clicking the link does
            this.officialUrlTooltip = ko.computed(function () {
                var value = _this.fitOfficialUrl();
                if (!value)
                    return value;

                var computedValue = 'Visit ' + value + ' (opens a new window)';
                return computedValue;
            });
        };

        SearchResult.prototype._setupNameComputeds = function () {
            var _this = this;
            // are the official name and translated name the same?
            this.officialNameMatchesTranslation = ko.computed(function () {
                return _this.officialName() === _this.translatedName();
            });
            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                return !_this.officialNameMatchesTranslation();
            });
        };

        SearchResult.prototype._setupLinkComputeds = function () {
            var _this = this;
            // href to navigate from search to detail / edit page
            this.detailHref = ko.computed(function () {
                return _this._owner.detailHref(_this.id());
            });

            // tooltip for link to detail / edit page
            this.detailTooltip = ko.computed(function () {
                return _this._owner.detailTooltip();
            });
        };

        //#endregion
        //#endregion
        //#region Click handlers
        // navigate to detail page
        SearchResult.prototype.clickAction = function (viewModel, e) {
            return this._owner.clickAction(viewModel, e);
        };

        // open official URL page
        SearchResult.prototype.openOfficialUrl = function (viewModel, e) {
            e.stopPropagation();
            return true;
        };
        return SearchResult;
    })();
    exports.SearchResult = SearchResult;
});
