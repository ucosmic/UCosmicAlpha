/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="Search.ts" />
/// <reference path="ApiModels.d.ts" />
var Agreements;
(function (Agreements) {
    (function (ViewModels) {
        var SearchResult = (function () {
            function SearchResult(values, owner) {
                var _this = this;
                this.detailHref = ko.computed(function () {
                    return "/agreements/" + _this.id();
                });
                // show alternate text when country is undefined
                this.nullDisplayCountryName = ko.computed(function () {
                    return _this.countryNames() || '[Unknown]';
                });
                this.startsOnDate = ko.computed(function () {
                    var value = _this.startsOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    } else {
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
                    } else {
                        return (moment(value)).format('M/D/YYYY');
                    }
                });
                this._owner = owner;
                this._pullData(values);
            }
            SearchResult.prototype._pullData = function (values) {
                // map input model to observables
                ko.mapping.fromJS(values, {}, this);
            };

            // navigate to detail page
            SearchResult.prototype.clickAction = function (viewModel, e) {
                return this._owner.clickAction(viewModel, e);
            };
            return SearchResult;
        })();
        ViewModels.SearchResult = SearchResult;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
