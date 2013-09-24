var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="Search.ts" />
    /// <reference path="ApiModels.d.ts" />
    (function (ViewModels) {
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
                this._setupDateComputeds();
            };

            SearchResult.prototype._setupCountryComputeds = function () {
                // show alternate text when country is undefined
                this.nullDisplayCountryName = ko.computed(function () {
                    return '[undefined]';
                    //return this.countryName() || '[Undefined]';
                });
            };

            SearchResult.prototype._setupDateComputeds = function () {
                var _this = this;
                this.startsOnDate = ko.computed(function () {
                    var value = _this.startsOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    }
                    return (moment(value)).format('MMMM Do YYYY');
                });
                this.expiresOnDate = ko.computed(function () {
                    var value = _this.expiresOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    } else {
                        return (moment(value)).format('MMMM Do YYYY');
                    }
                });
            };

            ////#endregion
            //#region Click handlers
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
