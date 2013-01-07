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

  // comment
    export class Search extends ViewModels.PagedSearch {

        constructor () {
            super();

            // countries dropdown
            ko.computed((): void => {
                var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();
                $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.IServerCountryApiModel[]): void => {
                    var emptyValue = new Places.ServerCountryApiModel('-1', '[Without country]');
                    response.splice(response.length, 0, emptyValue);
                    this.countries(response);
                    if (lastCountryCode && lastCountryCode !== this.countryCode())
                        this.countryCode(lastCountryCode);
                });
            })
            .extend({ throttle: 1 });

            // paging subscriptions
            this.pageNumber.subscribe((newValue: number) => {
                this.setLocation();
            });

            // lensing
            this.changeLens = (lens: Lens): void => {
                this.lens(lens.value);
            };

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
                        clone = self.$itemsPage.clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.appendTo(self.$itemsPage.parent());
                        self.$itemsPage.attr('data-side-swiper', 'off').hide();
                        self.lockAnimation();
                        $(window).scrollTop(0);
                        self.sideSwiper.prev(1, function () {
                            self.$itemsPage.siblings().remove();
                            self.unlockAnimation();
                        });
                    };
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                    self.swipeCallback = function () {
                        clone = self.$itemsPage.clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.insertBefore(self.$itemsPage);
                        self.$itemsPage.attr('data-side-swiper', 'off').hide();
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
            .done((response: IServerApiModel[]): void => {
                this.receiveResults(response);
            });
        }

        // go to add new
        gotoAddNew(): bool {
            return true;
        }
    }
}
