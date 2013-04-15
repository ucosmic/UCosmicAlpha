/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../PagedSearch.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="SearchResult.ts" />

interface Lens {
    text: string;
    value: string;
}

module ViewModels.Establishments {

    export class Search extends ViewModels.PagedSearch {

        constructor () {
            super();

            this._setupCountryDropDown();
            this._setupPagingSubscriptions();
            this._setupLensing();
            this._setupSammy();

            ko.computed((): void => {
                this.requestResults();
            }).extend({ throttle: 1 });
        }

        // countries dropdown
        private _setupCountryDropDown(): void {
            ko.computed((): void => {

                // populate countryCode based on last value when paging backwards
                var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                $.get(App.Routes.WebApi.Countries.get()) // hit the API
                .done((response: Places.IServerCountryApiModel[]): void => {
                    // setup empty value
                    var emptyValue = new Places
                        .ServerCountryApiModel('-1', '[Without country]');
                    response.splice(response.length, 0, emptyValue);

                    this.countries(response); // push into observable array

                    // restore selected value when paging backwards
                    if (lastCountryCode && lastCountryCode !== this.countryCode())
                        this.countryCode(lastCountryCode);
                });
            })
            .extend({ throttle: 1 });
        }

        // paging subscriptions
        private _setupPagingSubscriptions(): void {
            // whenever pageNumber changes, set the location for sammy
            this.pageNumber.subscribe((newValue: number) => {
                this.setLocation();
            });
        }

        // lensing
        private _setupLensing(): void {
            this.changeLens = (lens: Lens): void => {
                this.lens(lens.value);
            };
        }

        // sammy & URL hashing
        sammy: Sammy.Application = Sammy();

        private _setupSammy(): void {
            var self = this;
            this.sammy.before(/\#\/(page|parent\/page)\/(.*)\//, function () {
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                var pageNumber = this.params['pageNumber'];

                // make sure the viewmodel pagenumber is in sync with the route
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                return true;
            });

            this.sammy.get('#/page/:pageNumber/', function () {
                self.getPage(this);
            });

            // match /establishments or /establishments/
            this.sammy.get('/establishments[\/]?', function () {
                this.app.setLocation('#/page/1/');
            });
        }

        getPage(sammyContext: Sammy.EventContext): void {
            var trail = this.trail(),
                clone;
            if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path) return;
            if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                // swipe backward
                trail.pop();
                this.swipeCallback = (): void => {
                    clone = this.$itemsPage.clone(true)
                        .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    clone.appendTo(this.$itemsPage.parent());
                    this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    this.lockAnimation();
                    $(window).scrollTop(0);
                    this.sideSwiper.prev(1, (): void => {
                        this.$itemsPage.siblings().remove();
                        this.unlockAnimation();
                    });
                };
                return;
            } else if (trail.length > 0) {
                // swipe forward
                this.swipeCallback = (): void => {
                    clone = this.$itemsPage.clone(true)
                        .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    clone.insertBefore(this.$itemsPage);
                    this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    this.lockAnimation();
                    $(window).scrollTop(0);
                    this.sideSwiper.next(1, (): void => {
                        this.unlockAnimation();
                    });
                };
            }
            trail.push(sammyContext.path);
        }

        setLocation(): void {
            var location = '#/page/' + this.pageNumber() + '/';
            if (this.sammy.getLocation() !== location)
                this.sammy.setLocation(location);
        }

        // filtering
        countries: KnockoutObservableCountryModelArray = ko.observableArray();
        countryCode: KnockoutObservableString = ko.observable();

        // lensing
        lenses: KnockoutObservableArray = ko.observableArray([
            { text: 'Table', value: 'table' },
            { text: 'List', value: 'list' },
            { text: 'Grid', value: 'grid' },
            { text: 'Map', value: 'map' },
            { text: 'Tree', value: 'tree' }
        ]);
        lens: KnockoutObservableString = ko.observable();
        changeLens: (lens: Lens) => void;

        // items page
        $itemsPage: JQuery = undefined;
        sideSwiper = new App.SideSwiper({
            frameWidth: 710,
            speed: 'fast',
            root: '#search'
        });
        trail: KnockoutObservableStringArray = ko.observableArray([]);
        lockAnimation(): void {
            this.nextForceDisabled(true);
            this.prevForceDisabled(true);
        }
        unlockAnimation(): void {
            this.nextForceDisabled(false);
            this.prevForceDisabled(false);
        }

        // results
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
        receiveResults(js: IServerApiFlatModel[]): void {
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
            this.spinner.stop();
            this.swipeCallback();
            this.transitionedPageNumber(this.pageNumber());
        }

        requestResults(): void {
            if (this.pageSize() === undefined || this.orderBy() === undefined)
                return;
            this.spinner.start();

            $.get(App.Routes.WebApi.Establishments.get(), {
                pageSize: this.pageSize(),
                pageNumber: this.pageNumber(),
                countryCode: this.countryCode(),
                keyword: this.throttledKeyword(),
                orderBy: this.orderBy()
            })
            .done((response: IServerApiFlatModel[]): void => {
                this.receiveResults(response);
            });
        }

        // go to add new
        gotoAddNew(): bool {
            return true;
        }
    }
}
