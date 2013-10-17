/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/linq/linq.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../places/ApiModels.d.ts" />

module Agreements.ViewModels {

    export class TableSearch {
        //#region Search Filter Inputs

        // throttle keyword to reduce number API requests
        keyword: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(TableSearch.KeywordSessionKey) || '');
        keywordThrottled: KnockoutComputed<string> = ko.computed(this.keyword)
            .extend({ throttle: 400 });

        // instead of throttling, both this and the options are observed
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(TableSearch.CountrySessionKey) || 'any');

        pager = new SearchResultPager<TableRow>(
            sessionStorage.getItem(TableSearch.PageNumberSessionKey) || 1,
            sessionStorage.getItem(TableSearch.PageSizeSessionKey) || 10);

        displayPager = new SearchResultPager<TableRow>(
            sessionStorage.getItem(TableSearch.PageNumberSessionKey) || 1,
            sessionStorage.getItem(TableSearch.PageSizeSessionKey) || 10);

        orderBy: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(TableSearch.OrderBySessionKey) || 'start-desc');

        //#endregion
        //#region Search Filter Input sessionStorage

        static KeywordSessionKey = 'AgreementSearchKeyword2';
        static PageSizeSessionKey = 'AgreementSearchPageSize2';
        static OrderBySessionKey = 'AgreementSearchOrderBy2';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static PageNumberSessionKey = 'AgreementSearchPageNumber2';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {
            sessionStorage.setItem(TableSearch.KeywordSessionKey, this.keyword());
            sessionStorage.setItem(TableSearch.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(TableSearch.PageNumberSessionKey, this.pager.input.pageNumberText());
            sessionStorage.setItem(TableSearch.PageSizeSessionKey, this.pager.input.pageSizeText());
            sessionStorage.setItem(TableSearch.OrderBySessionKey, this.orderBy());
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: TableSearchSettings) {
            this._loadCountryOptions();
            this._runSammy();
            ko.applyBindings(this, this.settings.element);
        }

        ////#endregion
        //#region Country Filter Options

        // initial options show loading message
        countryOptions: KnockoutObservableArray<Places.ApiModels.Country> = ko.observableArray(
            [{ code: 'any', name: '[Loading...]' }]);

        private _countryChanged: KnockoutComputed<void> = ko.computed((): void => {
            this._onCountryChanged();
        });

        private _onCountryChanged(): void {
            // changes when applyBindings happens and after options data is loaded
            var countryCode = this.countryCode();
            var options = this.countryOptions();
            // keep countryCode as an option so that we don't lose it when options change
            if (options.length == 1 && options[0].code != countryCode)
                options[0].code = countryCode;
        }

        private _loadCountryOptions(): JQueryDeferred<void> {
            // this will run once during construction
            // this will run before sammy and applyBindings...
            var deferred = $.Deferred();
            $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.ApiModels.Country[]): void => {
                    // ...but this will run after sammy and applyBindings
                    var options = response.slice(0);
                    // customize options
                    var any: Places.ApiModels.Country = {
                        code: 'any',
                        name: '[All countries]'
                    };
                    var none: Places.ApiModels.Country = {
                        code: 'none',
                        name: '[Without country]'
                    };
                    options = Enumerable.From([any]).Concat(options).Concat([none]).ToArray();

                    this.countryOptions(options); // push into observable array
                    deferred.resolve();
                });
            return deferred;
        }

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application = Sammy();
        routeFormat: string = '#/{0}/country/{5}/sort/{1}/size/{2}/page/{3}/'
            .format(this.settings.route).replace('{5}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            // sammy will run the first route that it matches
            var beforeRegex = new RegExp('\\{0}'.format(
                this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
            this.sammy.before(
                beforeRegex,
                function (): boolean {
                    var e: Sammy.EventContext = this;
                    // this will always run when the route is first activated, either explicitly from the URL
                    // or after hitting the activation route pattern
                    // it will also run when users page back & forward through the history
                    // keyword is not stored as part of the route or history
                    viewModel.countryCode(e.params['country']);
                    viewModel.orderBy(e.params['sort']);
                    viewModel.pager.input.pageSizeText(e.params['size']);
                    viewModel.pager.input.pageNumberText(e.params['number']);
                    return true;
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':country', ':sort', ':size', ':number'),
                function (): void {
                    var e: Sammy.EventContext = this;
                    if (!viewModel._isActivated())
                        viewModel._isActivated(true);
                });

            // activate the page route (create default hashtag parameters)
            this.sammy.get(
                this.settings.activationRoute || this.sammy.getLocation(),
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._setLocation(); // base activated route on current input filters
                });

            this.sammy.run();
        }

        private _route: KnockoutComputed<string> = ko.computed((): string => {
            // this will run once during construction
            return this._computeRoute();
        });

        private _computeRoute(): string {
            // build what the route should be, based on current filter inputs
            var countryCode = this.countryCode();
            var orderBy = this.orderBy();
            var pageSize = this.pager.input.pageSize();
            var pageNumber = this.pager.input.pageNumber();
            var route = this.routeFormat.format(countryCode,
                orderBy, pageSize, pageNumber);
            return route;
        }

        private _setLocation(): void {
            // only set the href hashtag to trigger sammy when the current route is stale
            var route = this._route();
            if (this.sammy.getLocation().indexOf(route) < 0) {
                this.sammy.setLocation(route);
            }
        }

        //#endregion
        //#region API Requests

        private _requestHistory: KnockoutObservableArray<TableSearchInput> = ko.observableArray();

        private _currentRequest: KnockoutComputed<TableSearchInput> = ko.computed((): TableSearchInput => {
            // this will run once during construction
            return this._computeCurrentRequest();
        });

        private _computeCurrentRequest(): TableSearchInput {
            var thisRequest: TableSearchInput = {
                keyword: this.keywordThrottled(),
                countryCode: this.countryCode(),
                orderBy: this.orderBy(),
                pageSize: this.pager.input.pageSize(),
                pageNumber: this.pager.input.pageNumber(),
            };
            return thisRequest;
        }

        private _requestDirty: KnockoutComputed<void> = ko.computed((): void => {
            // this will run once during construction
            this._onRequestDirty();
        }).extend({ throttle: 1, });

        private _onRequestDirty(): void {
            if (!this._isActivated()) return;
            var requestHistory = this._requestHistory();
            var lastRequest: TableSearchInput = requestHistory.length
                ? Enumerable.From(requestHistory).Last() : null;
            var thisRequest = this._currentRequest();
            if (!lastRequest || !this._areRequestsAligned(thisRequest, lastRequest)) {
                this._requestHistory.push(thisRequest);
                this._load();
            }
        }

        private _load(): void {
            this._request()
                .done((): void => {
                    if (this.$results && this.pager.output.hasItems()) {
                        this.$results.fadeTo(0, 1);
                    }
                });
        }

        private _request(): JQueryDeferred<void> {
            var deferred = $.Deferred();
            var lastRequest: TableSearchInput = Enumerable.From(this._requestHistory()).Last();
            var thisRequest = this._currentRequest();
            if (thisRequest != lastRequest) {
                deferred.reject();
                return deferred;
            }
            this.spinner.start();
            if (this.$results) {
                this.$results.fadeTo(200, 0.5);
            }
            $.get(App.Routes.WebApi.Agreements.Search.get(this.settings.domain), lastRequest)
                .done((response: PageOf<any>): void => {
                    // need to make sure the current inputs still match the request
                    var currentRequest = this._currentRequest();
                    if (thisRequest == currentRequest) {
                        // when there are zero results, server will NOT correct the pageNumber
                        if (response.itemTotal < 1 && thisRequest.pageNumber != 1)
                            // need to correct the page number here
                            this._fixOverflowedPageNumber(thisRequest, 1);

                        // when there are one or more results, server WILL correct the pageNumber
                        else if (response.pageNumber != thisRequest.pageNumber)
                            // need to correct the page number here
                            this._fixOverflowedPageNumber(thisRequest, response.pageNumber);

                        response.items = Enumerable.From(response.items)
                            .Select((x: any): TableRow => {
                                return new TableRow(x, this);
                            }).ToArray();
                        this.pager.apply(response);
                        this.displayPager.apply(response);
                        this._setLocation();
                        deferred.resolve();
                        this.spinner.stop();
                    }
                    else {
                        deferred.reject();
                    }
                });
            return deferred;
        }

        private _fixOverflowedPageNumber(request: TableSearchInput, pageNumber: number): void {
            var requests = this._requestHistory().slice(0);
            var requestToFix = requests[requests.length - 1];
            for (var i = requests.length - 1; i >= 0; i--) { // go backwards through the request history

                // stop here if any input paramter besides the page number does not match
                if (!this._areRequestsAligned(request, requests[i], true))
                    break;
                requestToFix = requests[i];

                // only pop off the request if it matches everything but the overflowed page number
                // and it is not the first request
                if (this._requestHistory().length > 1 && this._areRequestsAligned(request, requests[i - 1], true))
                    this._requestHistory.pop();
            }
            requestToFix.pageNumber = pageNumber;
        }

        private _areRequestsAligned(first: TableSearchInput, second: TableSearchInput, ignorePageNumber: boolean = false): boolean {
            var aligned = first.keyword === second.keyword
                && first.countryCode === second.countryCode
                && first.orderBy === second.orderBy
                && first.pageSize === second.pageSize
            ;
            if (!ignorePageNumber)
                aligned = aligned && first.pageNumber === second.pageNumber;
            return aligned;
        }

        private _getPageCount(pageNumber: number, pageSize: number, itemTotal: number): number {
            var pageCount = Math.ceil(itemTotal / pageSize);
            return pageCount;
        }

        //#endregion
        //#region Results

        spinner = new App.Spinner(new App.SpinnerOptions(400, true));
        $results: JQuery;

        //#endregion
    }

    export class TableRow {

        id: KnockoutObservable<number> = ko.observable();
        name: KnockoutObservable<string> = ko.observable();
        countryNames: KnockoutObservable<string> = ko.observable();
        startsOn: KnockoutObservable<string> = ko.observable();
        expiresOn: KnockoutObservable<string> = ko.observable();
        type: KnockoutObservable<string> = ko.observable();
        status: KnockoutObservable<string> = ko.observable();
        countries: KnockoutObservableArray<string> = ko.observableArray();
        participants: KnockoutObservableArray<any> = ko.observableArray();

        constructor(data: any, public owner: TableSearch) {
            ko.mapping.fromJS(data, {}, this);
        }

        detailHref: KnockoutComputed<string> = ko.computed((): string => {
            var url = this.owner.settings.detailUrl.format(this.id());
            return url;
        });

        hasCountries: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var countries = this.countries();
            return countries && countries.length > 0;
        });

        partners: KnockoutComputed<any[]> = ko.computed((): any[]=> {
            return Enumerable.From(this.participants())
                .Where(function (x: any): boolean {
                    return !x.isOwner();
                })
                .ToArray();
        });

        partnerTranslatedName(index: number): string {
            var partner = this.partners()[index];
            return partner.establishmentTranslatedName();
        }

        partnerOfficialName(index: number): string {
            var partner = this.partners()[index];
            return partner.establishmentOfficialName();
        }

        startsOnFormatted: KnockoutComputed<string> = ko.computed((): string => {
            var startsOn = this.startsOn();
            return moment(startsOn).format('M/D/YYYY');
        });

        expiresOnFormatted: KnockoutComputed<string> = ko.computed((): string => {
            var expiresOn = this.expiresOn();
            if (!expiresOn) return '';
            return moment(expiresOn).format('M/D/YYYY');
        });
    }

    export class SearchResultPager<T> {

        input: SearchResultPagerStatus;
        output: SearchResultPagerStatus;
        items: KnockoutObservableArray<T> = ko.observableArray();

        constructor(pageNumber: string, pageSize: string) {
            this.input = new SearchResultPagerStatus(pageNumber, pageSize);
            this.output = new SearchResultPagerStatus(pageNumber, pageSize);
        }

        apply(page: PageOf<T>): void {
            this.input.apply(page);
            this.output.apply(page);
            this.items(page.items);
        }
    }

    export class SearchResultPagerStatus {

        pageNumberText: KnockoutObservable<string> = ko.observable('1');
        pageSizeText: KnockoutObservable<string> = ko.observable('10');
        itemCount: KnockoutObservable<number> = ko.observable();
        itemTotal: KnockoutObservable<number> = ko.observable();

        constructor(pageNumber: string, pageSize: string) {
            this.pageNumberText(pageNumber);
            this.pageSizeText(pageSize);
        }

        pageNumber: KnockoutComputed<number> = ko.computed((): number => {
            return parseInt(this.pageNumberText());
        });
        pageSize: KnockoutComputed<number> = ko.computed((): number => {
            return parseInt(this.pageSizeText());
        });

        apply(page: PageOf<any>): void {
            this.pageSizeText(page.pageSize.toString());
            this.pageNumberText(page.itemTotal > 0 ? page.pageNumber.toString() : '1');
            this.itemTotal(page.itemTotal);
            this.itemCount(page.items.length);
        }

        isItemTotalDefined: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var itemTotal = this.itemTotal();
            return itemTotal || itemTotal == 0;
        });

        pageCount: KnockoutComputed<number> = ko.computed((): number => {
            if (!this.isItemTotalDefined()) return undefined;
            return Math.ceil(this.itemTotal() / this.pageSize());
        });

        pageIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.pageNumber() - 1;
        });

        firstIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.pageIndex() * this.pageSize();
        });

        firstNumber: KnockoutComputed<number> = ko.computed((): number => {
            return this.firstIndex() + 1;
        });

        lastNumber: KnockoutComputed<number> = ko.computed((): number => {
            if (!this.isItemTotalDefined()) return 0;
            return this.firstIndex() + this.itemCount();
        });

        lastIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.lastNumber() - 1;
        });

        next(): void {
            var pageNumber = this.pageNumber() + 1;
            this.pageNumberText(pageNumber.toString());
        }

        nextAllowed: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var pageCount = this.pageCount();
            return pageCount == undefined || pageCount > this.pageNumber();
        });

        prev(): void {
            var pageNumber = this.pageNumber() - 1;
            this.pageNumberText(pageNumber.toString());
        }

        prevAllowed: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var pageNumber = this.pageNumber() - 1;
            return pageNumber > 0;
        });

        hasItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.isItemTotalDefined() && this.itemTotal() > 0;
        });

        hasManyItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lastNumber() > this.firstNumber();
        });

        hasNoItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return !this.hasItems();
        });

        hasManyPages: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.pageCount() > 1;
        });
    }

    export interface TableSearchSettings {
        element: Element;
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
    }

    export interface TableSearchInput {
        keyword: string;
        countryCode: string;
        pageSize: number;
        pageNumber: number;
        orderBy: string;
    }

    export interface PageOf<T> {
        pageSize: number;
        pageNumber: number;
        itemTotal: number;
        items: T[];
    }
}