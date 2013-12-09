interface Lens {
    text: string;
    value: string;
}

module Establishments.ViewModels {

    export class Search extends App.PagedSearch {

        constructor (public initDefaultPageRoute: boolean = true) {
            super();

            this._setupCountryDropDown();
            this._setupPagingSubscriptions();
            this._setupLensing();
            this._setupSammy();

            ko.computed((): void => {
                this.requestResults();
            }).extend({ throttle: 1 });
        }

        header = ko.observable();
        // countries dropdown
        private _setupCountryDropDown(): void {
            ko.computed((): void => {

                // populate countryCode based on last value when paging backwards
                var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                $.get(App.Routes.WebApi.Countries.get()) // hit the API
                .done((response: Places.ApiModels.Country[]): void => {
                    // setup empty value
                    var emptyValue: Places.ApiModels.Country = {
                        code: '-1',
                        name: '[Without country]'
                    };
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
        sammyBeforeRoute: any = /\#\/page\/(.*)\//;
        sammyGetPageRoute: any = '#/page/:pageNumber/';
        sammyDefaultPageRoute: any = '/establishments[\/]?';

        private _setupSammy(): void {
            var self = this;
            self.sammy.before(self.sammyBeforeRoute, function () {
                self.beforePage(this);
            });

            self.sammy.get(self.sammyGetPageRoute, function () {
                self.getPage(this);
            });

            if (self.initDefaultPageRoute) {
                // match /establishments or /establishments/
                self.sammy.get(self.sammyDefaultPageRoute, function () {
                    self.initPageHash(this);
                });
            }
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

        beforePage(sammyContext: Sammy.EventContext): boolean {
            if (this.nextForceDisabled() || this.prevForceDisabled())
                return false;

            var pageNumber = sammyContext.params['pageNumber'];

            // make sure the viewmodel pagenumber is in sync with the route
            if (pageNumber && parseInt(pageNumber) !== Number(this.pageNumber()))
                this.pageNumber(parseInt(pageNumber));
            return true;
        }

        initPageHash(sammyContext: Sammy.EventContext): void {
            sammyContext.app.setLocation('#/page/1/');
        }

        setLocation(): void {
            var location = '#/page/' + this.pageNumber() + '/';
            if (this.sammy.getLocation() !== location)
                this.sammy.setLocation(location);
        }

        // filtering
        countries = ko.observableArray<Places.ApiModels.Country>();
        countryCode = ko.observable<string>();

        // lensing
        lenses: KnockoutObservableArray<Lens> = ko.observableArray([
            { text: 'Table', value: 'table' },
            { text: 'List', value: 'list' }//,
            //{ text: 'Grid', value: 'grid' },
            //{ text: 'Map', value: 'map' },
            //{ text: 'Tree', value: 'tree' }
        ]);
        lens = ko.observable<string>();
        changeLens: (lens: Lens) => void;

        // items page
        $itemsPage: JQuery = undefined;
        sideSwiper = new App.SideSwiper({
            frameWidth: 710,
            speed: 'fast',
            root: '#search'
        });
        trail = ko.observableArray<string>([]);
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
                    return new SearchResult(options.data, options.parent);
                }
            },
            ignore: ['pageSize', 'pageNumber']
        };
        swipeCallback(): void {
        }
        receiveResults(js: ApiModels.FlatEstablishment[]): void {
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
            .done((response: ApiModels.FlatEstablishment[]): void => {
                this.receiveResults(response);
            });
        }

        // go to add new
        gotoAddNew(): boolean {
            return true;
        }

        // click item
        // TODO: is this still needed?
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {
            //var href, $target = $(e.target);
            //while ($target.length && !$target.attr('href') && !$target.attr('data-href')) {
            //    $target = $target.parent();
            //}
            //if ($target.length) {
            //    href = $target.attr('href') || $target.attr('data-href');
            //    location.href = href.replace('/0/', '/' + viewModel.id() + '/');
            //}
            return true;
        }

        detailHref(id: number): string {
            return App.Routes.Mvc.Establishments.show(id);
        }

        detailTooltip(): string {
            return 'View & edit this establishment\'s details';
        }
    }
}
