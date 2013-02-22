/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.Users {
    
    export class Search {

        items: KnockoutObservableArray = ko.observableArray();

        constructor() {
            this._init();
        }

        private _init(): void {
            this._pullItems()
            .done((response: any[]): void => {
                this._loadItems(response);
            })
            .fail((): void => {
                //alert('failed to get users :(');
            });
        }

        private _pullItems(): JQueryDeferred {
            var deferred = $.Deferred();
            $.get(App.Routes.WebApi.Users.get())
            .done((response: any[], statusText: string, xhr: JQueryXHR): void => {
                deferred.resolve(response, statusText, xhr);
            })
            .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                deferred.reject(xhr, statusText, errorThrown);
            });
            return deferred;
        }

        private _loadItems(items: any[]): void {
            var itemsMapping = {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.id);
                },
                create: function (options) {
                    return new ViewModels.Users.SearchResult(options.data);
                },
                ignore: ['pageSize', 'pageNumber']
            };
            ko.mapping.fromJS(items, itemsMapping, this.items);
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