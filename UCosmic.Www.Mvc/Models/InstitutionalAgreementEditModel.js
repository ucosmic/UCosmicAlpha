/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.1.0.js" />
/// <reference path="../scripts/sammy/sammy.js" />
/// <reference path="BaseViewModel.js" />
/// <reference path="EstablishmentSearchViewModel.js" />
/// <reference path="../scripts/app/side-swiper.js" />

function InstitutionalAgreementParticipantModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);

    self.isNotOwner = ko.computed(function () {
        return !self.isOwner();
    });

    self.participantEl = undefined;
}

function InstitutionalAgreementEditModel() {
    var self = this;
    BaseViewModel.call(self);

    self.sideSwiper = new SideSwiper({
        frameWidth: 970,
        root: '[data-current-module=agreements]'
    });

    // participants
    self.participants = ko.observableArray();

    // HACK ALERT: make this work for demo purposes. Customize home participant based on cookie.
    var tenantDomain = $('#tenancy_domain').val();
    var homeParticipant = new InstitutionalAgreementParticipantModel({
        isOwner: true,
        establishment: new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'My Home Institution (automatically detected based on who is signed in)',
            translatedName: 'My Home Institution (automatically detected based on who is signed in)',
            websiteUrl: 'www.myinstitution.edu',
            countryName: 'Earth'
        })
    });
    if (tenantDomain === 'usf.edu') {
        homeParticipant.establishment = new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'University of South Florida',
            translatedName: 'University of South Florida',
            websiteUrl: 'www.usf.edu',
            countryName: 'United States'
        });
    }
    if (tenantDomain === 'lehigh.edu') {
        homeParticipant.establishment = new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'Lehigh University',
            translatedName: 'Lehigh University',
            websiteUrl: 'www.lehigh.edu',
            countryName: 'United States'
        });
    }
    if (tenantDomain === 'umn.edu') {
        homeParticipant.establishment = new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'University of Minnesota',
            translatedName: 'University of Minnesota',
            websiteUrl: 'www.umn.edu',
            countryName: 'United States'
        });
    }
    if (tenantDomain === 'uc.edu') {
        homeParticipant.establishment = new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'University of Cincinnati',
            translatedName: 'University of Cincinnati',
            websiteUrl: 'www.uc.edu',
            countryName: 'United States'
        });
    }
    if (tenantDomain === 'suny.edu') {
        homeParticipant.establishment = new EstablishmentResultViewModel({
            revisionId: 1,
            officialName: 'State University of New York',
            translatedName: 'State University of New York',
            websiteUrl: 'www.suny.edu',
            countryName: 'United States'
        });
    }
    //var partnerParticipant1 = new InstitutionalAgreementParticipantModel({
    //    isOwner: false,
    //    establishment: new EstablishmentResultViewModel({
    //        revisionId: 2,
    //        officialName: 'Universität zu Köln',
    //        translatedName: 'University of Cologne',
    //        websiteUrl: 'www.uni-koeln.de',
    //        countryName: 'Germany'
    //    })
    //});
    self.participants.push(homeParticipant);
    //self.participants.push(partnerParticipant1);

    // nest the establishment search viewmodel
    self.establishmentSearchViewModel = new EstablishmentSearchViewModel();

    // manage routing in this viewmodel, not the nested one
    self.establishmentSearchViewModel.sammy = undefined;

    // override next & prev page clicks
    self.establishmentSearchViewModel.nextPage = function() {
        if (self.establishmentSearchViewModel.nextEnabled()) {
            var pageNumber = parseInt(self.establishmentSearchViewModel.pageNumber()) + 1;
            location.hash = '/participants/add/page/' + pageNumber;
        }
    };
    self.establishmentSearchViewModel.prevPage = function () {
        if (self.establishmentSearchViewModel.prevEnabled()) {
            history.back();
        }
    };

    // override establishment item click to add as participant
    self.addParticipant = function (establishmentResultViewModel) {
        var participant = new InstitutionalAgreementParticipantModel({
            isOwner: false,
            establishment: establishmentResultViewModel
        });
        self.participants.push(participant);
        location.hash = "#/";
    };
    self.establishmentSearchViewModel.items.subscribe(function (newValue) {
        if (newValue && newValue.length) {
            for (var i = 0; i < newValue.length; i++) {
                if (newValue[i].clickAction !== self.addParticipant) {
                    newValue[i].clickAction = self.addParticipant;
                }
            }
        }
    });
    self.removeParticipant = function (establishmentResultViewModel, e) {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.translatedName() +
            '" as a participant from this agreement?')) {
            self.participants.remove(function (item) {
                if (item.establishment.revisionId() === establishmentResultViewModel.revisionId()) {
                    $(item.participantEl).slideUp('fast', function() {
                        self.participants.remove(item);
                    });
                }
                return false;
            });
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
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
                    self.establishmentSearchViewModel.pageNumber(pageNumber);
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

    self.isBound(true);
}
