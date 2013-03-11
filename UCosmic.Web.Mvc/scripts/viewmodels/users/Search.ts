/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
/// <reference path="../PagedSearch.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.Users {
    
    export class Search extends ViewModels.PagedSearch {

        sammy: Sammy.Application = Sammy();

        constructor() {
            super();
            this._init();
        }

        private _init(): void {
            this._setupSammy();
            this._setupQueryComputed();
        }

        private _pullResults(): JQueryDeferred {
            var deferred = $.Deferred();
            var queryParameters = {
                pageSize: this.pageSize(),
                pageNumber: this.pageNumber(),
                keyword: this.throttledKeyword(),
                orderBy: this.orderBy()
            };
            $.get(App.Routes.WebApi.Users.get(), queryParameters)
            .done((response: any[], statusText: string, xhr: JQueryXHR): void => {
                deferred.resolve(response, statusText, xhr);
            })
            .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                deferred.reject(xhr, statusText, errorThrown);
            });
            return deferred;
        }

        private _loadResults(results: any): void {
            var resultsMapping = {
                items: {
                    key: function (data) {
                        return ko.utils.unwrapObservable(data.id);
                    },
                    create: function (options) {
                        return new ViewModels.Users.SearchResult(options.data);
                    }
                },
                ignore: ['pageSize', 'pageNumber']
            };
            ko.mapping.fromJS(results, resultsMapping, this);
            this.spinner.stop();
            this.transitionedPageNumber(this.pageNumber());
        }

        private _setupQueryComputed(): void {
            ko.computed((): void => {
                if (this.pageSize() === undefined || this.orderBy() === undefined)
                    return;

                this._pullResults()
                .done((response: any[]): void => {
                    this._loadResults(response);
                })
                .fail((): void => {
                    //alert('failed to get users :(');
                });
            }).extend({ throttle: 250 });
        }

        private _setupSammy(): void {
            var self = this;

            this.sammy.before(/\#\/page\/(.*)/, function () {
                // do not allow route navigation when pagination buttons are forced disabled
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                // make sure the viewmodel pagenumber is in sync with the route
                var pageNumber = this.params['pageNumber'];
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                return true;
            });

            this.sammy.get('#/page/:pageNumber/', function () {
                //alert('sammy.get #/page/:pageNumber -- ' + this.path);
            });

            // this causes the hash to default to page #1
            this.sammy.get('/users[\/]?', () => {
                this.sammy.setLocation('#/page/1/');
            });
        }
    }
    
    export class SearchResult {

        id: KnockoutObservableNumber;
        personId: KnockoutObservableNumber;
        name: KnockoutObservableString;
        personDisplayName: KnockoutObservableString;
        roleGrants: KnockoutObservableArray;

        hasRoles: KnockoutComputed;
        hasNoRoles: KnockoutComputed;

        constructor(values: any) {

            // map api data to observables
            ko.mapping.fromJS(values, {}, this);

            this._setupRoleGrantComputeds();
        }

        private _setupRoleGrantComputeds(): void {
            this.hasRoles = ko.computed((): bool => {
                return this.roleGrants().length > 0;
            });
            this.hasNoRoles = ko.computed((): bool => {
                return !this.hasRoles();
            });
        }
    }
}