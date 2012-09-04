function InstitutionalAgreementEditModel() {
    var self = this;
    BaseViewModel.call(self);

    self.sideSwiper = new SideSwiper({
        frameWidth: 710
    });

    var dataSideSwiper = 'data-side-swiper';
    Sammy(function () {
        this.get('#/', function () {
            if ($('#participants_add').attr(dataSideSwiper) === 'on') {
                self.sideSwiper.prev();
            }
        });

        this.get('#/participants/add', function () {
            if ($('#all').attr(dataSideSwiper) === 'on') {
                self.sideSwiper.next();
            }
        });

        this.get('', function () {
            this.app.runRoute('get', '#/');
        });
    }).run();
}
