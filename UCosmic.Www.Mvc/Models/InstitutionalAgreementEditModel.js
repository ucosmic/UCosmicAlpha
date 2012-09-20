function InstitutionalAgreementEditModel() {
    var self = this;
    BaseViewModel.call(self);

    self.sideSwiper = new SideSwiper({
        frameWidth: 970,
        root: '[data-current-module=agreements]'
    });

    self.establishmentSearchViewModel = new EstablishmentSearchViewModel();

    // manage routing in this viewmodel, not the nested one
    self.establishmentSearchViewModel.sammy = undefined;

    // override next & prev page clicks
    self.establishmentSearchViewModel.nextPage = function() {
        if (self.establishmentSearchViewModel.nextEnabled()) {
            var pageNumber = parseInt(self.establishmentSearchViewModel.pageNumber()) + 1;
            self.establishmentSearchViewModel.pageNumber(pageNumber);
            location.hash = '/participants/add/page/' + pageNumber;
        }
    };
    self.establishmentSearchViewModel.prevPage = function () {
        if (self.establishmentSearchViewModel.prevEnabled()) {
            var pageNumber = parseInt(self.establishmentSearchViewModel.pageNumber()) - 1;
            self.establishmentSearchViewModel.pageNumber(pageNumber);
            history.back();
        }
    };

    var dataSideSwiper = 'data-side-swiper';
    var sam = undefined;
    self.sammy = function() {
        if (sam) return sam;
        sam = Sammy(function () {
            this.get('#/', function () {
                if ($('#participants_add').attr(dataSideSwiper) === 'on') {
                    self.sideSwiper.prev();
                }
            });

            this.get('#/participants/add/page/:pageNumber', function () {
                if ($('#all').attr(dataSideSwiper) === 'on') {
                    self.sideSwiper.next();
                    self.establishmentSearchViewModel.trail().push(this.path);
                }
                else if ($('#participants_add').attr(dataSideSwiper) === 'on') {
                    var pageNumber = this.params['pageNumber'],
                        trail = self.establishmentSearchViewModel.trail(),
                        clone;
                    if (trail.length > 0 && trail[trail.length - 1] === this.path) return;
                    if (trail.length > 1 && trail[trail.length - 2] === this.path) {
                        // swipe backward
                        trail.pop();
                        clone = self.establishmentSearchViewModel.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.appendTo(self.establishmentSearchViewModel.$itemsPage().parent());
                        self.establishmentSearchViewModel.$itemsPage().attr('data-side-swiper', 'off').hide();
                        self.establishmentSearchViewModel.lockAnimation();
                        $(window).scrollTop(0);
                        self.establishmentSearchViewModel.sideSwiper.prev(1, function () {
                            self.establishmentSearchViewModel.$itemsPage().siblings().remove();
                            self.establishmentSearchViewModel.unlockAnimation();
                        });
                        return;
                    } else if (trail.length > 0) {
                        // swipe forward
                        clone = self.establishmentSearchViewModel.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.insertBefore(self.establishmentSearchViewModel.$itemsPage());
                        self.establishmentSearchViewModel.$itemsPage().attr('data-side-swiper', 'off').data('side-swiper', 'off').hide();
                        self.establishmentSearchViewModel.lockAnimation();
                        $(window).scrollTop(0);
                        self.establishmentSearchViewModel.sideSwiper.next(1, function () {
                            self.establishmentSearchViewModel.unlockAnimation();
                            //self.establishmentSearchViewModel.nextForceDisabled(false);
                        });
                    }
                    trail.push(this.path);
                }
            });

            this.get('', function () {
                this.app.runRoute('get', '#/');
            });
        });
        return sam;
    };
}
