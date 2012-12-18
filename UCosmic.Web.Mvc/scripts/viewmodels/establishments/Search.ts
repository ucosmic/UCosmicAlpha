/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../countries/ServerApiModel.ts" />
/// <reference path="ServerApiModel.ts" />
/// <reference path="SearchResult.ts" />

// need this to allow parseInt to operate on numbers as well as strings
declare function parseInt(n: number, radix?: number): number;

interface Lens {
    text: string;
    value: string;
}

module ViewModels.Establishments {

    export class Search {

        // computed observables
        throttledKeyword: KnockoutComputed;
        pageCount: KnockoutComputed;
        pageIndex: KnockoutComputed;
        firstIndex: KnockoutComputed;
        firstNumber: KnockoutComputed;
        lastNumber: KnockoutComputed;
        lastIndex: KnockoutComputed;
        nextEnabled: KnockoutComputed;
        prevEnabled: KnockoutComputed;
        hasManyPages: KnockoutComputed;
        hasItems: KnockoutComputed;
        hasManyItems: KnockoutComputed;
        hasNoItems: KnockoutComputed;
        showStatus: KnockoutComputed;

        constructor () {
            // keyword input throttler
            this.throttledKeyword = ko.computed(this.keyword)
                .extend({ throttle: 400 });

            // countries dropdown
            ko.computed((): void => {
                var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();
                $.get(App.Routes.WebApi.Countries.get())
                .done((response: Countries.IServerApiModel[]): void => {
                    var emptyValue = new Countries.ServerApiModel('-1', '[Without country]');
                    response.splice(response.length, 0, emptyValue);
                    this.countries(response);
                    if (lastCountryCode && lastCountryCode !== this.countryCode())
                        this.countryCode(lastCountryCode);
                });
            })
            .extend({ throttle: 1 });

            // paging computeds
            this.pageCount = ko.computed((): number => {
                return Math.ceil(this.itemTotal() / this.pageSize());
            });
            this.pageIndex = ko.computed((): number =>  {
                return parseInt(this.transitionedPageNumber()) - 1;
            });
            this.firstIndex = ko.computed((): number => {
                return this.pageIndex() * this.pageSize();
            });
            this.firstNumber = ko.computed((): number => {
                return this.firstIndex() + 1;
            });
            this.lastNumber = ko.computed((): number => {
                if (!this.items) return 0;
                return this.firstIndex() + this.items().length;
            });
            this.lastIndex = ko.computed((): number => {
                return this.lastNumber() - 1;
            });
            this.nextEnabled = ko.computed((): bool => {
                return this.pageNumber() < this.pageCount() && !this.nextForceDisabled();
            });
            this.prevEnabled = ko.computed((): bool => {
                return this.pageNumber() > 1 && !this.prevForceDisabled();
            });
            this.hasManyPages = ko.computed((): bool => {
                return this.pageCount() > 1;
            });
            this.hasManyItems = ko.computed((): bool => {
                return this.lastNumber() > this.firstNumber();
            });

            // paging subscriptions
            this.pageCount.subscribe((newValue: number) => {
                if (this.pageNumber() && this.pageNumber() > newValue)
                    this.pageNumber(1);
            });
            this.pageNumber.subscribe((newValue: number) => {
                this.setLocation();
            });

            // results computeds
            this.hasItems = ko.computed((): bool => {
                return this.items() && this.items().length > 0;
            });
            this.hasNoItems = ko.computed((): bool => {
                return !this.isSpinning() && !this.hasItems();
            });
            this.showStatus = ko.computed((): bool => {
                return this.hasItems() && !this.showSpinner();
            });

            // sammy
            var self = this;
            this.sammy.before(/\#\/page\/(.*)/, function () {
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                var pageNumber = this.params['pageNumber'];

                // make sure the viewmodel pagenumber is in sync with the route
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                return true;
            });

            this.sammy.get('#/page/:pageNumber/', function () {
                var trail = self.trail(),
                    clone;
                if (trail.length > 0 && trail[trail.length - 1] === this.path) return;
                if (trail.length > 1 && trail[trail.length - 2] === this.path) {
                    // swipe backward
                    trail.pop();
                    self.swipeCallback = function () {
                        clone = self.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.appendTo(self.$itemsPage().parent());
                        self.$itemsPage().attr('data-side-swiper', 'off').hide();
                        self.lockAnimation();
                        $(window).scrollTop(0);
                        self.sideSwiper.prev(1, function () {
                            self.$itemsPage().siblings().remove();
                            self.unlockAnimation();
                        });
                    };
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                    self.swipeCallback = function () {
                        clone = self.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.insertBefore(self.$itemsPage());
                        self.$itemsPage().attr('data-side-swiper', 'off').hide();
                        self.lockAnimation();
                        $(window).scrollTop(0);
                        self.sideSwiper.next(1, function () {
                            self.unlockAnimation();
                        });
                    };
                }
                trail.push(this.path);
            });

            // match /establishments or /establishments/
            this.sammy.get('/establishments[\/]?', function () {
                this.app.setLocation('#/page/1/');
            });

            ko.computed((): void => {
                this.requestResults();
            }).extend({ throttle: 1 });
        }

        // sammy & URL hashing
        sammy: Sammy.Application = Sammy();
        setLocation(): void {
            var location = '#/page/' + this.pageNumber() + '/';
            if (this.sammy.getLocation() !== location)
                this.sammy.setLocation(location);
        }

        // query parameters
        countries: KnockoutObservableArray = ko.observableArray();
        countryCode: KnockoutObservableString = ko.observable();
        keywordElement: Element = undefined;
        keyword: KnockoutObservableString =
            ko.observable($('input[type=hidden][data-bind="value: keyword"]').val());
        orderBy: KnockoutObservableString = ko.observable();

        // paging
        pageSize: KnockoutObservableNumber = ko.observable();
        pageNumber: KnockoutObservableNumber = ko.observable();
        transitionedPageNumber: KnockoutObservableNumber = ko.observable();
        itemTotal: KnockoutObservableNumber = ko.observable();
        nextForceDisabled: KnockoutObservableBool = ko.observable(false);
        prevForceDisabled: KnockoutObservableBool = ko.observable(false);
        nextPage(): void {
            if (this.nextEnabled()) {
                var pageNumber = parseInt(this.pageNumber()) + 1;
                this.pageNumber(pageNumber);
            }
        }
        prevPage(): void {
            if (this.prevEnabled())
                history.back();
        }

        // lensing
        lenses: KnockoutObservableArray = ko.observableArray([
            { text: 'Table', value: 'table' },
            { text: 'List', value: 'list' },
            { text: 'Grid', value: 'grid' },
            { text: 'Map', value: 'map' },
            { text: 'Tree', value: 'tree' }
        ]);
        lens: KnockoutObservableString = ko.observable();
        changeLens(lens: Lens): void {
            this.lens(lens.value);
        }

        // spinner
        private spinnerDelay: number = 400;
        isSpinning: KnockoutObservableBool = ko.observable(true);
        showSpinner: KnockoutObservableBool = ko.observable(false);
        inTransition: KnockoutObservableBool = ko.observable(false);
        startSpinning(): void {
            this.isSpinning(true); // we are entering an ajax call
            if (this.spinnerDelay < 1)
                this.showSpinner(true);
            else
                setTimeout((): void => {
                    // only show spinner when load is still being processed
                    if (this.isSpinning() && !this.inTransition())
                        this.showSpinner(true);
                }, this.spinnerDelay);
        }
        stopSpinning(): void {
            this.inTransition(false);
            this.showSpinner(false);
            this.isSpinning(false);
        }

        // items page
        itemsPage: Element = undefined;
        initialized: KnockoutObservableBool = ko.observable(false);
        $itemsPage(): JQuery {
            return $(this.itemsPage);
        }
        sideSwiper = new App.SideSwiper({
            frameWidth: 710,
            speed: 'fast',
            root: '#search'
        });
        trail: KnockoutObservableArray = ko.observableArray([]);
        lockAnimation(): void {
            this.nextForceDisabled(true);
            this.prevForceDisabled(true);
        }
        unlockAnimation(): void {
            this.nextForceDisabled(false);
            this.prevForceDisabled(false);
        }

        // results
        items: KnockoutObservableArray = ko.observableArray();
        resultsMapping = {
            'items': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.id);
                },
                create: function (options) {
                    return new ViewModels.Establishments.SearchResult(options.data);
                }
            },
            ignore: ['pageSize', 'pageNumber']
        };
        swipeCallback(): void {
        }
        receiveResults(js: IServerApiModel[]): void {
            if (!js) {
                ko.mapping.fromJS({
                    items: [],
                    itemTotal: 0
                }, this.resultsMapping, this);
            }
            else {
                ko.mapping.fromJS(js, this.resultsMapping, this);
            }
            App.WindowScroller.restoreTop(); // restore scroll when coming back from detail page
            this.stopSpinning();
            this.swipeCallback();
            this.transitionedPageNumber(this.pageNumber());
        }

        requestResults(): void {
            if (this.pageSize() === undefined || this.orderBy() === undefined)
                return;
            this.startSpinning();

            $.get(App.Routes.WebApi.Establishments.get(), {
                pageSize: this.pageSize(),
                pageNumber: this.pageNumber(),
                countryCode: this.countryCode(),
                keyword: this.throttledKeyword(),
                orderBy: this.orderBy()
            })
            .done((response: IServerApiModel[]): void => {
                this.receiveResults(response);
                this.initialized(true);
            });
        }

        // go to add new
        gotoAddNew(): bool {
            return true;
        }
    }
}
