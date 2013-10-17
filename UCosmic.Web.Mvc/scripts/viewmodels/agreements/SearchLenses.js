var Agreements;
(function (Agreements) {
    /// <reference path="SearchTable.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    (function (ViewModels) {
        var SearchLenses = (function () {
            function SearchLenses(settings) {
                this.settings = settings;
                this.sammy = Sammy();
                this._runSammy();
                this.table = new ViewModels.SearchTable({
                    element: undefined,
                    domain: this.settings.domain,
                    visibility: this.settings.visibility,
                    route: 'table',
                    activationRoute: '#/table/',
                    detailUrl: this.settings.detailUrl,
                    sammy: this.sammy
                });
                this.sammy.run();
                this.sammy.setLocation('#/table/');
            }
            SearchLenses.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                this.sammy.get('#/:lens/', function () {
                    var e = this;
                    viewModel._onRoute(e);
                });
            };

            SearchLenses.prototype._onRoute = function (e) {
                var lens = e.params['lens'];
                if (lens === 'table') {
                    this.table.onBeforeActivation(e);
                }
            };
            return SearchLenses;
        })();
        ViewModels.SearchLenses = SearchLenses;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
