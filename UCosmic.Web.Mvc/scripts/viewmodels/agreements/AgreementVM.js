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
    function InstitutionalAgreementEditModel() {
        var self = this;
        self.isBound = ko.observable();
        self.back = function () {
            history.back();
        };
        self.sideSwiper = new App.SideSwiper({
            speed: '',
            frameWidth: 970,
            root: '[data-current-module=agreements]'
        });
        self.participants = ko.observableArray();
        var owner = new Search(false);
        var tenantDomain = "uc.edu";
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
            }, owner)
        });
        if(tenantDomain === 'usf.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of South Florida',
                translatedName: 'University of South Florida',
                officialUrl: 'www.usf.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, owner);
        }
        if(tenantDomain === 'lehigh.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'Lehigh University',
                translatedName: 'Lehigh University',
                officialUrl: 'www.lehigh.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, owner);
        }
        if(tenantDomain === 'umn.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Minnesota',
                translatedName: 'University of Minnesota',
                officialUrl: 'www.umn.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, owner);
        }
        if(tenantDomain === 'uc.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, owner);
        }
        if(tenantDomain === 'suny.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'State University of New York',
                translatedName: 'State University of New York',
                officialUrl: 'www.suny.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, owner);
        }
        self.participants.push(homeParticipant);
        self.establishmentSearchViewModel = new Search();
        self.establishmentSearchViewModel.sammy = undefined;
        self.establishmentSearchViewModel.nextPage = function () {
            if(self.establishmentSearchViewModel.nextEnabled()) {
                var pageNumber = parseInt(self.establishmentSearchViewModel.pageNumber()) + 1;
                location.hash = '/participants/add/page/' + pageNumber;
            }
        };
        self.establishmentSearchViewModel.prevPage = function () {
            if(self.establishmentSearchViewModel.prevEnabled()) {
                history.back();
            }
        };
        self.addParticipant = function (establishmentResultViewModel) {
            var participant = new InstitutionalAgreementParticipantModel({
                isOwner: false,
                establishment: establishmentResultViewModel
            });
            self.participants.push(participant);
            location.hash = "#/";
        };
        self.establishmentSearchViewModel.items.subscribe(function (newValue) {
            if(newValue && newValue.length) {
                for(var i = 0; i < newValue.length; i++) {
                    if(newValue[i].clickAction !== self.addParticipant) {
                        newValue[i].clickAction = self.addParticipant;
                    }
                }
            }
        });
        self.removeParticipant = function (establishmentResultViewModel, e) {
            if(confirm('Are you sure you want to remove "' + establishmentResultViewModel.translatedName() + '" as a participant from this agreement?')) {
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
        self.sammy = Sammy();
        var dataSideSwiper = 'data-side-swiper';
        self.isBound(true);
    }
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;
})
