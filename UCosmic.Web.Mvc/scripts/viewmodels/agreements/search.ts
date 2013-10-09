/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/PagedSearch.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../places/ApiModels.d.ts" />
/// <reference path="SearchResult.ts" />
/// <reference path="ApiModels.d.ts" />
/// <reference path="./publicView.ts" />

module Agreements.ViewModels {

    export interface Lens {
        text: string;
        value: string;
    }

    export class Search extends App.PagedSearch {

        constructor (public initDefaultPageRoute: boolean = true) {
            super();
            this.publicViewClass = new Agreements.ViewModels.PublicView();
            ko.applyBindings(this.publicViewClass, $('#publicView')[0]);

            this.domain = window.location.href.toLowerCase();
            this.domain = this.domain.substring(this.domain.indexOf("agreements/") + 11);
            var domainIndexOf = (this.domain.indexOf("/") > 0) ? this.domain.indexOf("/") : this.domain.length;
            this.domain = this.domain.substring(0, domainIndexOf);

            this.clickAction = <() => boolean > this.clickAction.bind(this);

            this._setupCountryDropDown();
            this._setupPagingSubscriptions();
            this._setupLensing();

            this._setupSammy();
            this._setupPagingDefaults();
            this.changeLens(this.lenses()[0]);
            this.requestResults = <() => void > this.requestResults.bind(this);
        }
        header = ko.observable();
        $searchResults = $("#searchResults");
        dfdFadeInOut = $.Deferred();
        dfdFadeInOut2 = $.Deferred();
        domain;
        //imported classes
        publicViewClass
        
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
        sammyDefaultPageRoute: any = '/agreements/(.*)[\/]?';

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

            ko.computed((): void => {
                self.requestResults();
            }).extend({ throttle: 1 });
        }

        getPage(sammyContext: Sammy.EventContext): void {
            if (window.location.href.indexOf("agreements/new") != -1 || window.location.href.indexOf("agreements/settings") != -1) {
                this.sammy.destroy();
                window.location.hash = "";
                window.location.reload();
                return ;
            }
            var trail = this.trail(),
                clone;
            if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path) return;
            if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                // swipe backward
                trail.pop();
                //this.swipeCallback = (): void => {
                    //clone = this.$itemsPage.clone(true)
                    //    .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    //clone.appendTo(this.$itemsPage.parent());
                    //this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    //this.lockAnimation();
                    //$(window).scrollTop(0);
                    //this.sideSwiper.prev(1, (): void => {
                    //    this.$itemsPage.siblings().remove();
                    //    this.unlockAnimation();
                    //});
                //};
                return;
            } else if (trail.length > 0) {
                // swipe forward
                //this.swipeCallback = (): void => {
                    //clone = this.$itemsPage.clone(true)
                    //    .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    //clone.insertBefore(this.$itemsPage);
                    //this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    //this.lockAnimation();
                    //$(window).scrollTop(0);
                    //this.sideSwiper.next(1, (): void => {
                    //    this.unlockAnimation();
                    //});
                //};
            }
            trail.push(sammyContext.path);
        }

        beforePage(sammyContext: Sammy.EventContext): boolean {
            var pageNumber;
            if (this.nextForceDisabled() || this.prevForceDisabled())
                return false;

            pageNumber = sammyContext.params['pageNumber'];

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
        countries: KnockoutObservableArray<Places.ApiModels.Country> = ko.observableArray();
        countryCode: KnockoutObservable<string> = ko.observable();

        // lensing
        lenses: KnockoutObservableArray<Lens> = ko.observableArray([
            { text: 'Table', value: 'table' },
            { text: 'List', value: 'list' }//,
            //{ text: 'Grid', value: 'grid' },
            //{ text: 'Map', value: 'map' },
            //{ text: 'Tree', value: 'tree' }
        ]);
        lens: KnockoutObservable<string> = ko.observable();
        changeLens: (lens: Lens) => void;

        // items page
        $itemsPage: JQuery = undefined;
        sideSwiper = new App.SideSwiper({
            frameWidth: 710,
            speed: 'fast',
            root: '#search'
        });
        trail: KnockoutObservableArray<string> = ko.observableArray([]);
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
            //this.swipeCallback();
            this.transitionedPageNumber(this.pageNumber());
            this.dfdFadeInOut2.resolve();
        }

        requestResults(): void {
            if (this.pageSize() === undefined || this.orderBy() === undefined)
                return;
            this.spinner.start();
            $.when(this.dfdFadeInOut2)
                .done(() => {
                    this.spinner.stop();
                    this.$searchResults.fadeIn(400);
                    this.dfdFadeInOut = $.Deferred();
                    this.dfdFadeInOut2 = $.Deferred();
                });
            if (this.$searchResults.is(":visible")) {
                this.$searchResults.fadeOut(400, () => {
                    this.dfdFadeInOut.resolve();
                });
            } else {
                this.dfdFadeInOut.resolve();
            }
            $.get(App.Routes.WebApi.Agreements.Search.get(), {
                pageSize: this.pageSize(),
                pageNumber: this.pageNumber(),
                countryCode: this.countryCode(),
                keyword: this.throttledKeyword(),
                orderBy: this.orderBy(),
                myDomain: this.domain
            })
                .done((response: ApiModels.FlatEstablishment[]): void => {
                    $.when(this.dfdFadeInOut)
                        .done(() => {
                            this.receiveResults(response);
                        });
            });
        }

        // go to add new
        gotoAddNew(): boolean {
            return true;
        }

        // click item
        // TODO: is this still needed?
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {

            //this.sammy.unload();
            //location.hash = "";
            //location.pathname = "agreements/" + viewModel.id() + "/"


            // to do the following I need to set a location with sammy
            //$("nav.bib .search").removeClass("current");
            //$("nav.bib ul").append("<li class='view current'><span> View </span></ li>");
            //this.publicViewClass.agreementId.val = viewModel.id();
            //this.publicViewClass.getData();
            //$("#search").fadeOut(500, function () {
            //    $("#publicView").fadeIn(500);
            //});
            
            return true;
        }

        detailHref(id: number): string {
            return App.Routes.Mvc.Establishments.show(id);
        }

        detailTooltip(): string {
            return 'View & edit this agreement\'s details';
        }

        private _setupPagingDefaults(): void {
            this.orderBy('country');
            this.pageSize(10);
        }
    }
}
