define(["require", "exports", '../amd-modules/Establishments/SearchResult', '../amd-modules/Establishments/Search'], function(require, exports, __SearchResultModule__, __SearchModule__) {
    var SearchResultModule = __SearchResultModule__;

    var SearchModule = __SearchModule__;

    var Search = SearchModule.Search;
    var SearchResult = SearchResultModule.SearchResult;
    var InstitutionalAgreementParticipantModel = SearchModule.InstitutionalAgreementParticipantModel;
    var InstitutionalAgreementEditModel = (function () {
        function InstitutionalAgreementEditModel(initDefaultPageRoute) {
            if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
            this.initDefaultPageRoute = initDefaultPageRoute;
            var _this = this;
            this.isBound = ko.observable();
            this.back = function () {
                history.back();
            };
            this.sideSwiper = new App.SideSwiper({
                speed: '',
                frameWidth: 970,
                root: '[data-current-module=agreements]'
            });
            this.owner = new Search(false);
            this.tenantDomain = "uc.edu";
            this.establishmentSearchViewModel = new Search();
            this.x = ko.observable().publishOn("test");
            this.newParticipant = ko.observable().syncWith("participants", true);
            this.participants = ko.observableArray();
            this.trail = ko.observableArray([]);
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            this.populateParticipants();
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
            this.addNewParticipant = ko.computed(function () {
                if(_this.newParticipant() !== undefined) {
                    _this.participants.push(_this.newParticipant());
                }
            });
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
                }, this.owner),
                isNotOwner: false
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
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            this.establishmentSearchViewModel.sammy.run();
            $("#allParticipants").fadeOut(500, function () {
                $("#estSearch").fadeIn(500);
            });
            sessionStorage.setItem("Agreement", "1");
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
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
