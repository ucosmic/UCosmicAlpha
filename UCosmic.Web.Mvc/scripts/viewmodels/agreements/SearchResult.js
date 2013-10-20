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
                var _this = this;
                //#endregion
                //#region Computeds
                //private _setupComputeds(): void {
                //    this._setupCountryComputeds();
                //    this._setupDateComputeds();
                //    //this._setupNameComputeds();
                //    this._setupLinkComputeds();
                //}
                //#region Link computeds
                //detailHref: KnockoutComputed<string>;
                //private _setupLinkComputeds(): void {
                // show alternate text when Link is undefined
                this.detailHref = ko.computed(function () {
                    return "/agreements/" + _this.id();
                });
                //}
                //#endregion
                //#region Country computeds
                //nullDisplayCountryName: KnockoutComputed<string>;
                //private _setupCountryComputeds(): void {
                // show alternate text when country is undefined
                this.nullDisplayCountryName = ko.computed(function () {
                    return _this.countryNames() || '[Unknown]';
                });
                //}
                //#endregion
                //#region Date computeds
                //startsOnDate: KnockoutComputed<string>;
                //expiresOnDate: KnockoutComputed<string>;
                //private _setupDateComputeds(): void {
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
                //this._setupComputeds();
            }
            SearchResult.prototype._pullData = function (values) {
                // map input model to observables
                ko.mapping.fromJS(values, {}, this);
            };

            //}
            ////#endregion
            //#region Name computeds
            //participantsNames: KnockoutComputed<string>;
            // not the right place to do this, do it in html bindings
            // see changes in _SearchAndResults.cshtml
            //private _setupNameComputeds(): void {
            //    // are the official name and translated name the same?
            //    this.participantsNames = ko.computed((): string => {
            //        var myName = "";
            //        $.each(this.establishmentOfficialName(), (i, item) => {
            //            if (this.establishmentTranslatedName()[i] != null && this.establishmentOfficialName()[i] != this.establishmentTranslatedName()[i]) {
            //                myName += "<strong title='" + this.establishmentOfficialName()[i] + "'>" + this.establishmentTranslatedName()[i] + "</strong>";
            //            } else
            //            {
            //                myName += "<strong>" + this.establishmentOfficialName()[i] + "</strong>";
            //            }
            //            myName += "<br />";
            //        });
            //        return myName;
            //    });
            //}
            //#endregion
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
