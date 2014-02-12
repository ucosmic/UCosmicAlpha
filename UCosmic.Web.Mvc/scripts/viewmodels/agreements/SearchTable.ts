module Agreements.ViewModels {

    export interface SearchTableSettings {
        element: Element;
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
        sammy?: Sammy.Application
    }

    export interface SearchTableInput {
        keyword: string;
        countryCode: string;
        pageSize: number;
        pageNumber: number;
        orderBy: string;
    }

    export class SearchTable {
        //#region Search Filter Inputs

        // throttle keyword to reduce number API requests
        keyword = ko.observable<string>(
            sessionStorage.getItem(SearchTable.KeywordSessionKey) || '');
        keywordThrottled = ko.computed<string>(this.keyword)
            .extend({ throttle: 400 });

        // instead of throttling, both this and the options are observed
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchTable.CountrySessionKey) || 'any');

        pager = new App.Pager<TableRow>(
            sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1,
            sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);

        displayPager = new App.Pager<TableRow>(
            sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1,
            sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);

        orderBy: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchTable.OrderBySessionKey) || 'start-desc');

        //#endregion
        //#region Search Filter Input sessionStorage

        static KeywordSessionKey = 'AgreementSearchKeyword2';
        static PageSizeSessionKey = 'AgreementSearchPageSize2';
        static OrderBySessionKey = 'AgreementSearchOrderBy2';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static PageNumberSessionKey = 'AgreementSearchPageNumber2';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (isNaN(this.pager.input.pageNumber())) this.pager.input.pageNumberText('1');

            sessionStorage.setItem(SearchTable.KeywordSessionKey, this.keyword() || '');
            sessionStorage.setItem(SearchTable.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchTable.PageNumberSessionKey, this.pager.input.pageNumberText());
            sessionStorage.setItem(SearchTable.PageSizeSessionKey, this.pager.input.pageSizeText());
            sessionStorage.setItem(SearchTable.OrderBySessionKey, this.orderBy());
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchTableSettings) {
            this._loadCountryOptions();
            this.sammy = this.settings.sammy || Sammy();
            this._runSammy();
            if (sessionStorage.getItem("agreementSaved") == "deleted") {
                sessionStorage.setItem("agreementSaved", "no");
                App.flasher.flash("Agreement deleted");
            }
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
        //#region Result Filter Pagination

        private _filterChanged = ko.computed((): void => {
            var keyword = this.keywordThrottled();
            var pageSize = this.pager.input.pageSize();
            var countryCode = this.countryCode();
            //alert('filter changed');
            this.pager.input.pageNumberText("1");
        });

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/country/{4}/sort/{1}/size/{2}/page/{3}/'
            .format(this.settings.route).replace('{4}', '{0}');
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
                    return viewModel._onBeforeRoute(e);
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':country', ':sort', ':size', ':number'),
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._onRoute(e);
                });

            // activate the page route (create default hashtag parameters)
            this.sammy.get(
                this.settings.activationRoute || this.sammy.getLocation(),
                function (): void {
                    viewModel.setLocation(); // base activated route on current input filters
                });

            if (!this.settings.sammy && !this.sammy.isRunning())
                this.sammy.run();
        }

        private _onBeforeRoute(e: Sammy.EventContext): boolean {
            return true;
        }

        private _onRoute(e: Sammy.EventContext): void {
            var country = e.params['country'];
            var sort = e.params['sort'];
            var size = e.params['size'];
            var page = e.params['number'];

            // this will always run when the route is first activated, either explicitly from the URL
            // or after hitting the activation route pattern
            // it will also run when users page back & forward through the history
            // keyword is not stored as part of the route or history
            this.countryCode(country);
            this.orderBy(sort);
            this.pager.input.pageSizeText(size);
            this.pager.input.pageNumberText(page);
            this.activate();
        }

        activate(): void {
            if (!this._isActivated()) {
                this._requestHistory([]);
                this._isActivated(true);
            }
        }
        deactivate(): void {
            if (this._isActivated()) this._isActivated(false);
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

        setLocation(): void {
            // only set the href hashtag to trigger sammy when the current route is stale
            var route = this._route();
            if (this.sammy.getLocation().indexOf(route) < 0) {
                this.sammy.setLocation(route);
            }
        }

        //#endregion
        //#region API Requests

        spinner = new App.Spinner({ delay: 400, runImmediately: true, });
        $results: JQuery;
        private _requestHistory = ko.observableArray<SearchTableInput>();
        private _currentRequest = ko.computed((): SearchTableInput => {
            // this will run once during construction
            return this._computeCurrentRequest();
        });

        private _computeCurrentRequest(): SearchTableInput {
            var thisRequest: SearchTableInput = {
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
            var lastRequest: SearchTableInput = requestHistory.length
                ? Enumerable.From(requestHistory).Last() : null;
            var thisRequest = this._currentRequest();

            //// do we know for a fact that the pageNumber is overflowed?
            //if (this.pager.input.pageCount() != undefined &&
            //    this.pager.input.pageCount() < thisRequest.pageNumber) {

            //    this.pager.input.pageNumberText("1");
            //    return;
            //}

            if (!lastRequest || !this._areRequestsAligned(thisRequest, lastRequest)) {
                this._requestHistory.push(thisRequest);
                this._load();
            }
        }

        private _load(): void {
            this._request()
                .done((): void => {
                });
        }

        private _request(): JQueryDeferred<void> {
            var deferred = $.Deferred();
            var requestHistory = this._requestHistory();
            var lastRequest: SearchTableInput = requestHistory[requestHistory.length - 1];
            var thisRequest = this._currentRequest();
            if (!this._areRequestsAligned(thisRequest, lastRequest)) {
                deferred.reject();
                return deferred;
            }
            this.spinner.start();
            if (this.$results) { // just give results less opacity, do not fade out entirely
                this.$results.fadeTo(200, 0.5);
            }
            $.get(App.Routes.WebApi.Agreements.Search.get(this.settings.domain), lastRequest)
                .done((response: App.PageOf<any>): void => {
                    // need to make sure the current inputs still match the request
                    var currentRequest = this._currentRequest();
                    if (this._areRequestsAligned(thisRequest, currentRequest)) {
                        // when there are zero results, server will NOT correct the pageNumber
                        if (response.itemTotal < 1 && thisRequest.pageNumber != 1) {
                            // need to correct the page number here
                            this._fixOverflowedPageNumber(thisRequest, 1);
                        }
                        // when there are one or more results, server WILL correct the pageNumber
                        else if (response.pageNumber != thisRequest.pageNumber) {
                            // need to correct the page number here
                            this._fixOverflowedPageNumber(thisRequest, response.pageNumber);
                        }

                        response.items = Enumerable.From(response.items)
                            .Select((x: any): TableRow => {
                                return new TableRow(x, this);
                            }).ToArray();
                        this.pager.apply(response);
                        this.displayPager.apply(response);
                        this.setLocation();
                        deferred.resolve();
                    }
                    else {
                        deferred.reject();
                    }
                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load agreement data, please try again', true);
                })
                .always((): void => {
                    this.spinner.stop();
                    this._restoreResultOpactity();
                    setTimeout((): void => {
                        this._restoreResultOpactity();
                    }, 100);
                });
            return deferred;
        }

        private _fixOverflowedPageNumber(request: SearchTableInput, pageNumber: number): void {
            var requests = this._requestHistory().slice(0);
            var requestToFix = requests[requests.length - 1];
            for (var i = requests.length - 1; i >= 0; i--) { // go backwards through the request history

                // stop here if any input paramter besides the page number does not match
                if (!this._areRequestsAligned(request, requests[i], true))
                    break;
                requestToFix = requests[i];

                // only pop off the request if it matches everything but the overflowed page number
                // and it is not the first request
                if (this._requestHistory().length > 1 &&
                    this._areRequestsAligned(request, requests[i - 1], true)) {
                    this._requestHistory.pop();
                }
            }
            requestToFix.pageNumber = pageNumber;
        }

        private _areRequestsAligned(first: SearchTableInput, second: SearchTableInput, ignorePageNumber: boolean = false): boolean {
            var aligned = first.keyword === second.keyword
                && first.countryCode === second.countryCode
                && first.orderBy === second.orderBy
                && first.pageSize === second.pageSize
            ;
            if (!ignorePageNumber)
                aligned = aligned && first.pageNumber === second.pageNumber;
            return aligned;
        }

        private _restoreResultOpactity(): void {
            if (this.$results && this.pager.output.hasItems()) {
                this.$results.fadeTo(1, 1);
                this.$results.css({ opacity: 1 });
            }
        }

        //#endregion
    }

    export class TableRow {

        id = ko.observable<number>();
        name = ko.observable<string>();
        countryNames = ko.observable<string>();
        startsOn = ko.observable<string>();
        expiresOn = ko.observable<string>();
        type = ko.observable<string>();
        status = ko.observable<string>();
        countries = ko.observableArray<string>();
        participants = ko.observableArray<any>();

        constructor(data: any, public owner: SearchTable) {
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
}