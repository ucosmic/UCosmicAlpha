module Agreements.ViewModels {

    export interface SearchTableSettings {
        element: Element;
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
        sammy?: Sammy.Application
        summaryApi: string;
    }

    export interface SearchTableInput {
        keyword: string;
        ancestorId: number;
        countryCode: string;
        typeCode: string;
        pageSize: number;
        pageNumber: number;
        orderBy: string;
    }

    export class SearchTable {
        hasTenancyData = ko.observable<boolean>(false);
        hasEstablishmentSelects = ko.observable<boolean>(false);
        selectedTenant = ko.observable<number>(ttw.tenantId);
        selectedEstablishment = ko.observable<number>(ttw.ancestorId);
        tenantOptions = ko.observableArray<App.ApiModels.SelectOption<number>>();
        affiliations = ko.mapping.fromJS([]);
        mainCampus: number;
        //#region Search Filter Inputs

        // throttle keyword to reduce number API requests
        keyword = ko.observable<string>(
            sessionStorage.getItem(SearchTable.KeywordSessionKey) || '');
        ancestorId = ko.observable<number>(
            parseInt(sessionStorage.getItem(SearchTable.AncestorIdSessionKey)) || 0);
        keywordThrottled = ko.computed<string>(this.keyword)
            .extend({ throttle: 400 });

        // instead of throttling, both this and the options are observed
        countryCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchTable.CountrySessionKey) || 'any');

        typeCode: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchTable.TypeSessionKey) || 'any');

        pager = new App.Pager<TableRow>(
            sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1,
            sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);

        displayPager = new App.Pager<TableRow>(
            sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1,
            sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);

        orderBy: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchTable.OrderBySessionKey) || 'start-desc');

        //#endregion

        summary: KoModels.Summary = {
            agreementCount: ko.observable('?'),
            partnerCount: ko.observable('?'),
            countryCount: ko.observable('?'),
        };
        private _loadSummary(countryCode?: string, typeCode?: string, keyword?: string, ancestorId?: number): void {
            var url = this.settings.summaryApi;
            if (countryCode) {
                if(keyword == null || keyword == ""){
                    keyword = "!none!";
                }
                url = url += "Table/" + countryCode + "/" + typeCode + "/" + keyword + "/" + ancestorId
            }
            $.get(url)
                .done((response: ApiModels.Summary): void => {
                    ko.mapping.fromJS(response, {}, this.summary);
                });
        }
        //#region Tenancy
        rootEstablishment = 0;
        //selectedTenant = ko.observable<number>(ttw.tenantId);
        isCreatingSelectEstablishments = false;

        tenancyData: App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]> = new App.DataCacher(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadTenancyData();
            });

        private _selectedTenantChanged = ko.computed((): void => {
            //var areBindingsApplied = this.areBindingsApplied();
            var hasTenancyData = this.hasTenancyData();
            var selectedTenant = this.selectedTenant();
            if (this.selectedTenant()) {
                ttw.tenantId = this.selectedTenant();
            }
            var establishmentId = this.ancestorId();
            if (!hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                return;

            this.ancestorId(selectedTenant);
            //this._reloadPlaceData(); //**************************************************here************

        });


        private _createEstablishmentSelects(response): void {
            <number>this.ancestorId()
            if (this.selectedTenant() == 0) {
                this.selectedTenant(this.ancestorId())
            }
            var parentId = this.selectedTenant();
            if (!parentId) {
                parentId = ttw.tenantId;
            }
            var previousParentId = 0;
            this.isCreatingSelectEstablishments = true;
            this.affiliations.removeAll();
            while (true) {

                response.map(function (x, index, array) {
                    x.officialName = x.contextName ? x.contextName : x.officialName && x.officialName.indexOf(',') > -1 ? x.officialName.substring(0, x.officialName.indexOf(',')) : x.officialName;
                    return x;
                });

                var options: any = Enumerable.From(response)
                    .Where("x => x.parentId==" + parentId)
                    .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                    return x.rank; // sort by rank, then by name
                })
                    .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
                    return x.contextName || x.officialName;
                })
                    .Select("x =>  {value: x.id, text: x.officialName}").ToArray();


                if (options.length > 0) {
                    options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
                    this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
                }
                previousParentId = parentId;
                var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
                if (parentCheck[0] != undefined) {
                    parentId = parentCheck[0].parentId;
                } else {
                    this.isCreatingSelectEstablishments = false;
                    this.hasEstablishmentSelects(true);
                    return;
                }
            }

        }

        private _loadEstablishmentData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            var promise: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            this.mainCampus = this.rootEstablishment;// this.selectedTenant(); 
            if (!this.mainCampus) {
                this.mainCampus = this.selectedTenant();
                if (!this.mainCampus) {
                    this.mainCampus = ttw.tenantId;
                }
            }

            var temp = sessionStorage.getItem('campuses' + this.mainCampus);
            if (temp) {
                var response = $.parseJSON(temp);
                this._createEstablishmentSelects(response);
            } else {

                var settings = settings || {};
                settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                $.ajax(settings)
                    .done((response: ApiModels.ScalarEstablishment[]): void => {
                    promise.resolve(response);
                    sessionStorage.setItem('campuses' + this.mainCampus, JSON.stringify(response));
                    this._createEstablishmentSelects(response);
                })
                    .fail((xhr: JQueryXHR): void => {
                    promise.reject(xhr);
                });
            }

            return promise;
        }

        establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadEstablishmentData();
            });

        private _loadTenancyData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            // calling .ready() on tenancyData invokes this
            var deferred: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            $.when(Establishments.Servers.Single(ttw.tenantId), Establishments.Servers.GetChildren(ttw.tenantId))
                .done((parentData: Establishments.ApiModels.ScalarEstablishment, childData: Establishments.ApiModels.ScalarEstablishment[]): void => {
                childData = childData || [];
                var tenants = Enumerable.From(childData)
                    .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                    return x.rank;
                }).ToArray();
                tenants.unshift(parentData);

                this.tenantOptions([]);
                if (childData.length) {
                    var options = Enumerable.From(tenants)
                        .Select(function (x: Establishments.ApiModels.ScalarEstablishment): App.ApiModels.SelectOption<number> {
                        var option: App.ApiModels.SelectOption<number> = {
                            value: x.id,
                            text: x.contextName || x.officialName,
                        };
                        return option;
                    }).ToArray();
                    this.tenantOptions(options);
                }

                deferred.resolve(tenants);

                this.establishmentData.ready();

                var myThis = this;
                this.selectedTenant(<number>this.ancestorId());
                this.selectedTenant.subscribe((newValue: number): void => {
                    this.selectedEstablishment(this.selectedTenant());
                });
                $("#campusSelect").on("change", "select", function () {
                    if (myThis.isCreatingSelectEstablishments == false) {
                        if (this.value != '') {
                            myThis.selectedTenant(this.value);
                            myThis._loadEstablishmentData();
                        } else {
                            var prevCampusSelect = $(this).parent().parent().prev().find("select");
                            if (prevCampusSelect.length) {
                                myThis.selectedTenant(prevCampusSelect.val());
                                myThis._loadEstablishmentData();
                            } else {
                                myThis.selectedTenant(myThis.rootEstablishment);
                                myThis._loadEstablishmentData();
                            }
                        }
                    }
                })
                if (childData.length) this.hasTenancyData(true);

            })
                .fail((xhr: JQueryXHR): void => {
                App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                deferred.reject();
            })
            return deferred.promise();
        }

        //#endregion
        //#region Search Filter Input sessionStorage

        static KeywordSessionKey = 'AgreementSearchKeyword2';
        static AncestorIdSessionKey = 'AgreementSearchancestorId2';
        static PageSizeSessionKey = 'AgreementSearchPageSize2';
        static OrderBySessionKey = 'AgreementSearchOrderBy2';
        static CountrySessionKey = 'AgreementSearchCountry2';
        static TypeSessionKey = 'AgreementSearchType2';
        static PageNumberSessionKey = 'AgreementSearchPageNumber2';

        // automatically save the search inputs to session when they change
        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            if (this.countryCode() == undefined) this.countryCode('any');
            if (this.typeCode() == undefined) this.typeCode('any');
            if (isNaN(this.pager.input.pageNumber())) this.pager.input.pageNumberText('1');

            sessionStorage.setItem(SearchTable.KeywordSessionKey, this.keyword() || '');
            sessionStorage.setItem(SearchTable.CountrySessionKey, this.countryCode());
            sessionStorage.setItem(SearchTable.AncestorIdSessionKey, this.ancestorId().toString());
            sessionStorage.setItem(SearchTable.TypeSessionKey, this.typeCode());
            sessionStorage.setItem(SearchTable.PageNumberSessionKey, this.pager.input.pageNumberText());
            sessionStorage.setItem(SearchTable.PageSizeSessionKey, this.pager.input.pageSizeText());
            sessionStorage.setItem(SearchTable.OrderBySessionKey, this.orderBy());
        }).extend({ throttle: 0, });

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchTableSettings) {
            this._loadCountryOptions();
            this._loadAgreementTypes();
            this.sammy = this.settings.sammy || Sammy();
            this._runSammy();
            if (sessionStorage.getItem("agreementSaved") == "deleted") {
                sessionStorage.setItem("agreementSaved", "no");
                App.flasher.flash("Agreement deleted");
            }

            this.rootEstablishment = ttw.tenantId;//this.establishmentId();//settings.tenantId;
            this._loadTenancyData();
        }

        ////#endregion
        //#region Country Filter Options

        // initial options show loading message
        countryOptions: KnockoutObservableArray<Places.ApiModels.Country> = ko.observableArray(
            [{ code: 'any', name: '[Loading...]' }]);


        typeOptions: KnockoutObservableArray<Places.ApiModels.AgreementType> = ko.observableArray(
            [{ code: 'any', name: '[Loading...]' }]);

        private _countryChanged: KnockoutComputed<void> = ko.computed((): void => {
            this._onCountryChanged();
        });

        private _typeChanged: KnockoutComputed<void> = ko.computed((): void => {
            this._onTypeChanged();
        });

        private _onCountryChanged(): void {
            // changes when applyBindings happens and after options data is loaded
            var countryCode = this.countryCode();
            var options = this.countryOptions();
            // keep countryCode as an option so that we don't lose it when options change
            if (options.length == 1 && options[0].code != countryCode)
                options[0].code = countryCode;
        }
        private _onTypeChanged(): void {
            // changes when applyBindings happens and after options data is loaded
            var typeCode = this.typeCode();
            var options = this.typeOptions();
            // keep typeCode as an option so that we don't lose it when options change
            if (options.length == 1 && options[0].code != typeCode)
                options[0].code = typeCode;
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

        private _loadAgreementTypes(): JQueryDeferred<void> {
            // this will run once during construction
            // this will run before sammy and applyBindings...
            var deferred = $.Deferred();
            $.get("/api/agreements/agreement-types/0/")
                .done((response: Places.ApiModels.AgreementType[]): void => {
                    // ...but this will run after sammy and applyBindings
                    var options = response.slice(0);
                    // customize options
                    var any: Places.ApiModels.AgreementType = {
                        code: 'any',
                        name: '[All types]'
                    };
                    options = Enumerable.From([any]).Concat(options).ToArray();

                    this.typeOptions(options); // push into observable array
                    deferred.resolve();
                });
            return deferred;
        }

        //#endregion
        //#region Result Filter Pagination

        private _filterChanged = ko.computed((): void => {
            var keyword = this.keywordThrottled();
            var pageSize = this.pager.input.pageSize();
            var ancestorId = this.ancestorId();
            var countryCode = this.countryCode();
            var typeCode = this.typeCode();
            //alert('filter changed');
            this.pager.input.pageNumberText("1");
        });

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application;
        routeFormat: string = '#/{0}/country/{7}/type/{1}/sort/{2}/size/{3}/page/{4}/keyword/{5}/ancestorId/{6}'
            .format(this.settings.route).replace('{7}', '{0}');
        private _isActivated: KnockoutObservable<boolean> = ko.observable(false);

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            // sammy will run the first route that it matches
            var beforeRegex = new RegExp('\\{0}'.format(
                this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
            this.sammy.before(
                beforeRegex,
                function (): boolean {
                    var e: Sammy.EventContext = this;
                    return viewModel._onBeforeRoute(e);
                })

            // do this when we already have hashtag parameters in the page
            this.sammy.get(
                this.routeFormat.format(':country', ':type', ':sort', ':size', ':number', ':keyword', ':ancestorId'),
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
            var type = e.params['type'];
            var sort = e.params['sort'];
            var size = e.params['size'];
            var page = e.params['number'];
            var keyword = e.params['keyword'];
            var ancestorId = e.params['ancestorId'];

            // this will always run when the route is first activated, either explicitly from the URL
            // or after hitting the activation route pattern
            // it will also run when users page back & forward through the history
            // keyword is not stored as part of the route or history
            if(keyword == '*none*'){
                this.keyword("");
            } else {
                this.keyword(keyword);
            }
            //if (!this.keyword() && keyword) {
            //    this.keyword(keyword);
            //} 
            this.countryCode(country);
            this.ancestorId(ancestorId);
            this.typeCode(type);
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
            var typeCode = this.typeCode();
            var orderBy = this.orderBy();
            var pageSize = this.pager.input.pageSize();
            var pageNumber = this.pager.input.pageNumber();
            var keyword = this.keyword();
            var ancestorId = this.ancestorId();
            var route = this.routeFormat.format(countryCode, typeCode,
                orderBy, pageSize, pageNumber, keyword, ancestorId);
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
                typeCode: this.typeCode(),
                orderBy: this.orderBy(),
                ancestorId: this.ancestorId(),
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
            //if (!this._isActivated()) return; //this was causing the sammy route to never initialize if there was # in the url, like from a back button.

            var requestHistory = this._requestHistory();
            var lastRequest: SearchTableInput = requestHistory.length
                ? Enumerable.From(requestHistory).Last() : null;
            var thisRequest = this._currentRequest();

            //// do we know for a fact that the pageNumber is overflowed?

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
            this._loadSummary(lastRequest.countryCode, lastRequest.typeCode, lastRequest.keyword, lastRequest.ancestorId);
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

                        //this._updateStatus(response);
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
                && first.typeCode === second.typeCode
                && first.orderBy === second.orderBy
                && first.pageSize === second.pageSize
                && first.ancestorId === second.ancestorId
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