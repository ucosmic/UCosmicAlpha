define(["require", "exports", '../amd-modules/Establishments/SearchResult', '../amd-modules/Establishments/Search'], function(require, exports, __SearchResultModule__, __SearchModule__) {
    var SearchResultModule = __SearchResultModule__;

    var SearchModule = __SearchModule__;

    var SearchResult = SearchResultModule.SearchResult;
    var Search = SearchModule.Search;
    var InstitutionalAgreementParticipantModel = (function () {
        function InstitutionalAgreementParticipantModel(participan) {
            this.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, new Search(false));
            this.isNotOwner = ko.computed(function () {
                return false;
            });
            isOwner:
false
            establishment:
new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, new Search(false))
            isNotOwner:
ko.computed(function () {
                return !participan.isOwner;
            })
        }
        return InstitutionalAgreementParticipantModel;
    })();    
    ;
    var InstitutionalAgreementEditModel = (function () {
        function InstitutionalAgreementEditModel(initDefaultPageRoute) {
            if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
            this.initDefaultPageRoute = initDefaultPageRoute;
            this.isBound = ko.observable();
            this.back = function () {
                history.back();
            };
            this.sideSwiper = new App.SideSwiper({
                speed: '',
                frameWidth: 970,
                root: '[data-current-module=agreements]'
            });
            this.participants = ko.observableArray();
            this.owner = new Search(false);
            this.tenantDomain = "uc.edu";
            this.sammy = Sammy();
            this.sammyBeforeRoute = /\#\/page\/(.*)\//;
            this.sammyGetPageRoute = '#/page/:pageNumber/';
            this.sammyDefaultPageRoute = '/Establishments[\/]?';
            this.trail = ko.observableArray([]);
            this.$itemsPage = undefined;
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            this.populateParticipants();
            this.setupSearchVM();
            this._setupSammy();
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
        }
        InstitutionalAgreementEditModel.prototype.populateParticipants = function () {
            var homeParticipant = new InstitutionalAgreementParticipantModel({
                isOwner: true,
                establishment: new SearchResult({
                    id: 1,
                    officialName: 'University of Cincinnati',
                    translatedName: 'University of Cincinnati',
                    officialUrl: 'www.uc.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner)
            });
            if(this.tenantDomain === 'usf.edu') {
                homeParticipant.establishment = new SearchResult({
                    id: 1,
                    officialName: 'University of South Florida',
                    translatedName: 'University of South Florida',
                    officialUrl: 'www.usf.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner);
            }
            if(this.tenantDomain === 'lehigh.edu') {
                homeParticipant.establishment = new SearchResult({
                    id: 1,
                    officialName: 'Lehigh University',
                    translatedName: 'Lehigh University',
                    officialUrl: 'www.lehigh.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner);
            }
            if(this.tenantDomain === 'umn.edu') {
                homeParticipant.establishment = new SearchResult({
                    id: 1,
                    officialName: 'University of Minnesota',
                    translatedName: 'University of Minnesota',
                    officialUrl: 'www.umn.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner);
            }
            if(this.tenantDomain === 'uc.edu') {
                homeParticipant.establishment = new SearchResult({
                    id: 1,
                    officialName: 'University of Cincinnati',
                    translatedName: 'University of Cincinnati',
                    officialUrl: 'www.uc.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner);
            }
            if(this.tenantDomain === 'suny.edu') {
                homeParticipant.establishment = new SearchResult({
                    id: 1,
                    officialName: 'State University of New York',
                    translatedName: 'State University of New York',
                    officialUrl: 'www.suny.edu',
                    countryName: 'United States',
                    countryCode: 'asdf',
                    uCosmicCode: 'asdf',
                    ceebCode: 'asdf'
                }, this.owner);
            }
            this.participants.push(homeParticipant);
        };
        InstitutionalAgreementEditModel.prototype.setupSearchVM = function () {
            var establishmentSearchViewModel = new Search();
            establishmentSearchViewModel.sammy = undefined;
            establishmentSearchViewModel.nextPage = function () {
                if(establishmentSearchViewModel.nextEnabled()) {
                    var pageNumber = parseInt(establishmentSearchViewModel.pageNumber()) + 1;
                    location.hash = '/participants/add/page/' + pageNumber;
                }
            };
            establishmentSearchViewModel.prevPage = function () {
                if(establishmentSearchViewModel.prevEnabled()) {
                    history.back();
                }
            };
            establishmentSearchViewModel.items.subscribe(function (newValue) {
                if(newValue && newValue.length) {
                    for(var i = 0; i < newValue.length; i++) {
                        if(newValue[i].clickAction !== this.addParticipant) {
                            newValue[i].clickAction = this.addParticipant;
                        }
                    }
                }
            });
        };
        InstitutionalAgreementEditModel.prototype.removeParticipant = function (establishmentResultViewModel, e) {
            if(confirm('Are you sure you want to remove "' + establishmentResultViewModel.translatedName() + '" as a participant from this agreement?')) {
                var self = this;
                self.participants.remove(function (item) {
                    if(item.establishment.id() === establishmentResultViewModel.id()) {
                        $(item.participantEl).slideUp('fast', function () {
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
        InstitutionalAgreementEditModel.prototype.addParticipant = function (establishmentResultViewModel) {
            var participant = new InstitutionalAgreementParticipantModel({
                isOwner: false,
                establishment: establishmentResultViewModel
            });
            this.participants.push(participant);
            location.hash = "#/";
        };
        InstitutionalAgreementEditModel.prototype._setupSammy = function () {
            var self = this;
            self.sammy.before(self.sammyBeforeRoute, function () {
                self.beforePage(this);
            });
            self.sammy.get(self.sammyGetPageRoute, function () {
                self.getPage(this);
            });
            if(self.initDefaultPageRoute) {
                self.sammy.get(self.sammyDefaultPageRoute, function () {
                    self.initPageHash(this);
                });
            }
        };
        InstitutionalAgreementEditModel.prototype.swipeCallback = function () {
        };
        InstitutionalAgreementEditModel.prototype.lockAnimation = function () {
            this.nextForceDisabled(true);
            this.prevForceDisabled(true);
        };
        InstitutionalAgreementEditModel.prototype.unlockAnimation = function () {
            this.nextForceDisabled(false);
            this.prevForceDisabled(false);
        };
        InstitutionalAgreementEditModel.prototype.getPage = function (sammyContext) {
            var _this = this;
            var trail = this.trail(), clone;
            if(trail.length > 0 && trail[trail.length - 1] === sammyContext.path) {
                return;
            }
            if(trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                trail.pop();
                this.swipeCallback = function () {
                    clone = _this.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    clone.appendTo(_this.$itemsPage.parent());
                    _this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    _this.lockAnimation();
                    $(window).scrollTop(0);
                    _this.sideSwiper.prev(1, function () {
                        _this.$itemsPage.siblings().remove();
                        _this.unlockAnimation();
                    });
                };
                return;
            } else if(trail.length > 0) {
                this.swipeCallback = function () {
                    clone = _this.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    clone.insertBefore(_this.$itemsPage);
                    _this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    _this.lockAnimation();
                    $(window).scrollTop(0);
                    _this.sideSwiper.next(1, function () {
                        _this.unlockAnimation();
                    });
                };
            }
            trail.push(sammyContext.path);
        };
        InstitutionalAgreementEditModel.prototype.beforePage = function (sammyContext) {
            if(this.nextForceDisabled() || this.prevForceDisabled()) {
                return false;
            }
            var pageNumber = sammyContext.params['pageNumber'];
            if(pageNumber && parseInt(pageNumber) !== parseInt(this.pageNumber())) {
                this.pageNumber(parseInt(pageNumber));
            }
            return true;
        };
        InstitutionalAgreementEditModel.prototype.initPageHash = function (sammyContext) {
            sammyContext.app.setLocation('#/page/1/');
        };
        InstitutionalAgreementEditModel.prototype.setLocation = function () {
            var location = '#/page/' + this.pageNumber() + '/';
            if(this.sammy.getLocation() !== location) {
                this.sammy.setLocation(location);
            }
        };
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
