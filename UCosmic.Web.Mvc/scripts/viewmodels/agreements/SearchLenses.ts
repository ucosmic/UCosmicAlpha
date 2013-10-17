/// <reference path="SearchTable.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />

module Agreements.ViewModels {

    export interface SearchLensSettings {
        element: Element;
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
    }

    export class SearchLenses {

        table: SearchTable;

        constructor(public settings: SearchLensSettings) {
            this._runSammy();
            this.table = new SearchTable({
                element: undefined,
                domain: this.settings.domain,
                visibility: this.settings.visibility,
                route: 'table',
                activationRoute: '#/table/',
                detailUrl: this.settings.detailUrl,
                sammy: this.sammy,
            });
            this.sammy.run();
            this.sammy.setLocation('#/table/');
        }

        sammy: Sammy.Application = Sammy();

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            this.sammy.get(
                '#/:lens/',
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._onRoute(e);
                });
        }

        private _onRoute(e: Sammy.EventContext): void {
            var lens = e.params['lens'];
            if (lens === 'table') {
                this.table.onBeforeActivation(e);
            }
        }
    }
}